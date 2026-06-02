import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Hardcoded for local dev (Turbopack bug with env vars)
const SUPABASE_URL = 'https://xrqjwzucvaiuznghswem.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWp3enVjdmFpdXpuZ2hzd2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTU0ODEsImV4cCI6MjA5NTg5MTQ4MX0.3BGFihNM8J-2xV76uqxqbCR8UJGnzjmgBhR_xvnjS80';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}
