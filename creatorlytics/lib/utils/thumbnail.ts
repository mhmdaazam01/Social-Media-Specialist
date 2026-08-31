/**
 * Platform detection from URL.
 * Uses URL.hostname for exact matching to prevent subdomain/query-string spoofing.
 * (P2-9: prevents attacker.com/?instagram.com misclassification)
 *
 * Note: getThumbnailFromLink was removed — thumbnail fetching is handled
 * server-side via /api/thumbnail to avoid CORS issues and SSRF risks.
 */
const PLATFORM_HOSTNAME_MAP: { pattern: (h: string) => boolean; platform: string }[] = [
  { pattern: h => h === 'tiktok.com' || h.endsWith('.tiktok.com'), platform: 'TikTok' },
  { pattern: h => h === 'instagram.com' || h.endsWith('.instagram.com'), platform: 'Instagram' },
  { pattern: h => h === 'youtube.com' || h.endsWith('.youtube.com') || h === 'youtu.be', platform: 'YouTube' },
  { pattern: h => h === 'twitter.com' || h.endsWith('.twitter.com') || h === 'x.com' || h.endsWith('.x.com'), platform: 'Twitter' },
  { pattern: h => h === 'facebook.com' || h.endsWith('.facebook.com'), platform: 'Facebook' },
  { pattern: h => h === 'linkedin.com' || h.endsWith('.linkedin.com'), platform: 'LinkedIn' },
];

export function getPlatformFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const { pattern, platform } of PLATFORM_HOSTNAME_MAP) {
      if (pattern(hostname)) return platform;
    }
  } catch {
    // Invalid URL — not a recognisable platform
  }
  return null;
}
