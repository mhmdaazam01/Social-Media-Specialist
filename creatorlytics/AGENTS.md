<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Creatorlytics v2 — Project Context

## Stack
- **Framework**: Next.js 16.2.6 (Turbopack)
- **UI**: shadcn/ui with `@base-ui/react` (NOT Radix — `onValueChange` receives `string | null`)
- **CSS**: Tailwind v4 (`@import "tailwindcss"` in globals.css, NO `tailwind.config.ts`)
- **State**: Zustand with persist middleware (key prefix `cl-v2:*`)
- **Charts**: Recharts
- **Icons**: Lucide (no emoji anywhere in UI)
- **Auth**: Supabase with `@supabase/ssr` (Google OAuth)
- **Backend**: Supabase (Postgres + RLS)
- **Target**: Vercel deployment

## Auth Infrastructure (Phase 2 — complete, waiting for Supabase project)
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server component client
- `lib/supabase/middleware.ts` — middleware client (session refresh)
- `middleware.ts` (project root) — calls `updateSession`, matcher excludes static files
- `app/auth/callback/route.ts` — OAuth redirect handler
- `lib/hooks/useUser.ts` — `useUser()` hook: returns `{ user, profile, loading, signOut }`
- `lib/utils/migration.ts` — v1 localStorage → Supabase batch import
- `.env.local` — template with placeholder keys
- `supabase-schema.sql` — complete schema (9 tables + RLS + auto-profile trigger)

## Key Design Decisions
1. Zustand stores kept for now; data sync to Supabase is Phase 3
2. middleware.ts only refreshes session (no redirect yet) — full auth guard added after Google login verified
3. Login page has both "Masuk dengan Google" and "Mode Lokal" options
4. Sidebar uses `useUser()` to show avatar/name; falls back to settings display_name

## Next Steps (user action required)
1. Create Supabase project → copy URL + anon key
2. Enable Google OAuth in Supabase Auth dashboard
3. Run `supabase-schema.sql` in Supabase SQL Editor
4. Fill `.env.local` with real keys
5. Deploy to Vercel (set env vars in Vercel dashboard — `.env*` is gitignored)
6. Wire Zustand stores to Supabase hooks (Phase 3)

## Build
```powershell
npm run build   # 0 errors, 12 routes + proxy (middleware)
```
