import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        // Redirect to dashboard
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error('Auth callback error:', error);
      }
    }

    // Return to login if no code or error
    return NextResponse.redirect(`${origin}/login`);
  } catch (error) {
    console.error('Auth callback exception:', error);
    return NextResponse.redirect(`${request.url.split('/auth')[0]}/login`);
  }
}
