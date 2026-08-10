import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log('Thumbnail API called with URL:', url);

  try {
    let thumbnailUrl = null;

    // TikTok
    if (url.includes('tiktok.com')) {
      console.log('Detected TikTok URL');
      thumbnailUrl = await getTikTokThumbnail(url);
    }
    // Instagram
    else if (url.includes('instagram.com')) {
      console.log('Detected Instagram URL');
      thumbnailUrl = await getInstagramThumbnail(url);
    }
    // YouTube
    else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      console.log('Detected YouTube URL');
      thumbnailUrl = getYouTubeThumbnail(url);
    }

    // Generic fallback: try Open Graph scraping
    if (!thumbnailUrl) {
      console.log('Trying generic OG image scraping');
      thumbnailUrl = await getGenericOGImage(url);
    }

    if (thumbnailUrl) {
      console.log('Successfully fetched thumbnail:', thumbnailUrl);
      return NextResponse.json({ thumbnail: thumbnailUrl, success: true });
    }

    console.log('Could not fetch thumbnail for URL:', url);
    return NextResponse.json({ error: 'Could not fetch thumbnail' }, { status: 404 });
  } catch (error) {
    console.error('Thumbnail fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 });
  }
}

async function getTikTokThumbnail(url: string): Promise<string | null> {
  try {
    // Clean up TikTok URL - remove query parameters for oEmbed
    let cleanUrl = url.trim().split('?')[0];
    
    console.log('TikTok URL cleaned:', cleanUrl);
    
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
    console.log('TikTok oEmbed URL:', oembedUrl);
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('TikTok oEmbed failed:', response.status, await response.text());
      return null;
    }
    
    const data = await response.json();
    console.log('TikTok oEmbed response:', data);
    return data.thumbnail_url || null;
  } catch (error) {
    console.error('TikTok thumbnail error:', error);
    return null;
  }
}

async function getInstagramThumbnail(url: string): Promise<string | null> {
  try {
    // Clean up Instagram URL and ensure it has trailing slash for oEmbed
    let cleanUrl = url.trim();
    
    // Remove query parameters
    cleanUrl = cleanUrl.split('?')[0];
    
    // Ensure trailing slash for /p/, /reel/, /tv/ URLs
    if (cleanUrl.match(/instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+$/)) {
      cleanUrl = cleanUrl + '/';
    }
    
    console.log('Instagram URL cleaned:', cleanUrl);
    
    // Strategy 1: Try Instagram oEmbed API (no auth required, works for public posts)
    try {
      const oembedApiUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      console.log('Instagram oEmbed URL:', oembedApiUrl);
      
      const response = await fetch(oembedApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Instagram oEmbed response:', data);
        if (data.thumbnail_url) {
          return data.thumbnail_url;
        }
      } else {
        console.log('Instagram oEmbed failed with status:', response.status, await response.text());
      }
    } catch (oembedError) {
      console.log('Instagram oEmbed error:', oembedError);
    }

    // Strategy 2: Scrape og:image from the page with full browser-like headers
    console.log('Trying to scrape Instagram page...');
    try {
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Try og:image
        const ogImageMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i) 
          || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
        if (ogImageMatch?.[1]) {
          console.log('Found og:image:', ogImageMatch[1]);
          return ogImageMatch[1];
        }
        
        // Try twitter:image
        const twitterImageMatch = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i)
          || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image"/i);
        if (twitterImageMatch?.[1]) {
          console.log('Found twitter:image:', twitterImageMatch[1]);
          return twitterImageMatch[1];
        }
        
        console.log('No og:image or twitter:image found in HTML');
      } else {
        console.log('Failed to fetch Instagram page:', response.status);
      }
    } catch (scrapeError) {
      console.log('Instagram scraping error:', scrapeError);
    }

    // Strategy 3: Direct media URL (works for some public posts)
    const shortcode = extractInstagramShortcode(url);
    if (shortcode) {
      const mediaUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
      console.log('Trying direct media URL:', mediaUrl);
      return mediaUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Instagram thumbnail error:', error);
    return null;
  }
}

function extractInstagramShortcode(url: string): string | null {
  // Match /p/SHORTCODE/, /reel/SHORTCODE/, /tv/SHORTCODE/
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match?.[1] || null;
}

function getYouTubeThumbnail(url: string): string | null {
  try {
    let videoId = null;
    
    if (url.includes('youtube.com')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
      // Handle /shorts/ URLs
      if (!videoId) {
        const shortsMatch = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]+)/);
        videoId = shortsMatch?.[1] || null;
      }
    } else if (url.includes('youtu.be')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0].split('/')[0];
      }
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

async function getGenericOGImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Try og:image
    const ogMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
    if (ogMatch?.[1]) return ogMatch[1];
    
    // Try twitter:image
    const twMatch = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image"/i);
    if (twMatch?.[1]) return twMatch[1];
    
    return null;
  } catch {
    return null;
  }
}
