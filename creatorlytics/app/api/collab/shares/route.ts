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

/** GET /api/collab/shares — get all shares for the authed user */
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('planner_shares')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** POST /api/collab/shares — create or update a share for a target_type */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { target_type, default_role, public_enabled } = body;

  if (!['planner', 'calendar', 'content'].includes(target_type)) {
    return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 });
  }

  // Check if share already exists for this owner + target_type
  const { data: existing } = await supabase
    .from('planner_shares')
    .select('*')
    .eq('owner_id', user.id)
    .eq('target_type', target_type)
    .maybeSingle();

  let data;
  let error;

  if (existing) {
    // Update existing share
    const result = await supabase
      .from('planner_shares')
      .update({ default_role, public_enabled, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .eq('owner_id', user.id)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insert new share with generated secure token
    const crypto = await import('crypto');
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(24).toString('base64url');
    const share_token = `${timestamp}_${random}`;
    const result = await supabase
      .from('planner_shares')
      .insert({ owner_id: user.id, target_type, default_role, public_enabled, share_token })
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('SHARE UPSERT ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

/** DELETE /api/collab/shares?id=xxx — delete a share */
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('planner_shares')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
