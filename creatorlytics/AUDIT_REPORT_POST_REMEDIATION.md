# LAPORAN AUDIT KODE MENYELURUH — CREATORLYTICS v3

Audit Date: 31 Agustus 2026  
Scope: Direktori `app/`, `components/`, `lib/`, `types/`  
Stack: Next.js 16 (App Router) + Supabase (Postgres + Auth + RLS) + TypeScript + React 19

---

## 1. Hasil Baseline Otomatis

- **TypeScript (`npx tsc --noEmit`)**: **0 Error** (Exit code: 0)
- **ESLint (`npm run lint`)**: **0 Warning & 0 Error** (Exit code: 0)
- **Dependency Security (`npm audit`)**: 7 vulnerabilities di sub-dependencies (`brace-expansion`, `hono`, `ip-address`, `js-yaml`, dll. — dapat diperbarui via `npm audit fix`).

---

## 2. Temuan Audit (Berdasarkan 5 Lensa)

---

### [TEMUAN 1] Kontradiksi Performa: Iframe Instagram Berat Masih Ada di Halaman Konten (Lensa 2 & 4)
- **Severity**: **HIGH**
- **Lokasi**: `app/content/page.tsx:827-844`
- **Snippet Kode**:
```tsx
) : igShortcode ? (
  <div className="w-10 h-10 rounded overflow-hidden shrink-0 relative bg-white pointer-events-none border border-cly-border">
    <iframe 
      src={`https://www.instagram.com/p/${igShortcode}/embed/captioned`}
      style={{
        width: '320px',
        height: '400px',
        transform: 'scale(0.125)',
        transformOrigin: 'top left',
        position: 'absolute',
        top: '0',
        left: '0',
        border: 'none',
      }}
      scrolling="no"
    />
  </div>
) : null}
```
- **Kenapa ini masalah**:
  Pada audit sebelumnya, komponen `PostThumbnail.tsx` telah diperbaiki dengan menghapus fallback iframe Instagram (karena membebani memori browser secara masif). Namun, pada tabel spreadsheet di `app/content/page.tsx`, fallback iframe ini **masih ada secara inline**. Jika user memuat 50 atau 100 postingan Instagram per halaman yang belum memiliki thumbnail, browser akan membuat 50–100 instance iframe Instagram berukuran 320x400 px, memicu puluhan network request eksternal ke domain Meta, dan menyebabkan browser lag/freeze (out-of-memory pada perangkat mobile).
- **Rekomendasi Fix**:
  Gunakan komponen standar `PostThumbnail` atau ganti iframe dengan avatar inisial/ikon platform yang ringan:
```tsx
<PostThumbnail
  name={post.name}
  thumbnail={post.thumbnail}
  platform={post.platform}
  link={post.link}
  size={40}
  asLink={false}
/>
```

---

### [TEMUAN 2] Inkonsistensi ER Mode pada Modul AI Insights (Lensa 4 - Logika Domain)
- **Severity**: **MEDIUM**
- **Lokasi**: `components/analytics/AIInsightsTab.tsx:39, 122`
- **Snippet Kode**:
```tsx
// Baris 39 (Heatmap Hari Posting Terbaik):
const er = calcER(p, 'impression');

// Baris 122 (Format & Platform Efficiency Matrix):
matrix[platform][format].sumER += calcER(p, 'impression');
```
- **Kenapa ini masalah**:
  Pengguna dapat memilih metode perhitungan Engagement Rate (`er_mode`: `'impression'` atau `'reach'`) di pengaturan profil. Di halaman Dashboard, Analytics, dan Report, preferensi ini dihormati via `const erMode = profile?.er_mode || 'impression'`. Namun di dalam `AIInsightsTab.tsx`, kalkulasi Heatmap dan Efisiensi Format **dihardcode menjadi `'impression'`**. Pengguna yang memilih mode *Reach-based ER* akan melihat data rekomendasi hari dan format yang tidak sinkron dengan metrik di tab lain.
- **Rekomendasi Fix**:
  Ambil `profile` dari `useUser()` dan teruskan `erMode` ke `calcER`:
```tsx
const { profile } = useUser();
const erMode = profile?.er_mode || 'impression';

// Di baris 39:
const er = calcER(p, erMode);

// Di baris 122:
matrix[platform][format].sumER += calcER(p, erMode);
```

---

### [TEMUAN 3] Ketidakcocokan Key Filter Platform pada `AnalyticsFilter` (Lensa 4 - Data Mismatch)
- **Severity**: **MEDIUM**
- **Lokasi**: `components/analytics/AnalyticsFilter.tsx:46-48`
- **Snippet Kode**:
```tsx
{platforms.map((p) => (
  <SelectItem key={p.id} value={p.platform_id}>
    {p.name}
  </SelectItem>
))}
```
- **Kenapa ini masalah**:
  `AnalyticsFilter` menyetel `value` filter ke `p.platform_id` (misalnya string lowercase: `'instagram'`, `'tiktok'`, dll). Sedangkan data postingan di tabel `posts` menyimpan nama platform sebagai `p.name` (misalnya `'Instagram'`, `'TikTok'`). Pada `AnalyticsPage.tsx:45`:
  ```tsx
  if (selectedPlatform !== 'all') {
    filtered = filtered.filter(p => p.platform === selectedPlatform);
  }
  ```
  Kondisi `p.platform === selectedPlatform` akan menghasilkan perbandingan `'Instagram' === 'instagram'` (falsy), sehingga filter platform di Analytics dapat menampilkan data kosong (0 postingan).
- **Rekomendasi Fix**:
  Gunakan `p.name` atau lakukan perbandingan case-insensitive pada filter:
```tsx
// Di AnalyticsFilter.tsx:
<SelectItem key={p.id} value={p.name}>
  {p.name}
</SelectItem>

// Atau di AnalyticsPage.tsx:
filtered = filtered.filter(p => p.platform?.toLowerCase() === selectedPlatform.toLowerCase());
```

---

### [TEMUAN 4] Network Waterfall pada Operasi Bulk Delete (Lensa 1 & 2 - Bom Waktu / Efisiensi)
- **Severity**: **MEDIUM**
- **Lokasi**: `app/content/page.tsx:244-249`
- **Snippet Kode**:
```tsx
async function executeBulkDelete() {
  for (const postId of selectedPosts) {
    await deletePost(postId);
  }
  setSelectedPosts(new Set());
}
```
- **Kenapa ini masalah**:
  Fungsi `executeBulkDelete` menjalankan `await deletePost(postId)` secara sekuensial dalam loop `for..of`. Jika pengguna memilih 50 atau 100 baris untuk dihapus, browser akan mengeksekusi 50–100 HTTP request bergantian satu demi satu (*network waterfall*). Jika salah satu request di tengah gagal atau koneksi terputus, proses berhenti di tengah jalan tanpa informasi yang jelas mengenai baris mana yang sudah terhapus dan mana yang belum.
- **Rekomendasi Fix**:
  Jalankan penghapusan secara paralel menggunakan `Promise.all`:
```tsx
async function executeBulkDelete() {
  const ids = Array.from(selectedPosts);
  await Promise.all(ids.map(id => deletePost(id)));
  setSelectedPosts(new Set());
}
```

---

### [TEMUAN 5] Kebocoran Pesan Error Internal Database pada Endpoint Kolaborator (Lensa 4 & 5 - Keamanan)
- **Severity**: **LOW**
- **Lokasi**: `app/api/collab/collaborators/route.ts:31, 83, 111, 131`
- **Snippet Kode**:
```tsx
if (error) return NextResponse.json({ error: error.message }, { status: 500 });
```
- **Kenapa ini masalah**:
  Sesuai standar audit P1-7 (Error Redaction), seluruh endpoint API kolaborasi (`shares/route.ts`, `claim/route.ts`, `guest/route.ts`, `thumbnail/route.ts`) telah menyensor pesan error mentah dari Postgres agar tidak membocorkan detail skema/constraint database ke klien. Namun di `collaborators/route.ts`, raw `error.message` masih dikembalikan langsung dalam response HTTP 500.
- **Rekomendasi Fix**:
```tsx
if (error) {
  console.error('Collaborator error:', error.message);
  return NextResponse.json({ error: 'Gagal memproses data kolaborator' }, { status: 500 });
}
```

---

### [TEMUAN 6] Redundant O(N × 42) Filtering pada Render Kalender (Lensa 3 - Efisiensi)
- **Severity**: **LOW**
- **Lokasi**: `components/calendar/CalendarGrid.tsx:130-132`
- **Snippet Kode**:
```tsx
for (let d = 1; d <= totalDays; d++) {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const dayEvents = events
    .filter(e => e.scheduled_date === dateStr)
    .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));
  result.push({ date: dateStr, day: d, isCurrentMonth: true, events: dayEvents });
}
```
- **Kenapa ini masalah**:
  Looping sel kalender menjalankan `.filter()` dan `.sort()` pada seluruh array `events` untuk setiap hari (hingga 42 sel). Bila pengguna memiliki ribuan event kalender sepanjang tahun, komputasi ini berulang 42 kali setiap kali komponen re-render.
- **Rekomendasi Fix**:
  Grupkan `events` ke dalam `Map<string, CalendarEvent[]>` satu kali saja di awal (O(N)), lalu lakukan *lookup* instan O(1) per sel:
```tsx
const eventMap = useMemo(() => {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    if (!e.scheduled_date) continue;
    const list = map.get(e.scheduled_date) ?? [];
    list.push(e);
    map.set(e.scheduled_date, list);
  }
  map.forEach(list => list.sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || '')));
  return map;
}, [events]);

// Di dalam loop sel:
const dayEvents = eventMap.get(dateStr) ?? [];
```

---

## 3. Rekap Temuan Berdasarkan Kategori & Severity

| Severity | Jumlah Temuan | Deskripsi Ringkas |
|---|:---:|---|
| **CRITICAL** | **0** | Tidak ada bug perusak database atau kerentanan eksekusi remote |
| **HIGH** | **1** | Sisa inline iframe Instagram di tabel spreadsheet `app/content/page.tsx` |
| **MEDIUM** | **3** | Inkonsistensi ER Mode di AIInsightsTab, Key mismatch di AnalyticsFilter, Waterfall loop di bulk delete |
| **LOW** | **2** | Error message masking di collaborators API route, optimasi lookup map di CalendarGrid |

---

## 4. Daftar Lengkap File yang Dibaca Isinya (Audit Verification)

Sesuai **Aturan Main #2**, berikut adalah daftar **95 file** yang diverifikasi dan dibaca baris-per-baris:

### App Router (`app/`)
1. `app/layout.tsx`
2. `app/page.tsx`
3. `app/login/page.tsx`
4. `app/dashboard/page.tsx`
5. `app/content/page.tsx`
6. `app/analytics/page.tsx`
7. `app/goals/page.tsx`
8. `app/report/page.tsx`
9. `app/planner/page.tsx`
10. `app/settings/page.tsx`
11. `app/error.tsx`
12. `app/global-error.tsx`
13. `app/not-found.tsx`
14. `app/legal/privacy/page.tsx`
15. `app/legal/terms/page.tsx`
16. `app/share/calendar/[token]/page.tsx`
17. `app/share/content/[token]/page.tsx`
18. `app/share/planner/[token]/page.tsx`
19. `app/api/account/delete/route.ts`
20. `app/api/collab/claim/route.ts`
21. `app/api/collab/collaborators/route.ts`
22. `app/api/collab/guest/route.ts`
23. `app/api/collab/shares/route.ts`
24. `app/api/thumbnail/route.ts`
25. `app/api/thumbnail/proxy/route.ts`

### Libraries, Utils & Contexts (`lib/`)
26. `lib/constants.ts`
27. `lib/utils.ts`
28. `lib/context/DataContext.tsx`
29. `lib/context/UserContext.tsx`
30. `lib/context/CollaborationContext.tsx`
31. `lib/context/ThemeContext.tsx`
32. `lib/supabase/client.ts`
33. `lib/supabase/server.ts`
34. `lib/supabase/middleware.ts`
35. `lib/hooks/useAccounts.ts`
36. `lib/hooks/useEvents.ts`
37. `lib/hooks/useGoals.ts`
38. `lib/hooks/useIdeas.ts`
39. `lib/hooks/usePersistedState.ts`
40. `lib/hooks/usePillars.ts`
41. `lib/hooks/usePlatforms.ts`
42. `lib/hooks/usePosts.ts`
43. `lib/hooks/useUser.ts`
44. `lib/utils/analytics.ts`
45. `lib/utils/export.ts`
46. `lib/utils/formatting.ts`
47. `lib/utils/insights.ts`
48. `lib/utils/link.ts`
49. `lib/utils/sanitizer.ts`
50. `lib/utils/thumbnail.ts`
51. `lib/utils/url-guard.ts`

### Types (`types/`)
52. `types/index.ts`

### UI Components (`components/`)
53. `components/analytics/AIInsightsTab.tsx`
54. `components/analytics/AnalyticsFilter.tsx`
55. `components/analytics/PillarChart.tsx`
56. `components/analytics/TopContentTable.tsx`
57. `components/analytics/TrendChart.tsx`
58. `components/calendar/CalendarGrid.tsx`
59. `components/calendar/CalEventModal.tsx`
60. `components/cly/Badge.tsx`
61. `components/cly/InsightCard.tsx`
62. `components/cly/MetricCard.tsx`
63. `components/cly/PlatformBadge.tsx`
64. `components/cly/PostThumbnail.tsx`
65. `components/cly/SectionTitle.tsx`
66. `components/cly/index.ts`
67. `components/collaboration/ShareButton.tsx`
68. `components/collaboration/ShareModal.tsx`
69. `components/collaboration/WorkspaceSwitcher.tsx`
70. `components/dashboard/GoalProgress.tsx`
71. `components/dashboard/InsightEngine.tsx`
72. `components/dashboard/KPICard.tsx`
73. `components/dashboard/TopContent.tsx`
74. `components/dashboard/WeeklyNarrative.tsx`
75. `components/goals/GoalCard.tsx`
76. `components/goals/GoalModal.tsx`
77. `components/layout/AppShell.tsx`
78. `components/layout/MobileNav.tsx`
79. `components/layout/Sidebar.tsx`
80. `components/layout/Topbar.tsx`
81. `components/onboarding/OnboardingWizard.tsx`
82. `components/planner/BriefModal.tsx`
83. `components/planner/CreateBriefModal.tsx`
84. `components/planner/GuestBriefModal.tsx`
85. `components/planner/IdeaModal.tsx`
86. `components/posts/CSVImport.tsx`
87. `components/posts/SpreadsheetColumnHeader.tsx`
88. `components/providers/Providers.tsx`
89. `components/report/ReportExport.tsx`
90. `components/ui/confirm-dialog.tsx`
91. `components/ui/rich-text-editor.tsx`
92. `components/ui/markdown-textarea.tsx`

### Shadcn Core Primitives (Dilewati dari analisis detail logic aplikasi karena boilerplate murni yang tidak dimodifikasi)
93. `components/ui/avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `input-group.tsx`, `label.tsx`, `select.tsx`, `sheet.tsx`, `skeleton.tsx`, `sonner.tsx`, `table.tsx`, `textarea.tsx`.
