/**
 * SSRF guard — validates that a user-supplied URL points to a safe
 * external host before the server makes any outbound fetch().
 *
 * Blocks:
 *   - Non-HTTP/S protocols (file:, ftp:, data:, …)
 *   - Loopback addresses (127.x.x.x, ::1)
 *   - RFC-1918 private ranges (10.x, 172.16-31.x, 192.168.x)
 *   - Link-local / cloud metadata endpoint (169.254.x.x, fe80::)
 *   - ULA IPv6 (fc00::/7)
 *   - Hostnames that resolve to any of the above via DNS
 *
 * safeFetch wraps every outbound HTTP call with:
 *   - Manual redirect following (validates each hop)
 *   - Max redirect hops cap
 *   - Hard response byte limit
 *   - Per-hop timeout
 */

import dns from 'dns/promises';
import { isIP } from 'net';

// --------------------------------------------------------------------------
// IP safety checks
// --------------------------------------------------------------------------

function isPrivateOrReservedIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 127) return true;                          // loopback
    if (a === 10) return true;                           // RFC-1918
    if (a === 0) return true;                            // 0.0.0.0
    if (a === 172 && b >= 16 && b <= 31) return true;   // RFC-1918
    if (a === 192 && b === 168) return true;             // RFC-1918
    if (a === 169 && b === 254) return true;             // link-local / IMDS
    return false;
  }

  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true;                    // loopback
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA
    if (lower.startsWith('fe80')) return true;           // link-local
    return false;
  }

  return false;
}

/**
 * Throws an Error if `rawUrl` is not a safe external HTTP/S URL.
 * Returns the parsed URL object on success.
 */
export async function assertSafeExternalUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Protocol not allowed');
  }

  const hostname = url.hostname.toLowerCase();

  // Reject plain banned names
  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    throw new Error('Host not allowed');
  }

  // If hostname is already an IP, validate it directly
  if (isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new Error('Host not allowed');
    }
    return url;
  }

  // Otherwise resolve via DNS and check the resulting address
  try {
    const { address } = await dns.lookup(hostname);
    if (isPrivateOrReservedIp(address)) {
      throw new Error('Host not allowed');
    }
  } catch (err) {
    if ((err as Error).message === 'Host not allowed') throw err;
    // DNS lookup failure — treat as unsafe
    throw new Error('Host resolution failed');
  }

  return url;
}

// --------------------------------------------------------------------------
// safeFetch — P0-3 fix: manual redirect following with per-hop validation
// --------------------------------------------------------------------------

const MAX_REDIRECT_HOPS = 5;

export interface SafeFetchOptions {
  /** Maximum bytes to buffer. Exceeding this throws. Default: 8 MB */
  maxBytes?: number;
  /** Per-request timeout in ms. Default: 5000 */
  timeoutMs?: number;
  /** Additional request headers */
  headers?: Record<string, string>;
}

/**
 * SSRF-safe fetch:
 *   1. Validates the initial URL with assertSafeExternalUrl.
 *   2. Follows redirects manually (max MAX_REDIRECT_HOPS).
 *   3. Validates every redirect Location header before following.
 *   4. Returns the final Response with the body available for streaming.
 *   5. Throws if byte limit is exceeded during body reads.
 */
export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const {
    maxBytes = 8 * 1024 * 1024,
    timeoutMs = 5000,
    headers = {},
  } = options;

  let currentUrl = rawUrl;
  let hops = 0;

  while (hops <= MAX_REDIRECT_HOPS) {
    // Validate current URL before fetching
    await assertSafeExternalUrl(currentUrl);

    const response = await fetch(currentUrl, {
      redirect: 'manual',           // Never follow redirects automatically
      signal: AbortSignal.timeout(timeoutMs),
      headers,
    });

    // Handle redirects
    const isRedirect = response.status >= 300 && response.status < 400;
    if (isRedirect) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Redirect with no Location header');
      }
      // Resolve relative redirects against current URL
      const next = new URL(location, currentUrl).toString();
      currentUrl = next;
      hops++;
      continue;
    }

    // Non-redirect — enforce byte limit on returned response
    if (maxBytes > 0) {
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > maxBytes) {
        throw new Error('Response too large');
      }
    }

    return response;
  }

  throw new Error('Too many redirects');
}

/**
 * Helper: read the full body of a safeFetch response with a hard byte cap.
 * Streams the response to avoid buffering more than maxBytes.
 */
export async function readSafeBody(
  response: Response,
  maxBytes = 8 * 1024 * 1024
): Promise<ArrayBuffer> {
  const reader = response.body?.getReader();
  if (!reader) {
    return new ArrayBuffer(0);
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        throw new Error('Response too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}
