import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { assertSafeExternalUrl, safeFetch, readSafeBody } from '@/lib/utils/url-guard';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

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

/**
 * Proxy endpoint to serve external thumbnail images.
 * Avoids CORS issues when displaying thumbnails from external sources.
 *
 * Security:
 *  - Requires authentication
 *  - SSRF guard: validates host/IP before fetching AND validates every redirect hop (P0-3)
 *  - Only proxies image/* content types
 *  - Hard size limit of 8 MB enforced via streaming (not just Content-Length header)
 *  - 5-second timeout on outbound fetch
 *  - No wildcard CORS header
 */
export async function GET(request: NextRequest) {
  // Require authentication
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // SSRF guard — validate initial URL
  try {
    await assertSafeExternalUrl(url);
  } catch {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  try {
    // P0-3: safeFetch follows redirects manually, validating each hop
    const response = await safeFetch(url, {
      maxBytes: MAX_IMAGE_BYTES,
      timeoutMs: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    // Validate content type is an image
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Remote resource is not an image' }, { status: 415 });
    }

    // Stream body with hard byte cap — prevents OOM from chunked responses
    const buffer = await readSafeBody(response, MAX_IMAGE_BYTES);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        // No Access-Control-Allow-Origin: * — restricted to same-origin callers
      },
    });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'Response too large') {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }
    // Redact internal details (P1-7)
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}
