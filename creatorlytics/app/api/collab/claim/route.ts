import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
 * POST /api/collab/claim
 * Called when a logged-in user visits a share link.
 * Links their user_id to the pending collaborator row (matched by email)
 * or creates a new active collaborator row using the share's default_role.
 *
 * Identity (email + user_id) is sourced from the server-side session,
 * not from client-supplied parameters — the RPC enforces this internally.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { share_token } = body;
  if (!share_token) return NextResponse.json({ error: 'Missing share_token' }, { status: 400 });

  // RPC resolves identity from auth.uid() / auth.jwt() — not from client params
  const { data, error } = await supabase.rpc('claim_workspace_share', {
    p_share_token: share_token,
  });

  if (error) {
    if (error.message.includes('Invalid share token')) return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 });
    if (error.message.includes('owner of this workspace')) return NextResponse.json({ error: 'You are the owner of this workspace' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
