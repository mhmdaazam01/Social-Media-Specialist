# PROMPT: Implementasi Dashboard Creatorlytics ke Next.js + Tailwind

> Cara pakai: paste prompt ini ke Claude Code (atau AI assistant lain yang kerja di project Next.js kamu), **lampirkan juga file `creatorlytics-dashboard.jsx`** sebagai referensi visual. Prompt tanpa file referensi itu kurang lengkap — file itu sumber kebenaran untuk layout, spacing, dan struktur komponennya.

---

## Goal

Implementasikan struktur dan tampilan dashboard dari file referensi (`creatorlytics-dashboard.jsx`) ke project Next.js ini. File referensi itu React mockup dengan inline style — **tugasmu adalah menerjemahkan visualnya, bukan menyalin caranya nulis style.**

---

## ATURAN KERAS (jangan dilanggar)

1. **Styling pakai Tailwind utility class di JSX/TSX, bukan inline `style={{}}`.** File referensi pakai inline style karena itu cuma mockup portable — di codebase asli ini, semua harus jadi `className`.
2. **Custom CSS file/global CSS hanya untuk hal yang benar-benar tidak bisa diekspresikan Tailwind** — misalnya animasi kompleks tertentu atau pseudo-element rumit. Kalau ada keperluan custom CSS, tulis di `globals.css` dengan `@layer`, jangan style terpisah per komponen.
3. **Extend `tailwind.config.js`/`.ts`** dengan token warna di bawah — jangan hardcode hex di className kecuali pakai arbitrary value Tailwind (`bg-[#xxxxxx]`) untuk kasus one-off yang genuinely tidak reusable.
4. **Setelah generate kode, jalankan lint dan typecheck**, lalu perbaiki semua error sebelum dianggap selesai:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
   Kalau ada error, perbaiki, jalankan ulang, sampai bersih. Jangan declare "selesai" sebelum dua command ini clean.

---

## Design tokens — paste ke `tailwind.config.js`

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cly: {
          bg: '#F6F7F4',
          rail: '#FDFDFB',
          surface: '#FFFFFF',
          muted: '#F0F2ED',
          'muted-2': '#E5E8E0',
          border: '#E0E3DA',
          'border-strong': '#C9CFC1',
          text: '#1D211B',
          'text-2': '#60675B',
          'text-3': '#8A9283',
          brand: '#2F6F45',
          'brand-2': '#175A7A',
          'brand-tint': '#E6F2EA',
          blue: '#2563A7',
          'blue-tint': '#E7EFF8',
          amber: '#A15C07',
          'amber-tint': '#F7EDDC',
          green: '#197B3A',
          'green-tint': '#E3F3E7',
          red: '#B93B32',
          'red-tint': '#F8E7E5',
          purple: '#7C4D9D',
          'purple-tint': '#F0E7F6',
        },
        platform: {
          tiktok: '#13747C',
          'tiktok-tint': '#E1F1F2',
          instagram: '#A23B86',
          'instagram-tint': '#F6E8F1',
          youtube: '#C6362E',
          'youtube-tint': '#FBE8E6',
          linkedin: '#2563A7',
          'linkedin-tint': '#E7EFF8',
        },
      },
      fontSize: {
        'cly-micro': '10px',
        'cly-xs': '11px',
        'cly-sm': '12px',
        'cly-base': '13px',
        'cly-md': '14px',
        'cly-lg': '16px',
        'cly-xl': '18px',
        'cly-2xl': '22px',
        'cly-display': '27px',
      },
      boxShadow: {
        cly: '0 1px 2px rgba(29,33,27,0.05), 0 10px 24px rgba(29,33,27,0.04)',
        'cly-hover': '0 1px 2px rgba(29,33,27,0.06), 0 16px 34px rgba(29,33,27,0.08)',
      },
    },
  },
};
```

Contoh pemakaian setelah extend: `bg-cly-surface`, `text-cly-text-2`, `border-cly-border`, `text-cly-sm`, `shadow-cly`.

**Spacing & radius** — sebagian besar sudah cocok dengan default Tailwind, gak perlu di-extend:
- `6px → gap-1.5` / `p-1.5`
- `8px → gap-2` / `p-2`
- `10px → gap-2.5` / `p-2.5`
- `14px → gap-3.5` / `p-3.5`
- `28px → gap-7` / `p-7`
- `18px` dan `22px` tidak ada default Tailwind-nya — pakai arbitrary value: `p-[18px]`, `gap-[22px]`.
- Radius: `rounded-md` (6px) untuk badge kecil, `rounded-lg` (8px) untuk button/input, `rounded-[10px]` untuk card (karena `rounded-xl` default-nya 12px, sedikit beda), `rounded-full` untuk pill/avatar.

---

## Font

Mockup referensinya cuma nyebut `'Inter', 'DM Sans'` di font-family tanpa benar-benar load-nya (itu cuma placeholder). Di project Next.js ini, load font yang benar pakai `next/font/google`:

```ts
// app/layout.tsx (atau pages/_app.tsx kalau masih Pages Router)
import { Inter, DM_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
```

Lalu di `tailwind.config.js`, extend `fontFamily` supaya bisa dipakai sebagai class (`font-sans`):
```js
fontFamily: {
  sans: ['var(--font-inter)', 'var(--font-dm-sans)', 'system-ui', 'sans-serif'],
}
```

---

## Arsitektur yang harus dipertahankan

**Sidebar** (lebar ~220px, collapsible ke 72px):
- Brand mark di atas (logo + nama produk)
- Nav dikelompokkan jadi 3 section dengan label uppercase kecil: **Overview** (Dashboard, Analytics, Report), **Operate** (Konten, Planner, Kalender), **Growth** (Goals, Kompetitor)
- Item "Pengaturan" dipin sendiri di paling bawah, terpisah dari 3 grup di atas, dengan border-top
- Active state: background tint warna brand + border-left aksen + teks warna brand

**Top bar** (persistent di semua halaman, tinggi ~58px):
- Workspace chip kecil di kiri (avatar inisial + nama workspace + chevron)
- Judul halaman + subtitle (ambil dari mapping page→title/subtitle, satu sumber kebenaran, jangan hardcode di tiap halaman)
- Search bar dengan hint keyboard shortcut (`Ctrl K`)
- Notification bell dengan dot indicator
- Avatar user di paling kanan

**9 halaman**, masing-masing punya treatment beda yang harus dipertahankan, bukan disamakan:
- **Dashboard** — KPI grid 4 kolom + chart trend dengan reference line target + action queue + agenda hari ini
- **Analytics** — **satu halaman scroll, JANGAN dipecah jadi tab.** Urutannya naratif: chart trend & pillar score → 3 insight card ("apa artinya") → tabel breakdown platform (detail). Ini keputusan UX yang disengaja — tab di sini justru memutus alur analisis yang harusnya nyambung.
- **Report** — **2 tab: Overview dan Appendix**, dengan sidebar kanan (report package checklist, distribution options, AI note) yang **selalu kelihatan di kedua tab**, gak ikut ke-tab.
- **Konten** — toolbar search+filter+sort yang beneran filtering data (bukan dekorasi), toggle Table/Cards view
- **Planner** — kanban 5 kolom (Idea/Brief/Draft/Review/Ready), tiap card punya border-top warna sesuai kolom
- **Kalender** — grid bulanan + deteksi konflik (icon warning kalau >1 event di hari yang sama) + agenda list di sidebar kanan
- **Goals** — card per goal dengan progress bar + badge confidence + forecast card di bawah
- **Kompetitor** — tabel benchmark dengan baris "You" disorot warna brand + opportunity gap list
- **Pengaturan** — **3 tab: Profile, Platforms, Notifications** — jangan biarkan halaman ini cuma 1 card kecil, isi sepadan dengan halaman lain

**Komponen reusable yang harus dibuat sebagai component terpisah** (jangan inline berulang):
`Badge`, `PlatformBadge`, `StatusBadge`, `PriorityBadge`, `OwnerTag`, `MetricCard`, `InsightCard`, `SectionTitle`, `PageFrame`. Semua sudah ada di file referensi — port logic-nya, ganti stylingnya ke Tailwind class.

---

## Yang TIDAK perlu dipertahankan

Data di mockup (`contentRows`, `competitors`, `goalsList`, dst.) itu data dummy buat preview doang. Ganti dengan data asli / fetch dari API begitu backend-nya siap — strukturnya yang penting dipertahankan, bukan isinya.

---

## Kalau ada fitur di mockup yang belum ada di web kamu

Mockup ini punya beberapa elemen yang infrastrukturnya belum tentu ada di app asli (search global, notifikasi, workspace switcher, dst). **Jangan asal di-skip** (bikin tampilan beda dari mockup), tapi **jangan juga asal disambungin** ke endpoint/tabel yang belum ada (bikin error). Ikuti langkah ini:

**Langkah 1 — Cek dulu apakah logic-nya udah ada di tempat lain di codebase, cuma beda lokasi.**
Sebelum bikin dari nol, cari dulu apakah ada fitur serupa yang sudah jalan tapi posisinya berbeda. Contoh: kalau di halaman Konten sudah ada search/filter yang beneran jalan ke data asli, search di top bar global cukup **reuse state/logic itu** (dipindah tampilannya), bukan dibuat ulang dari kosong.

**Langkah 2 — Klasifikasikan fiturnya, baru tentukan treatment:**

| Tipe fitur | Contoh di mockup | Treatment |
|---|---|---|
| **State UI murni client-side**, gak butuh backend | Tab Overview/Appendix di Report, tab Profile/Platforms/Notifications di Settings, toggle Table/Cards, collapse sidebar | **Implementasikan penuh.** Cuma `useState`, 100% aman, gak ada risiko error. |
| **Logic yang sudah ada datanya, cuma beda lokasi/nama field** | Search/filter/sort di halaman Konten | **Port logic-nya, tapi sesuaikan nama field ke schema data asli kamu** — jangan asal copy `row.title`/`row.owner` kalau struktur data kamu beda. |
| **Butuh backend/infra yang belum ada** | Search global di top bar, notifikasi, workspace switcher | **Bikin tampilannya persis sama, tapi logic-nya jadi placeholder yang aman** — detail di bawah. |

**Langkah 3 — Untuk yang butuh backend tapi belum ada infranya: stub yang aman, bukan dihilangkan.**

Contoh konkret persis seperti yang kamu sebut (search):

- **Search di top bar, tapi belum ada search engine/index** → tetap render input-nya, dikontrol `useState` lokal, **jangan panggil API yang belum ada**. Kasih komentar `// TODO: connect to real search once content index exists`. Kalau mau sedikit fungsional tanpa backend, boleh filter terhadap data yang sudah di-fetch di halaman yang sedang aktif — tapi jangan menebak nama endpoint yang gak ada di codebase.
- **Notification bell** → tetap render dot indikatornya (itu cuma visual status), tapi kalau diklik cukup buka dropdown kosong "Belum ada notifikasi" — jangan biarkan dia coba fetch dari endpoint notifikasi yang belum dibuat.
- **Workspace switcher** → kalau app kamu belum punya konsep multi-workspace, render aja sebagai chip statis nampilin nama workspace aktif, gak perlu dropdown yang beneran berfungsi. Begitu multi-workspace beneran dibangun nanti, tinggal di-upgrade.

**Aturan paling penting: kalau ragu antara "implementasi beneran" vs "stub yang aman," pilih stub.** Tampilan identik tapi belum fungsional itu jauh lebih baik daripada tampilan beda dari mockup ATAU app yang crash karena nembak sesuatu yang gak ada. Tandai semua stub dengan komentar `// TODO:` yang jelas dan konsisten, biar gampang dicari pas mau diimplementasi beneran nanti.

**Sebelum nambah komponen/state/route apapun, cek dulu struktur project yang sudah ada** — supaya gak bikin duplikat logic atau naming yang bentrok sama yang sudah ada.

---

## Definition of done

- [ ] Semua styling pakai Tailwind class, nol inline `style={{}}` kecuali untuk nilai dinamis yang genuinely harus dihitung runtime (misal width progress bar)
- [ ] `tailwind.config` sudah di-extend dengan token warna di atas
- [ ] Font di-load lewat `next/font/google`, bukan asumsi sistem
- [ ] Struktur sidebar/topbar/9 halaman sama seperti dijelaskan di atas
- [ ] `npm run lint` clean
- [ ] `npx tsc --noEmit` clean
