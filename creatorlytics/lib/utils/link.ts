export const getValidHref = (link?: string): string => {
  if (!link) return '#';
  if (link.trim().startsWith('<')) {
    // Try to extract permalink from Instagram embed
    const permalinkMatch = link.match(/data-instgrm-permalink="([^"]+)"/);
    if (permalinkMatch) return permalinkMatch[1];
    // Try to extract src
    const srcMatch = link.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];
    // Try to extract href
    const hrefMatch = link.match(/href="([^"]+)"/);
    if (hrefMatch) return hrefMatch[1];
  }
  return link;
};
