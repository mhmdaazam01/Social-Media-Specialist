/**
 * Get platform from URL.
 * Note: getThumbnailFromLink was removed — thumbnail fetching is handled
 * server-side via /api/thumbnail to avoid CORS issues and SSRF risks.
 */
export function getPlatformFromUrl(url: string): string | null {
  if (!url) return null;

  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  if (url.includes('facebook.com')) return 'Facebook';

  return null;
}
