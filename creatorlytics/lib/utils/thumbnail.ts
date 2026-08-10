/**
 * Extract thumbnail URL from social media links
 */

export async function getThumbnailFromLink(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    // TikTok
    if (url.includes('tiktok.com')) {
      return await getTikTokThumbnail(url);
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      return await getInstagramThumbnail(url);
    }
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return getYouTubeThumbnail(url);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return null;
  }
}

async function getTikTokThumbnail(url: string): Promise<string | null> {
  try {
    // TikTok oEmbed API
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error('TikTok thumbnail error:', error);
    return null;
  }
}

async function getInstagramThumbnail(url: string): Promise<string | null> {
  try {
    // Instagram oEmbed API
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=your_token`;
    
    // Note: Instagram oEmbed requires access token
    // Alternative: Try to parse from meta tags
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract og:image from meta tags
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Instagram thumbnail error:', error);
    return null;
  }
}

function getYouTubeThumbnail(url: string): string | null {
  try {
    // Extract video ID from YouTube URL
    let videoId = null;
    
    if (url.includes('youtube.com')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return null;
  } catch (error) {
    console.error('YouTube thumbnail error:', error);
    return null;
  }
}

/**
 * Get platform from URL
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
