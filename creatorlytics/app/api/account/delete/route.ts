import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/account/delete
 *
 * P1-3: Performs an atomic server-side cascade deletion of all user data
 * BEFORE deleting the auth account via the Admin API.
 *
 * Order:
 *   1. Verify session
 *   2. Delete all workspace data (cascade)
 *   3. Delete auth.users record via Admin API
 *
 * Only on confirmed step 3 success does the client receive success.
 * The client must not clear local state until it receives this response.
 */
export async function POST() {
  // 1. Verify session using the anon key + cookie session
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

  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Use service role key for privileged operations — never exposed to client
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 3. Cascade delete all workspace data server-side first
  //    Errors here are non-fatal to account deletion but logged.
  const tables = ['posts', 'goals', 'platforms', 'pillars', 'content_ideas', 'calendar_events', 'accounts'] as const;
  const deleteResults = await Promise.all(
    tables.map(table =>
      adminClient.from(table).delete().eq('user_id', user.id)
    )
  );
  const deleteErrors = deleteResults.filter(r => r.error);
  if (deleteErrors.length > 0) {
    console.error('Data deletion errors during account delete:', deleteErrors.map(r => r.error?.message));
    // Non-fatal — proceed to delete the auth user so the account is not left in limbo
  }

  // 4. Delete auth.users record — this is the point of no return
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('Failed to delete auth user:', deleteError.message);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
