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

/** GET /api/collab/collaborators — list collaborators for the authed owner */
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('planner_collaborators')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** POST /api/collab/collaborators — invite a collaborator by email */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { email, role } = body;

  if (!email || !['viewer', 'editor'].includes(role)) {
    return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  // Cannot invite yourself
  const { data: selfUser } = await supabase.auth.getUser();
  if (selfUser.user?.email === sanitizedEmail) {
    return NextResponse.json({ error: 'You cannot invite yourself' }, { status: 400 });
  }

  // Check if invited user already has an account — link user_id if found
  const { data: invitedProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', sanitizedEmail)
    .maybeSingle();

  const { data, error } = await supabase
    .from('planner_collaborators')
    .upsert(
      {
        owner_id: user.id,
        collaborator_email: sanitizedEmail,
        collaborator_user_id: invitedProfile?.id ?? null,
        role,
        status: invitedProfile ? 'active' : 'pending',
      },
      { onConflict: 'owner_id,collaborator_email', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** PATCH /api/collab/collaborators?id=xxx — update role */
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await request.json();
  const { role } = body;
  if (!['viewer', 'editor'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('planner_collaborators')
    .update({ role })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** DELETE /api/collab/collaborators?id=xxx — remove a collaborator */
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('planner_collaborators')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
