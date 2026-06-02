import { createBrowserClient } from '@supabase/ssr';

// Hardcoded for local dev (Turbopack bug with env vars)
// In production (Vercel), manually update these or use build-time replacement
const SUPABASE_URL = 'https://xrqjwzucvaiuznghswem.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWp3enVjdmFpdXpuZ2hzd2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTU0ODEsImV4cCI6MjA5NTg5MTQ4MX0.3BGFihNM8J-2xV76uqxqbCR8UJGnzjmgBhR_xvnjS80';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
