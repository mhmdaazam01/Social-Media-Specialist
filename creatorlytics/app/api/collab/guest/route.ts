import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/collab/guest?token=xxx&type=planner|calendar|content
 * Public endpoint: resolves share token and returns read-only data.
 * No authentication required if public_enabled = true.
 * Each share token is scoped to exactly one target_type (no 'all').
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type') as 'planner' | 'calendar' | 'content' | null;

  if (!token || !type) {
    return NextResponse.json({ error: 'Missing token or type' }, { status: 400 });
  }

  // Resolve share
  const { data: share, error: shareError } = await supabase
    .from('planner_shares')
    .select('*')
    .eq('share_token', token)
    .single();

  if (shareError || !share) {
    console.error('Share fetch error:', shareError);
    return NextResponse.json({ error: shareError ? `Database error: ${shareError.message}` : 'Share token not found' }, { status: 404 });
  }

  // Strict type check: token must match exactly the requested type
  if (share.target_type !== type) {
    return NextResponse.json({ error: 'This link does not grant access to this section' }, { status: 403 });
  }

  // If not public, require auth AND verify user is a valid collaborator
  if (!share.public_enabled) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'This workspace is not public. Please log in.' }, { status: 401 });
    }

    // Verify user is an active collaborator for this workspace
    // (owner themselves are also allowed access)
    if (user.id !== share.owner_id) {
      const { data: collab } = await supabase
        .from('planner_collaborators')
        .select('id')
        .eq('owner_id', share.owner_id)
        .eq('collaborator_user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      const { data: linkMember } = await supabase
        .from('planner_share_members')
        .select('id')
        .eq('share_id', share.id)
        .eq('collaborator_user_id', user.id)
        .maybeSingle();

      if (!collab && !linkMember) {
        return NextResponse.json({ error: 'Access denied. You are not a collaborator of this workspace.' }, { status: 403 });
      }
    }
  }

  // Fetch owner profile
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', share.owner_id)
    .single();

  // Fetch data based on type
  let ideas = null;
  let events = null;
  let posts = null;

  if (type === 'planner') {
    const { data } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('user_id', share.owner_id)
      .order('created_at', { ascending: false });
    ideas = data;
  }

  if (type === 'calendar') {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', share.owner_id)
      .order('scheduled_date', { ascending: true });
    events = data;
  }

  if (type === 'content') {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', share.owner_id)
      .gte('date', oneYearAgoStr)
      .order('date', { ascending: false });
    posts = data;
  }

  // Determine user state
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const isOwner = user?.id === share.owner_id;
  
  let isCollaborator = false;
  if (isLoggedIn && !isOwner) {
    const { data: collab } = await supabase
      .from('planner_collaborators')
      .select('id')
      .eq('owner_id', share.owner_id)
      .eq('collaborator_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
      
    const { data: linkMember } = await supabase
      .from('planner_share_members')
      .select('id')
      .eq('share_id', share.id)
      .eq('collaborator_user_id', user.id)
      .maybeSingle();

    isCollaborator = !!collab || !!linkMember;
  }

  return NextResponse.json({
    share,
    owner: ownerProfile,
    ideas,
    events,
    posts,
    isLoggedIn,
    isOwner,
    isCollaborator,
  });
}
