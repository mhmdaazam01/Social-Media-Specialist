export const getValidHref = (link?: string): string => {
  if (!link) return '#';
  const trimmed = link.trim();
  if (trimmed.startsWith('<')) {
    // TikTok embed: <blockquote class="tiktok-embed" cite="URL">
    const tiktokCite = trimmed.match(/cite="([^"]+)"/);
    if (tiktokCite) return tiktokCite[1];

    // Instagram embed: data-instgrm-permalink="URL"
    const permalinkMatch = trimmed.match(/data-instgrm-permalink="([^"]+)"/);
    if (permalinkMatch) return permalinkMatch[1];

    // YouTube / generic iframe: <iframe src="URL">
    const iframeSrc = trimmed.match(/<iframe[^>]+src="([^"]+)"/i);
    if (iframeSrc) {
      // Convert youtube embed URL to watch URL if needed
      const src = iframeSrc[1];
      const ytEmbed = src.match(/youtube\.com\/embed\/([^?&"]+)/);
      if (ytEmbed) return `https://www.youtube.com/watch?v=${ytEmbed[1]}`;
      return src;
    }

    // Generic src or href fallback
    const srcMatch = trimmed.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];
    const hrefMatch = trimmed.match(/href="([^"]+)"/);
    if (hrefMatch) return hrefMatch[1];

    // If no URL could be extracted, return '#' to avoid dumping raw HTML
    return '#';
  }
  return link;
};
