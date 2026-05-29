# Creatorlytics v2 — SaaS Migration Planner
**Dari single HTML file → Next.js + Supabase Auth + Vercel**
**Update:** Sistem anonim diganti dengan Google Auth wajib login. Gratis untuk semua user.

---

## Konteks Proyek

### Produk
Creatorlytics adalah social media analytics dashboard untuk kreator konten Indonesia.
Fitur utama: input post manual, analytics (ER, reach, engagement), goals tracking, content planner, kalender konten, kompetitor tracking, laporan PDF, insight engine otomatis.

### Kondisi Sekarang (v1)
- Single HTML file, ~12.566 baris, 608KB
- Vanilla JS, CSS custom properties
- Data di `localStorage` key `smanalytics:v7`
- Dark/light mode via `data-theme` pada `<html>`
- Bahasa UI: Indonesia
- Sudah ada: CONFIG constants, isDirty system, safeGet/safeSet, validateAppData, showToast, keyboard shortcuts, swipe gesture, auto-backup reminder, skeleton loading, page transitions

### Target (v2)
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth Google + database)
- Vercel (deploy)
- **Login wajib dengan Google** — data sync otomatis cross-device
- **Gratis semua fitur** → monetisasi nanti setelah traction

---

## Stack

```
Framework   : Next.js 14 (App Router)
Language    : TypeScript
Styling     : Tailwind CSS + shadcn/ui
Auth        : Supabase Auth (Google OAuth)
Database    : Supabase (PostgreSQL)
Charts      : Recharts
Icons       : Lucide React
Deploy      : Vercel
AI Tools    : Claude / Cursor
```

---

## Sistem Auth: Google Login Wajib

### Cara Kerja

```
User buka app
  → Belum login? → Redirect ke /login
  → Halaman login: tombol "Masuk dengan Google"
  → Klik → Google OAuth popup
  → Berhasil → Supabase buat session otomatis
  → Redirect ke /dashboard
  → Semua data user terikat ke user_id dari Google account mereka
  → Buka di HP dengan akun Google yang sama → data sama persis
  → Login dengan akun Google berbeda → data berbeda (isolated)
```

### Kenapa Ini Lebih Baik dari Anonymous System

| Aspek | Anonymous (lama) | Google Auth (baru) |
|---|---|---|
| Cross-device sync | ❌ Tidak bisa | ✅ Otomatis |
| Data hilang kalau clear browser | ❌ Hilang | ✅ Aman di Supabase |
| Identifikasi user | UUID random | Email Google (unik) |
| Security | Lemah (siapa saja bisa akses kalau tau UUID) | Kuat (RLS berbasis auth) |
| Kompleksitas implementasi | Lebih simpel | Sedikit lebih kompleks (tapi Supabase handle-nya) |

### Flow Auth di Kode

```typescript
// app/login/page.tsx
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-2xl font-bold">Creatorlytics</h1>
        <p className="text-muted-foreground">Analytics dashboard untuk kreator Indonesia</p>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 border rounded-lg hover:bg-gray-50 font-medium"
        >
          <GoogleIcon />
          Masuk dengan Google
        </button>
        <p className="text-xs text-muted-foreground">
          Gratis. Data kamu tersimpan aman dan sync di semua device.
        </p>
      </div>
    </div>
  );
}
```

```typescript
// app/auth/callback/route.ts
// Supabase butuh endpoint ini untuk handle OAuth redirect
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

```typescript
// middleware.ts — proteksi semua route, redirect ke /login kalau belum auth
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Kalau belum login dan bukan di halaman publik → redirect ke /login
  const publicRoutes = ['/login', '/auth/callback'];
  if (!session && !publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Kalau sudah login dan buka /login → redirect ke /dashboard
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
```

---

## Schema Database Supabase

> **Perubahan utama dari versi lama:** Semua `anon_id TEXT` diganti `user_id UUID` yang merujuk ke `auth.users` bawaan Supabase. Row Level Security sekarang benar-benar ketat berbasis auth.

```sql
-- ══ TABEL 1: User Profiles (extend dari auth.users) ══
-- Dibuat otomatis saat user pertama login via trigger
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  display_name TEXT,
  niche       TEXT DEFAULT '',
  er_mode     TEXT DEFAULT 'impression',
  theme       TEXT DEFAULT 'dark',
  created_at  TIMESTAMPTZ DEFAULT now(),
  last_seen   TIMESTAMPTZ DEFAULT now()
);

-- Trigger: otomatis buat profile saat user baru register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ══ TABEL 2: Accounts (nama akun sosmed per user) ══
CREATE TABLE accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 3: Platforms (platform kustom per user) ══
CREATE TABLE platforms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT '📌'
);

-- ══ TABEL 4: Posts (data utama) ══
CREATE TABLE posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account          TEXT NOT NULL,
  platform         TEXT NOT NULL,
  date             DATE,
  name             TEXT DEFAULT '',
  reach            INT DEFAULT 0,
  impression       INT DEFAULT 0,
  like             INT DEFAULT 0,
  comment          INT DEFAULT 0,
  share            INT DEFAULT 0,
  save             INT DEFAULT 0,
  repost           INT DEFAULT 0,
  followers_gained INT DEFAULT 0,
  profile_visit    INT DEFAULT 0,
  pillar           TEXT DEFAULT 'other',
  format           TEXT DEFAULT '',
  caption_len      INT DEFAULT 0,
  link             TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Index untuk query cepat
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_date_idx ON posts(date DESC);
CREATE INDEX posts_platform_idx ON posts(platform);
CREATE INDEX posts_user_date_idx ON posts(user_id, date DESC);

-- ══ TABEL 5: Goals ══
CREATE TABLE goals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  emoji      TEXT DEFAULT '🎯',
  target     NUMERIC DEFAULT 0,
  platform   TEXT DEFAULT 'all',
  metric     TEXT NOT NULL,
  month      INT,
  year       INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 6: Content Ideas (Planner) ══
CREATE TABLE content_ideas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  desc       TEXT DEFAULT '',
  platform   TEXT DEFAULT '',
  pillar     TEXT DEFAULT '',
  format     TEXT DEFAULT '',
  status     TEXT DEFAULT 'idea',
  priority   TEXT DEFAULT 'med',
  tags       TEXT[] DEFAULT '{}',
  brief      JSONB DEFAULT '{}',
  ref_links  JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 7: Calendar Events ══
CREATE TABLE calendar_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  platform       TEXT DEFAULT '',
  account        TEXT DEFAULT '',
  pillar         TEXT DEFAULT '',
  format         TEXT DEFAULT '',
  scheduled_date DATE,
  scheduled_time TEXT DEFAULT '',
  status         TEXT DEFAULT 'idea',
  idea_id        UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  notes          TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 8: Competitors ══
CREATE TABLE competitors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  platform    TEXT NOT NULL,
  followers   INT DEFAULT 0,
  avg_reach   INT DEFAULT 0,
  avg_er      NUMERIC DEFAULT 0,
  post_freq   NUMERIC DEFAULT 0,
  notes       TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ══ TABEL 9: Pillars ══
CREATE TABLE pillars (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id  TEXT NOT NULL,
  label      TEXT NOT NULL,
  emoji      TEXT DEFAULT '📌',
  color      TEXT DEFAULT '#6B7280',
  bg         TEXT DEFAULT '#F9FAFB'
);

-- ══ ROW LEVEL SECURITY — Proper Auth-Based ══
-- Aktifkan RLS di semua tabel
ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms       ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars          ENABLE ROW LEVEL SECURITY;

-- Policy template: user hanya bisa akses data miliknya sendiri
-- Terapkan ini ke SEMUA tabel

-- Contoh untuk tabel posts:
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Ulangi 4 policy yang sama untuk: accounts, platforms, goals,
-- content_ideas, calendar_events, competitors, pillars, user_profiles
-- Ganti nama policy dan nama tabel saja, sisanya identik.
```

---

## Struktur Folder Lengkap

```
creatorlytics/
│
├── app/
│   ├── layout.tsx                ← Root layout: fonts, theme, providers
│   ├── page.tsx                  ← Redirect ke /dashboard
│   ├── globals.css               ← Tailwind base + CSS variables
│   │
│   ├── login/
│   │   └── page.tsx              ← Halaman login Google (publik, no auth needed)
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          ← Handler OAuth callback dari Supabase
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   ├── content/
│   │   └── page.tsx
│   ├── goals/
│   │   └── page.tsx
│   ├── report/
│   │   └── page.tsx
│   ├── planner/
│   │   └── page.tsx
│   ├── calendar/
│   │   └── page.tsx
│   └── competitor/
│       └── page.tsx
│
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx         ← UI halaman login
│   │   └── UserMenu.tsx          ← Avatar + nama + tombol logout di sidebar
│   │
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── InsightEngine.tsx
│   │   ├── GoalProgress.tsx
│   │   ├── TopContent.tsx
│   │   └── WeeklyNarrative.tsx
│   │
│   ├── analytics/
│   │   ├── TrendChart.tsx
│   │   ├── TopContentTable.tsx
│   │   ├── PillarChart.tsx
│   │   └── AnalyticsFilter.tsx
│   │
│   ├── posts/
│   │   ├── PostModal.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostRow.tsx
│   │   ├── ContentTimeline.tsx
│   │   └── CSVImport.tsx
│   │
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   └── GoalModal.tsx
│   │
│   ├── report/
│   │   ├── ReportSlide.tsx
│   │   └── ReportExport.tsx
│   │
│   ├── planner/
│   │   ├── IdeaCard.tsx
│   │   ├── IdeaModal.tsx
│   │   └── KanbanBoard.tsx
│   │
│   ├── calendar/
│   │   ├── CalendarGrid.tsx
│   │   └── CalEventModal.tsx
│   │
│   ├── competitor/
│   │   ├── CompetitorCard.tsx
│   │   └── CompetitorModal.tsx
│   │
│   └── ui/                       ← shadcn/ui components
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← createClientComponentClient (browser)
│   │   ├── server.ts             ← createServerComponentClient (SSR)
│   │   └── middleware.ts         ← createMiddlewareClient
│   │
│   ├── hooks/
│   │   ├── useUser.ts            ← Get current auth user + profile
│   │   ├── usePosts.ts           ← CRUD posts
│   │   ├── useAnalytics.ts       ← Aggregated data
│   │   ├── useGoals.ts           ← Goals CRUD
│   │   ├── usePlanner.ts         ← Content ideas
│   │   └── useSettings.ts        ← User preferences
│   │
│   ├── utils/
│   │   ├── analytics.ts          ← calcER, fmt, erLevel (port dari v1)
│   │   ├── formatting.ts
│   │   ├── insights.ts
│   │   ├── export.ts
│   │   └── migration.ts          ← Import dari v1 localStorage
│   │
│   └── constants.ts
│
├── middleware.ts                  ← Auth guard: redirect ke /login kalau belum login
├── types/
│   └── index.ts
│
├── public/
│   └── logo.svg
│
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## TypeScript Types (Updated)

```typescript
// types/index.ts

export interface UserProfile {
  id: string;           // = auth.users.id (UUID dari Google)
  email: string;        // email Google user
  display_name: string; // nama dari Google atau custom
  niche: string;
  er_mode: 'impression' | 'reach' | 'followers';
  theme: 'dark' | 'light';
}

export interface Post {
  id: string;
  user_id: string;      // UUID auth user — BUKAN anon_id lagi
  account: string;
  platform: string;
  date: string;
  name: string;
  reach: number;
  impression: number;
  like: number;
  comment: number;
  share: number;
  save: number;
  repost: number;
  followers_gained: number;
  profile_visit: number;
  pillar: string;
  format: string;
  caption_len: number;
  link: string;
  created_at: string;
}

// ... Goal, ContentIdea, Competitor, Pillar sama seperti sebelumnya
// tapi ganti anon_id: string → user_id: string
```

---

## Hook Utama: useUser

```typescript
// lib/hooks/useUser.ts
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';

export function useUser() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return { user, profile, loading, signOut };
}
```

---

## Migrasi Data dari v1 (localStorage → Supabase)

Saat user v1 pertama login ke v2, tawarkan import data lama mereka.

```typescript
// lib/utils/migration.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function migrateFromV1(userId: string): Promise<{
  success: boolean;
  postCount: number;
  error?: string;
}> {
  const supabase = createClientComponentClient();

  try {
    // Cek apakah sudah pernah migrate
    const alreadyMigrated = localStorage.getItem('cl-v1-migrated');
    if (alreadyMigrated) return { success: true, postCount: 0 };

    // Cek apakah ada data v1
    const raw = localStorage.getItem('smanalytics:v7');
    if (!raw) return { success: true, postCount: 0 };

    const v1Data = JSON.parse(raw);
    if (!v1Data.months?.length) return { success: true, postCount: 0 };

    // Flatten semua posts dari struktur v1
    const posts: Omit<Post, 'id' | 'created_at'>[] = [];

    for (const month of v1Data.months) {
      for (const week of month.weeks || []) {
        for (const account of v1Data.accounts || []) {
          const accData = week.data?.[account];
          if (!accData) continue;

          // Semua platform
          const platformMap = [
            { key: 'ttPosts', id: 'tt' },
            { key: 'igPosts', id: 'ig' },
            // tambahkan platform lain kalau ada
          ];

          for (const { key, id: platformId } of platformMap) {
            for (const p of accData[key] || []) {
              posts.push({
                user_id: userId,       // ← pakai user_id dari auth, bukan anon_id
                account,
                platform: platformId,
                date: p.date || '',
                name: p.name || p.caption || '',
                reach: p.reach || 0,
                impression: p.impression || 0,
                like: p.like || 0,
                comment: p.comment || 0,
                share: p.share || 0,
                save: p.save || 0,
                repost: p.repost || 0,
                followers_gained: p.followersGained || 0,
                profile_visit: 0,
                pillar: p.pillar || 'other',
                format: p.format || '',
                caption_len: p.captionLen || 0,
                link: p.link || '',
              });
            }
          }
        }
      }
    }

    if (!posts.length) return { success: true, postCount: 0 };

    // Batch insert (500 per batch untuk avoid timeout)
    const batchSize = 500;
    for (let i = 0; i < posts.length; i += batchSize) {
      const { error } = await supabase
        .from('posts')
        .insert(posts.slice(i, i + batchSize));
      if (error) throw error;
    }

    // Mark sebagai sudah migrate — jangan migrate dua kali
    localStorage.setItem('cl-v1-migrated', 'true');

    return { success: true, postCount: posts.length };

  } catch (e: any) {
    return { success: false, postCount: 0, error: e.message };
  }
}
```

**Tampilkan dialog import saat user pertama login:**

```typescript
// Di dashboard/page.tsx atau AppShell.tsx
useEffect(() => {
  const alreadyMigrated = localStorage.getItem('cl-v1-migrated');
  const hasV1Data = !!localStorage.getItem('smanalytics:v7');

  if (!alreadyMigrated && hasV1Data && user) {
    setShowMigrateDialog(true);
  }
}, [user]);

// UI dialog:
// "Kami menemukan data dari versi sebelumnya.
//  Mau import ke akun kamu sekarang?"
// [Import Sekarang] [Lewati]
```

---

## Utility Functions (Port dari v1)

Tidak ada perubahan dari versi sebelumnya — logic analytics tetap sama.

```typescript
// lib/utils/analytics.ts
export function calcER(...) { ... }  // sama persis
export function erLevel(...) { ... } // sama persis
export function fmt(...) { ... }     // sama persis
```

---

## Setup Supabase Google OAuth

Langkah-langkah setup (dilakukan sekali di dashboard Supabase):

```
1. Buka supabase.com → project kamu
2. Authentication → Providers → Google → Enable

3. Di Google Cloud Console (console.cloud.google.com):
   a. Buat project baru atau pakai yang ada
   b. APIs & Services → Credentials → Create OAuth 2.0 Client ID
   c. Application type: Web application
   d. Authorized redirect URIs:
      https://[PROJECT_ID].supabase.co/auth/v1/callback
   e. Copy Client ID dan Client Secret

4. Kembali ke Supabase → Authentication → Providers → Google:
   - Paste Client ID
   - Paste Client Secret
   - Save

5. Di Supabase → Authentication → URL Configuration:
   - Site URL: https://creatorlytics.vercel.app (domain produksi kamu)
   - Redirect URLs: tambahkan http://localhost:3000/auth/callback
     dan https://creatorlytics.vercel.app/auth/callback
```

---

## Roadmap Pengerjaan — 9 Minggu

### Minggu 1: Foundation & Auth Setup
**Goal:** User bisa login Google, session tersimpan, routing terproteksi

```
□ Setup Next.js 14 + TypeScript + Tailwind
□ Install: @supabase/supabase-js @supabase/auth-helpers-nextjs
           recharts lucide-react next-themes
□ npx shadcn@latest init
□ Buat Supabase project
□ Jalankan SQL schema (semua tabel + trigger + RLS)
□ Setup Google OAuth di Supabase + Google Cloud Console
□ Buat /login page dengan tombol "Masuk dengan Google"
□ Buat /auth/callback/route.ts
□ Buat middleware.ts (auth guard)
□ Test: login → redirect ke /dashboard → logout → kembali ke /login
□ Deploy ke Vercel (test deploy awal)
```

**File yang dibuat di Minggu 1:**
```
middleware.ts
app/login/page.tsx
app/auth/callback/route.ts
app/layout.tsx
app/page.tsx
app/dashboard/page.tsx (placeholder)
lib/supabase/client.ts
lib/supabase/server.ts
lib/hooks/useUser.ts
lib/constants.ts
types/index.ts
```

---

### Minggu 2: Layout + AppShell
**Goal:** Tampilan app lengkap, sidebar dengan user info, semua route ada

```
□ AppShell.tsx (wrapper sidebar + main)
□ Sidebar.tsx dengan:
   - Logo + nama app
   - Navigation links (Dashboard, Analytics, dll)
   - Di bawah: foto profil Google + nama + email user
   - Tombol logout
□ Topbar.tsx (judul halaman + tombol "+ Post")
□ MobileNav.tsx (bottom nav di HP)
□ Dark/light mode toggle dengan next-themes
□ Semua route halaman dibuat (placeholder content dulu)
□ useUser.ts — ambil nama + email dari Google session
```

---

### Minggu 3: Input Post & Storage
**Goal:** User bisa input post dan data tersimpan ke Supabase dengan user_id

```
□ PostModal.tsx (form input post lengkap)
□ usePosts.ts hook:
   - getPosts(userId) — ambil semua post user ini saja (RLS handle isolasi)
   - createPost(data) — insert dengan user_id dari auth session
   - updatePost(id, data)
   - deletePost(id)
□ ContentTimeline.tsx (list semua post)
□ Delete dengan undo (5 detik)
□ Toast notification
□ Loading state + skeleton
□ Validasi form
```

---

### Minggu 4: Dashboard
**Goal:** KPI dari data real, insight engine jalan

```
□ useAnalytics.ts hook
□ KPICard (reach, ER, posts, followers)
□ InsightEngine (port dari v1)
□ GoalProgress
□ TopContent (3 post terbaik)
□ Empty state kalau belum ada post
□ Skeleton loading
```

---

### Minggu 5: Analytics
**Goal:** Charts dan analisis berfungsi

```
□ TrendChart (Recharts)
□ TopContentTable dengan sort
□ PillarChart
□ AnalyticsFilter (platform, date range)
□ Platform comparison
```

---

### Minggu 6: Goals + Report + Migrasi v1
**Goal:** Goals, laporan PDF, dan import data lama berfungsi

```
□ GoalCard + GoalModal
□ Progress tracking otomatis
□ ReportSlide components
□ PDF export
□ Migrasi v1: dialog "Import data lama kamu?"
□ lib/utils/migration.ts
□ Test migration dari localStorage ke Supabase
```

---

### Minggu 7: Content Planner + Calendar
**Goal:** Fitur perencanaan konten

```
□ KanbanBoard (Ide → Brief → Draft → Ready)
□ IdeaCard + IdeaModal
□ CalendarGrid
□ CalEventModal
```

---

### Minggu 8: Competitor + CSV + Settings
**Goal:** Semua fitur utama lengkap

```
□ CompetitorCard + Modal
□ CSV import/export
□ Settings page (profil, platform, pillar, tema, ER mode)
□ Update display_name dari Settings (sync ke user_profiles)
□ JSON backup/restore
```

---

### Minggu 9: Polish + Launch
**Goal:** Siap dipakai user nyata

```
□ Onboarding flow untuk user baru
□ Mobile responsive audit
□ Performance audit (Lighthouse)
□ Error handling menyeluruh
□ Landing page sederhana (/landing atau subdomain)
□ Custom domain
□ Announce ke komunitas SM Indonesia
```

---

## Cara Kerja dengan AI (Prompt Template)

```
Konteks proyek:
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth (Google OAuth) + PostgreSQL
- User WAJIB login dengan Google sebelum bisa akses app
- Setelah login, user_id = auth.uid() dari Supabase session
- Semua query ke Supabase sudah di-protect pakai RLS (auth.uid() = user_id)
- Bahasa UI: Indonesia
- Deploy ke Vercel

Task yang ingin dikerjakan:
[DESKRIPSI TASK]

File yang relevan:
[LIST FILE]

Constraint:
- Jangan ubah file lain yang tidak disebutkan
- Gunakan TypeScript strict
- Gunakan Tailwind class, hindari inline style
- Semua query Supabase harus pakai createClientComponentClient() (bukan createClient biasa)
- Error handling wajib ada
- Loading state wajib ada
- Jangan hardcode user_id — selalu ambil dari auth session

Output yang diharapkan:
[DESKRIPSI OUTPUT]
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Cara dapat:
# 1. supabase.com → project → Settings → API
# 2. Copy "Project URL" dan "anon public" key
# 3. Jangan pernah commit file .env.local ke GitHub!
#    Pastikan .env.local ada di .gitignore
```

---

## Commands yang Sering Dipakai

```bash
# Setup project baru
npx create-next-app@latest creatorlytics --typescript --tailwind --app

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs recharts lucide-react next-themes
npx shadcn@latest init
npx shadcn@latest add button dialog input select toast card badge avatar dropdown-menu

# Development
npm run dev   # localhost:3000

# Check sebelum push
npm run build           # harus 0 error
npx tsc --noEmit        # TypeScript check

# Git
git add .
git commit -m "feat: nama fitur"
git push origin main
# → Vercel auto-deploy
```

---

## Checklist Per Minggu

### Sebelum mulai minggu baru:
- [ ] Semua task minggu lalu selesai
- [ ] `npm run build` tidak ada error
- [ ] Push ke GitHub
- [ ] Vercel masih deploy dengan benar
- [ ] Test login/logout masih jalan

### Sebelum selesai sesi kerja:
- [ ] `npm run build` tidak ada error
- [ ] Test di mobile (Chrome DevTools 375px)
- [ ] Test dark mode dan light mode
- [ ] Test login, gunakan app, logout, login lagi → data masih ada
- [ ] `git commit` dan push

### Sebelum launch:
- [ ] Test dengan akun Google berbeda → data benar-benar terpisah
- [ ] Test dari HP dengan akun yang sama → data sama
- [ ] Test import dari v1 (localStorage migration)
- [ ] Test onboarding user baru (fresh Google account)
- [ ] Tidak ada console.error saat pakai normal
- [ ] RLS test: pastikan user A tidak bisa lihat data user B

---

## Target Skor Setelah v2

| Aspek | v1 Sekarang | Target v2 |
|---|---|---|
| UI Design | 7.5/10 | 8.5/10 |
| UX | 7/10 | 8.5/10 |
| Performance | 6/10 | 9/10 |
| Scalability | 4/10 | 9/10 |
| Code Quality | 6.5/10 | 8.5/10 |
| SaaS Readiness | 3/10 | 8/10 |
| Professionalism | 6.5/10 | 8.5/10 |
| Monetization Potential | 5/10 | 8.5/10 |
| User Trust | 6/10 | 9/10 |
| Production Readiness | 4.5/10 | 8.5/10 |
| **Rata-rata** | **6.0/10** | **8.6/10** |

**Peningkatan signifikan vs sistem anonim:**
- User Trust naik dari 8/10 → 9/10 karena user tahu data mereka terikat ke Google account, bukan UUID random
- SaaS Readiness naik karena sudah ada user identity yang proper untuk billing nanti
- Monetization Potential naik karena ada email user untuk komunikasi
