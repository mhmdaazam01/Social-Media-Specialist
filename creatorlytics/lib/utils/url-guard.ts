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
 */

import dns from 'dns/promises';
import { isIP } from 'net';

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

  return false; // not a recognisable IP format — let URL() catch it
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
