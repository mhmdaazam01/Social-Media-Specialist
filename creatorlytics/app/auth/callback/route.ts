import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const header = request.headers.get('cookie') || '';
    const jar: Record<string, string> = {};

    header.split(';').filter(Boolean).forEach(c => {
      const [n, ...v] = c.trim().split('=');
      jar[n] = decodeURIComponent(v.join('='));
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => Object.entries(jar).map(([name, value]) => ({ name, value })),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => { jar[name] = value; });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      Object.entries(jar).forEach(([name, value]) => {
        response.cookies.set(name, value, {
          path: '/', httpOnly: true, secure: true, sameSite: 'lax',
        });
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
