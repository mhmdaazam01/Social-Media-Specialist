# Creatorlytics - Setup Guide

## ✅ Setup Selesai

Auth dan database sudah fully configured. Berikut yang sudah dikerjakan:

### 1. Supabase Configuration
- ✅ Project created
- ✅ Google OAuth enabled
- ✅ Database schema deployed (9 tables + RLS policies)
- ✅ Auto-profile trigger on signup

### 2. Code Implementation
- ✅ Supabase clients (browser, server, middleware)
- ✅ Auth middleware (anti-looping, auto-redirect)
- ✅ Login page with Google OAuth
- ✅ Auth callback handler
- ✅ Custom hooks untuk semua data entities
- ✅ Migration tool (localStorage → Supabase)

### 3. Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Session refresh handled by middleware
- ✅ Secure cookie management

---

## 🚀 Cara Pakai

### Development
```powershell
npm run dev
```
Buka http://localhost:3000 → akan redirect ke `/login`

### Login Flow
1. Klik "Masuk dengan Google"
2. Pilih akun Google
3. Authorize app
4. Redirect ke `/dashboard`

### Data Sync
- Semua data otomatis sync ke Supabase
- Data bisa diakses dari device manapun dengan akun Google yang sama
- Tidak ada data di localStorage lagi (kecuali theme preferences)

---

## 📊 Database Tables

| Table | Description |
|---|---|
| `profiles` | User profiles (auto-created on signup) |
| `posts` | Post performance data |
| `goals` | Monthly goals |
| `content_ideas` | Content planning (kanban) |
| `calendar_events` | Content calendar |
| `competitors` | Competitor tracking |
| `platforms` | Social media platforms |
| `pillars` | Content pillars |
| `accounts` | User's social accounts |

---

## 🔧 Custom Hooks (Replace Zustand)

**Old way (deprecated):**
```tsx
import { usePostStore } from '@/lib/store/post-store';
const { posts } = usePostStore();
```

**New way:**
```tsx
import { usePosts } from '@/lib/hooks/usePosts';
const { posts, loading, createPost, updatePost, deletePost } = usePosts();
```

### Available Hooks
- `useUser()` — user session + profile
- `usePosts()` — posts CRUD
- `useGoals()` — goals CRUD
- `useIdeas()` — content ideas CRUD
- `useEvents()` — calendar events CRUD
- `useCompetitors()` — competitors CRUD
- `usePlatforms()` — platforms CRUD
- `usePillars()` — content pillars CRUD
- `useAccounts()` — accounts CRUD

---

## 🔄 Migration dari localStorage

Jika ada data lama di localStorage, akan otomatis dimigrate ke Supabase saat pertama kali login.

Manual migration (jika perlu):
```tsx
import { migrateLocalStorageToSupabase, hasLocalStorageData } from '@/lib/utils/migration';

if (hasLocalStorageData()) {
  const count = await migrateLocalStorageToSupabase(user.id);
  console.log(`${count} items migrated`);
}
```

---

## 🐛 Troubleshooting

### Login Loop
- Pastikan Google OAuth redirect URI sudah benar di Google Console
- Check `.env.local` — URL dan key harus valid
- Clear browser cookies dan coba lagi

### Data Tidak Sync
- Check RLS policies di Supabase dashboard
- Pastikan user sudah login (check `useUser()` hook)
- Check browser console untuk error

### Build Error
```powershell
npm run build
```
Jika ada error TypeScript, check import paths dan types.

---

## 📝 Next Steps

1. **Test auth flow** — login/logout
2. **Test data CRUD** — create/read/update/delete posts
3. **Test multi-device** — login dari device lain, data harus sama
4. **Deploy ke Vercel**:
   - Push ke GitHub
   - Connect repo ke Vercel
   - Set environment variables di Vercel dashboard
   - Deploy

---

## 🔐 Environment Variables

File: `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Jangan commit `.env.local` ke Git!** (sudah ada di `.gitignore`)

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
