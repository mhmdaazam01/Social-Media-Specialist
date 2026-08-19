import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Prevent DOS from extremely long URLs
  if (url.length > 2000) {
    return NextResponse.json({ error: 'URL too long' }, { status: 400 });
  }

  try {
    let thumbnailUrl = null;

    // TikTok
    if (url.includes('tiktok.com')) {
      thumbnailUrl = await getTikTokThumbnail(url);
    }
    // Instagram
    else if (url.includes('instagram.com')) {
      thumbnailUrl = await getInstagramThumbnail(url);
    }
    // YouTube
    else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      thumbnailUrl = getYouTubeThumbnail(url);
    }

    // Generic fallback: try Open Graph scraping
    if (!thumbnailUrl) {
      thumbnailUrl = await getGenericOGImage(url);
    }

    if (thumbnailUrl) {
      return NextResponse.json({ thumbnail: thumbnailUrl, success: true });
    }

    return NextResponse.json({ error: 'Could not fetch thumbnail' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 });
  }
}

async function getTikTokThumbnail(url: string): Promise<string | null> {
  try {
    // Clean up TikTok URL - remove query parameters for oEmbed
    const cleanUrl = url.trim().split('?')[0];
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;

    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.thumbnail_url || null;
  } catch {
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

    // Strategy 1: Try Instagram oEmbed API (no auth required, works for public posts)
    try {
      const oembedApiUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`;

      const response = await fetch(oembedApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail_url) {
          return data.thumbnail_url;
        }
      }
    } catch {
      // oEmbed not available, try scraping
    }

    // Strategy 2: Scrape og:image from the page with full browser-like headers
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
        if (ogImageMatch?.[1]) return ogImageMatch[1];

        // Try twitter:image
        const twitterImageMatch = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i)
          || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image"/i);
        if (twitterImageMatch?.[1]) return twitterImageMatch[1];
      }
    } catch {
      // Scraping failed
    }

    // Strategy 3: Direct media URL (works for some public posts)
    const shortcode = extractInstagramShortcode(url);
    if (shortcode) {
      return `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    }

    return null;
  } catch {
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
  } catch {
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
