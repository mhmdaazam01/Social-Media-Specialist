/**
 * Safe URL extraction from post.link and idea.ref_links fields.
 *
 * Handles three input shapes:
 *   1. Plain URL string   → validated and returned as-is (or with https:// prepended)
 *   2. Embed HTML string  → extracts the first semantically meaningful URL
 *   3. Anything else      → returns '#' as a safe fallback
 *
 * Security guarantee: only http: and https: protocols are ever returned.
 * Any javascript:, data:, vbscript:, etc. → '#'.
 */

function isSafeHttpUrl(candidate: string): boolean {
  try {
    const u = new URL(candidate);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export const getValidHref = (link?: string): string => {
  if (!link) return '#';
  let candidate = link.trim();

  if (candidate.startsWith('<')) {
    // TikTok embed: <blockquote class="tiktok-embed" cite="URL">
    const tiktokCite = candidate.match(/cite="([^"]+)"/);

    // Instagram embed: data-instgrm-permalink="URL"
    const permalinkMatch = candidate.match(/data-instgrm-permalink="([^"]+)"/);

    // YouTube / generic iframe: <iframe src="URL">
    const iframeSrc = candidate.match(/<iframe[^>]+src="([^"]+)"/i);

    // Generic src (skip embed.js scripts)
    const srcMatches = Array.from(candidate.matchAll(/src="([^"]+)"/g));
    const validSrc = srcMatches.find(m => !m[1].includes('embed.js'));

    // Generic href fallback
    const hrefMatch = candidate.match(/href="([^"]+)"/);

    if (tiktokCite) {
      candidate = tiktokCite[1];
    } else if (permalinkMatch) {
      candidate = permalinkMatch[1];
    } else if (iframeSrc) {
      const ytEmbed = iframeSrc[1].match(/youtube\.com\/embed\/([^?&"]+)/);
      candidate = ytEmbed
        ? `https://www.youtube.com/watch?v=${ytEmbed[1]}`
        : iframeSrc[1];
    } else if (validSrc) {
      candidate = validSrc[1];
    } else if (hrefMatch) {
      candidate = hrefMatch[1];
    } else {
      return '#';
    }
  } else if (!/^https?:\/\//i.test(candidate)) {
    // Plain string without protocol — assume https
    candidate = `https://${candidate}`;
  }

  return isSafeHttpUrl(candidate) ? candidate : '#';
};
