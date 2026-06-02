<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Creatorlytics v2 — Project Context

## Stack
- **Framework**: Next.js 16.2.6 (Turbopack)
- **UI**: shadcn/ui with `@base-ui/react` (NOT Radix — `onValueChange` receives `string | null`)
- **CSS**: Tailwind v4 (`@import "tailwindcss"` in globals.css, NO `tailwind.config.ts`)
- **State**: Custom React hooks with Supabase (real-time sync)
- **Charts**: Recharts
- **Icons**: Lucide (no emoji anywhere in UI)
- **Auth**: Supabase with Google OAuth
- **Backend**: Supabase (Postgres + RLS)
- **Target**: Vercel deployment

## Auth & Data Flow
- **Authentication**: Google OAuth via Supabase
- **Session Management**: Middleware handles session refresh and redirects
- **Data Access**: Custom hooks (`usePosts`, `useGoals`, etc.) fetch from Supabase with RLS
- **User Isolation**: All data scoped to `user_id` via Row Level Security policies

## Key Files
- `lib/supabase/client.ts` — Browser Supabase client
- `lib/supabase/server.ts` — Server component Supabase client
- `lib/supabase/middleware.ts` — Session refresh logic
- `middleware.ts` — Auth guard (redirects to /login if not authenticated)
- `lib/hooks/useUser.ts` — User session + profile hook
- `lib/hooks/use*.ts` — Data hooks for each entity (posts, goals, etc.)

## Data Hooks (Replace Zustand stores)
All data now comes from Supabase via custom hooks:
- `useUser()` — user session + profile
- `usePosts()` — posts CRUD
- `useGoals()` — goals CRUD
- `useIdeas()` — content ideas CRUD
- `useEvents()` — calendar events CRUD
- `useCompetitors()` — competitors CRUD
- `usePlatforms()` — platforms CRUD
- `usePillars()` — content pillars CRUD
- `useAccounts()` — accounts CRUD

**Important**: Old Zustand stores (`lib/store/*-store.ts`) are deprecated. Use hooks instead.

## Key Design Decisions
1. **No localStorage** — all data in Supabase, synced across devices
2. **RLS enforced** — users can only access their own data
3. **Google OAuth only** — no email/password auth
4. **Auto-profile creation** — trigger creates profile on first login
5. **Middleware auth guard** — unauthenticated users redirected to /login

## Build
```powershell
npm run build
```

## Development
```powershell
npm run dev
```
Then visit http://localhost:3000 (will redirect to /login if not authenticated)
