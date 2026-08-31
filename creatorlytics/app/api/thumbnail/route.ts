import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { assertSafeExternalUrl, safeFetch } from '@/lib/utils/url-guard';

async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Prevent DoS from extremely long URLs
  if (url.length > 2000) {
    return NextResponse.json({ error: 'URL too long' }, { status: 400 });
  }

  // Require authentication
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // SSRF guard — validate initial URL before any outbound fetch
  try {
    await assertSafeExternalUrl(url);
  } catch {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  // P2-9: parse hostname for exact platform matching
  let thumbnailUrl: string | null = null;
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
      thumbnailUrl = await getTikTokThumbnail(url);
    } else if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) {
      thumbnailUrl = await getInstagramThumbnail(url);
    } else if (
      hostname === 'youtube.com' || hostname.endsWith('.youtube.com') ||
      hostname === 'youtu.be'
    ) {
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
    // Redact internal error details (P1-7)
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 });
  }
}

async function getTikTokThumbnail(url: string): Promise<string | null> {
  try {
    const cleanUrl = url.trim().split('?')[0];
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;

    // P0-3: use safeFetch — validates the oEmbed URL itself and any redirects
    const response = await safeFetch(oembedUrl, {
      timeoutMs: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
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
    let cleanUrl = url.trim().split('?')[0];

    if (cleanUrl.match(/instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+$/)) {
      cleanUrl = cleanUrl + '/';
    }

    // Strategy 1: Instagram oEmbed API
    try {
      const oembedApiUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const response = await safeFetch(oembedApiUrl, {
        timeoutMs: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail_url) return data.thumbnail_url;
      }
    } catch {
      // oEmbed not available
    }

    // Strategy 2: Scrape og:image (P0-3: safeFetch follows redirects safely)
    try {
      const response = await safeFetch(cleanUrl, {
        timeoutMs: 5000,
        maxBytes: 512 * 1024, // 512KB cap for HTML scraping
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (response.ok) {
        const html = await response.text();
        const ogImageMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
          || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
        if (ogImageMatch?.[1]) return ogImageMatch[1];

        const twitterImageMatch = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i)
          || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image"/i);
        if (twitterImageMatch?.[1]) return twitterImageMatch[1];
      }
    } catch {
      // Scraping failed
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    let videoId: string | null = null;

    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      videoId = urlObj.searchParams.get('v');
      if (!videoId) {
        const shortsMatch = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]+)/);
        videoId = shortsMatch?.[1] || null;
      }
    } else if (hostname === 'youtu.be') {
      const parts = urlObj.pathname.split('/');
      videoId = parts[1] || null;
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
    // P0-3: safeFetch with 512KB HTML cap
    const response = await safeFetch(url, {
      timeoutMs: 5000,
      maxBytes: 512 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    const ogMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
    if (ogMatch?.[1]) return ogMatch[1];

    const twMatch = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image"/i);
    if (twMatch?.[1]) return twMatch[1];

    return null;
  } catch {
    return null;
  }
}
