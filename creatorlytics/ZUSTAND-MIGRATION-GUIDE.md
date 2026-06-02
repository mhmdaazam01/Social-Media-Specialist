# 🔄 Panduan Lengkap: Zustand → Supabase Migration

## 🤔 Apa itu Zustand Store?

**Zustand** = library untuk manage state/data di **local browser** saja.

### ❌ Masalah Zustand:
- Data **TIDAK sync** ke database
- Data **TIDAK sync** antar device (HP vs Laptop)
- Data **HILANG** pas refresh browser (kecuali pakai localStorage)
- Data **TIDAK persistent** (tidak permanen)

### ✅ Solusi: Pakai Supabase Hooks
- Data **SYNC** ke database cloud
- Data **SYNC** antar device
- Data **TIDAK HILANG** pas refresh
- Data **PERSISTENT** (permanen)

---

## 📋 File yang Masih Pakai Zustand (Harus Diganti!)

### 🔴 PRIORITY 1 (Penting Banget - Affects Data Sync):

| File | Zustand Store | Ganti Ke | Status |
|------|---------------|----------|--------|
| `components/posts/CSVImport.tsx` | `usePostStore` | `usePosts` | ✅ DONE |
| `components/posts/PostRow.tsx` | `usePlatformStore`, `useSettingsStore` | `usePlatforms`, `useUser` | ✅ DONE |
| `components/providers/Providers.tsx` | `useSettingsStore` | `useUser` | ✅ DONE |
| `components/competitor/CompetitorModal.tsx` | `useCompetitorStore` | `useCompetitors` | ⚠️ TODO |

### 🟡 PRIORITY 2 (Dashboard Components - Affects Display):

| File | Zustand Store | Ganti Ke | Status |
|------|---------------|----------|--------|
| `components/dashboard/InsightEngine.tsx` | `usePostStore`, `useGoalStore`, `useSettingsStore` | `usePosts`, `useGoals`, `useUser` | ⚠️ TODO |
| `components/dashboard/TopContent.tsx` | `usePostStore`, `useSettingsStore`, `usePlatformStore` | `usePosts`, `useUser`, `usePlatforms` | ⚠️ TODO |
| `components/dashboard/WeeklyNarrative.tsx` | `usePostStore`, `useSettingsStore` | `usePosts`, `useUser` | ⚠️ TODO |

### 🟢 PRIORITY 3 (Display Components - Lower Priority):

| File | Zustand Store | Ganti Ke | Status |
|------|---------------|----------|--------|
| `components/planner/IdeaCard.tsx` | `usePlatformStore`, `usePillarStore` | `usePlatforms`, `usePillars` | ⚠️ TODO |
| `components/analytics/TopContentTable.tsx` | `usePlatformStore` | `usePlatforms` | ⚠️ TODO |
| `app/report/page.tsx` | `usePostStore`, `useSettingsStore` | `usePosts`, `useUser` | ⚠️ TODO |

---

## 🔧 Cara Ganti (Template):

### Before (Zustand):
```typescript
import { usePostStore } from '@/lib/store/post-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { usePlatformStore } from '@/lib/store/platform-store';

function MyComponent() {
  const posts = usePostStore(s => s.posts);
  const { settings } = useSettingsStore();
  const { platforms } = usePlatformStore();
  
  // ...
}
```

### After (Supabase):
```typescript
import { usePosts } from '@/lib/hooks/usePosts';
import { useUser } from '@/lib/hooks/useUser';
import { usePlatforms } from '@/lib/hooks/usePlatforms';

function MyComponent() {
  const { posts } = usePosts();
  const { profile } = useUser();
  const { platforms } = usePlatforms();
  
  // ...
  // Ganti: settings.er_mode → profile?.er_mode || 'impression'
  // Ganti: settings.theme → profile?.theme || 'dark'
}
```

---

## 📝 Mapping Lengkap:

| Zustand Store | Supabase Hook | Field Changes |
|---------------|---------------|---------------|
| `usePostStore` | `usePosts()` | `posts` → `{ posts }` |
| `useGoalStore` | `useGoals()` | `goals` → `{ goals }` |
| `usePlatformStore` | `usePlatforms()` | `platforms` → `{ platforms }` |
| `usePillarStore` | `usePillars()` | `pillars` → `{ pillars }` |
| `useAccountStore` | `useAccounts()` | `accounts` → `{ accounts }` |
| `useCompetitorStore` | `useCompetitors()` | `competitors` → `{ competitors }` |
| `useIdeaStore` | `useIdeas()` | `ideas` → `{ ideas }` |
| `useEventStore` | `useEvents()` | `events` → `{ events }` |
| `useSettingsStore` | `useUser()` | `settings.theme` → `profile?.theme`<br>`settings.er_mode` → `profile?.er_mode` |

---

## 🎯 Contoh Fix Lengkap:

### File: `components/dashboard/InsightEngine.tsx`

#### Before:
```typescript
import { usePostStore } from '@/lib/store/post-store';
import { useGoalStore } from '@/lib/store/goal-store';
import { useSettingsStore } from '@/lib/store/settings-store';

export function InsightEngine() {
  const posts = usePostStore(s => s.posts);
  const goals = useGoalStore(s => s.goals);
  const { settings } = useSettingsStore();
  
  const insights = generateInsights(posts, goals, settings.er_mode);
  // ...
}
```

#### After:
```typescript
import { usePosts } from '@/lib/hooks/usePosts';
import { useGoals } from '@/lib/hooks/useGoals';
import { useUser } from '@/lib/hooks/useUser';

export function InsightEngine() {
  const { posts } = usePosts();
  const { goals } = useGoals();
  const { profile } = useUser();
  
  const insights = generateInsights(posts, goals, profile?.er_mode || 'impression');
  // ...
}
```

---

## 🚨 Common Pitfalls (Jebakan):

### 1. Destructuring
❌ **Wrong:**
```typescript
const posts = usePosts(); // posts is an object, not array!
```

✅ **Correct:**
```typescript
const { posts } = usePosts(); // Destructure to get array
```

### 2. Optional Chaining untuk profile
❌ **Wrong:**
```typescript
const erMode = profile.er_mode; // Error if profile is null!
```

✅ **Correct:**
```typescript
const erMode = profile?.er_mode || 'impression'; // Safe with default
```

### 3. Loading State
Hooks punya loading state, pakai untuk prevent errors:

```typescript
const { posts, loading } = usePosts();

if (loading) {
  return <div>Loading...</div>;
}

// Now safe to use posts
```

---

## 🧪 Cara Test Setelah Migration:

1. **Build:** `npm run build` (harus success, 0 error)
2. **Run dev:** `npm run dev`
3. **Test fitur:**
   - Tambah data baru
   - Refresh browser
   - Cek apakah data masih ada ✅
4. **Test sync:**
   - Buka di device lain
   - Data harus muncul ✅

---

## 🆘 Kalau Ada Error:

### Error: "Cannot read property 'posts' of undefined"
**Penyebab:** Lupa destructure
**Fix:** Ganti `usePosts()` jadi `const { posts } = usePosts()`

### Error: "profile.er_mode is undefined"
**Penyebab:** profile bisa null
**Fix:** Ganti `profile.er_mode` jadi `profile?.er_mode || 'impression'`

### Error: "usePostStore is not defined"
**Penyebab:** Import masih pakai Zustand
**Fix:** Ganti import ke hooks (lihat mapping di atas)

---

## 📦 Files Lokasi Hooks:

Semua hooks ada di folder: `lib/hooks/`

```
lib/hooks/
├── useUser.ts         → profile, session
├── usePosts.ts        → posts data
├── useGoals.ts        → goals data
├── usePlatforms.ts    → platforms data
├── usePillars.ts      → pillars data
├── useAccounts.ts     → accounts data
├── useIdeas.ts        → content ideas data
├── useEvents.ts       → calendar events data
└── useCompetitors.ts  → competitors data
```

---

## ✅ Migration Checklist:

- [x] Providers.tsx
- [x] PostRow.tsx
- [x] CSVImport.tsx
- [ ] CompetitorModal.tsx
- [ ] InsightEngine.tsx
- [ ] TopContent.tsx
- [ ] WeeklyNarrative.tsx
- [ ] IdeaCard.tsx
- [ ] TopContentTable.tsx
- [ ] report/page.tsx

**Progress: 3/11 (27%)**

---

## 💡 Why Migration Important?

**Sebelum (Zustand):**
```
User A di HP     → Data LOCAL di HP
User A di Laptop → Data LOCAL di Laptop (BEDA!)
Refresh browser  → Data HILANG
```

**Sesudah (Supabase):**
```
User A di HP     → Data di DATABASE ☁️
User A di Laptop → Data SAMA dari DATABASE ☁️
Refresh browser  → Data TETAP ADA ✅
```

---

**Prioritas:** Fix **CompetitorModal** dulu (Priority 1), baru dashboard components! 🚀
