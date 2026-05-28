# Creatorlytics — Master Refactor Plan
> Dokumen ini adalah instruksi lengkap untuk memperbaiki Creatorlytics dari "vibe coding" menjadi produk yang maintainable dan tidak memalukan secara teknikal. Kerjakan **secara berurutan** sesuai prioritas. Jangan skip bagian apapun.

---

## Konteks Proyek

**Apa ini:** Social media analytics dashboard untuk social media specialist Indonesia. Single HTML file (~590 KB) dengan vanilla JS, CSS, dan HTML semuanya dalam satu file.

**Target user:** Social media specialist yang megang 1-3 akun client, butuh laporan bulanan yang rapi.

**Status sekarang:** Fungsional, tapi penuh technical debt — 828 inline styles, 152 duplicate CSS selector, 23 modal, 47 global variables, XSS risks, light mode broken.

**Tujuan refactor ini:** Bukan tambah fitur. Bukan migrate framework. Tujuannya adalah membuat kode yang ada menjadi **bersih, aman, konsisten, dan maintainable** tanpa merusak fungsionalitas yang sudah ada.

---

## Keputusan Arsitektur: JANGAN MIGRATE FRAMEWORK

**Jawaban untuk framework:** Tetap vanilla JS. Jangan migrasi ke React, Vue, atau framework apapun sekarang.

**Alasannya:**
1. Semua logic sudah jalan di vanilla JS — rewrite ke React = buang 6-8 minggu tanpa value untuk user
2. AI (Claude, Copilot) sangat bagus maintain vanilla JS — tidak perlu tahu React hooks, state management, build tools complex
3. Yang perlu dilakukan adalah **organisasi kode yang lebih baik**, bukan penggantian teknologi
4. Satu-satunya upgrade yang worth: pisah file menggunakan **Vite** (tapi ini Phase 2, setelah semua bug fix selesai)

**Stack yang dipertahankan:**
- Vanilla JavaScript (ES2020+)
- CSS dengan CSS Custom Properties (sudah ada)
- HTML5
- Chart.js (sudah ada)
- Supabase JS (sudah ada sebagai stub)

---

## FASE 1 — Critical Bug Fix & UX Polish
> Kerjakan ini dulu sebelum yang lain. Ini yang bikin produk terlihat amatir dan bisa bikin user kabur.

### 1.1 — Fix Semua Messaging Anxiety di UI

**Masalah:** User melihat teks yang bikin mereka ragu apakah data aman.

**Yang harus diubah:**

```
SEBELUM → SESUDAH

"Data tersimpan lokal"          → "✓ Tersimpan"  (di footer nav)
"Belum pernah disimpan"         → "" (kosongkan, jangan tampilkan kalau belum ada sync)
"Mode: Dev" di Settings panel   → Hapus total. Ganti dengan versi app saja: "v1.0.0"
"Local mode — localStorage only" di console → Boleh, tapi pastikan tidak muncul di UI
```

**File yang diubah:** Cari semua instance di HTML dan JS, ganti teksnya.

---

### 1.2 — Fix Light Mode Permanently

**Masalah:** Light mode punya multiple issues — FOUC (flash of dark), beberapa komponen ignore CSS vars, overlay modal terlalu transparan.

**Yang harus dilakukan:**

**Step 1: Pastikan inline theme script ada DI ATAS tag `<style>`**
```html
<head>
  <meta charset="UTF-8">
  <!-- Script ini HARUS sebelum <style> untuk prevent FOUC -->
  <script>
    (function(){
      try {
        var t = localStorage.getItem('sm-theme');
        document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
      } catch(e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  </script>
  <style>
    /* ... semua CSS ... */
  </style>
</head>
```

**Step 2: Audit semua CSS rules dengan hardcoded dark colors**
Cari semua instance ini di CSS dan wrap dalam `[data-theme="dark"]`:
- `background: rgba(13, 16, 32, .80)` 
- `background: linear-gradient(145deg, #161624, #12121E)`
- `background: linear-gradient(145deg, rgba(22,22,34,.9), rgba(14,14,22,.95))`
- `border: 1px solid rgba(255,255,255,.07)`
- `border: 1px solid rgba(255,255,255,.08)`
- `color: rgba(255,255,255,0.x)` yang hardcoded (ganti dengan `var(--t)` atau `var(--t2)`)

**Step 3: Konsolidasi 3 `:root` blocks menjadi 1**
Saat ini ada `:root` di line 29, line ~3778, dan line ~3839. Gabungkan semua jadi satu blok di atas.

**Step 4: Bersihkan `[data-theme="dark"]` yang duplikat**
Cari duplicate `[data-theme="dark"]` blocks (ada 140+ rules tersebar) — konsolidasi menjadi satu section.

**Step 5: Fix overlay opacity untuk light mode**
```css
/* Modal overlays */
.modal-ov { background: rgba(0,0,0,0.80); }
[data-theme="light"] .modal-ov { background: rgba(0,0,0,0.55); }

/* Onboarding overlay */
.onboarding-ov { background: rgba(0,0,0,0.88); }
[data-theme="light"] .onboarding-ov { background: rgba(0,0,0,0.65); }

/* Fi-modal overlay */
.fi-modal-ov { background: rgba(0,0,0,0.85); }
[data-theme="light"] .fi-modal-ov { background: rgba(0,0,0,0.60); }
```

---

### 1.3 — Fix Onboarding + Fi-Modal Overlap Bug

**Masalah:** `showFirstInsightModal()` bisa dipanggil saat onboarding masih terbuka, menyebabkan dua overlay muncul bersamaan.

**Fix:**
```javascript
function showFirstInsightModal(post) {
  // Guard: jangan tampilkan kalau onboarding masih terbuka
  const onboardingEl = document.getElementById('onboarding-ov');
  if (onboardingEl && !onboardingEl.classList.contains('hidden')) return;
  
  // ... rest of function unchanged
}
```

---

### 1.4 — Fix XSS Vulnerabilities (21 instance)

**Masalah:** Ada 21 tempat di mana user input langsung masuk ke `innerHTML` tanpa sanitasi. Ini aman sekarang karena single-user, tapi harus difix sebelum multi-user.

**Step 1: Install DOMPurify**
Tambahkan di `<head>` setelah script CDN lainnya:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js"></script>
```

**Step 2: Buat helper function**
```javascript
function safeHTML(str) {
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(str, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'] });
  }
  // Fallback minimal escaping
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

**Step 3: Audit dan wrap semua user input yang masuk innerHTML**
Khusus untuk field-field ini (paling berisiko):
- `p.caption` / `p.name` / `p.title` — nama konten dari input user
- `p.link` — URL dari input user  
- `g.label` — nama goal dari input user
- `c.name` — nama kompetitor dari input user
- `userProfile.displayName` — nama display dari settings

Pattern yang harus dicari dan difix:
```javascript
// SEBELUM (berbahaya)
el.innerHTML = `<div>${p.caption}</div>`;

// SESUDAH (aman)
el.innerHTML = `<div>${safeHTML(p.caption)}</div>`;
```

---

### 1.5 — Fix getAllPosts() Performance

**Masalah:** `getAllPosts()` dipanggil 18 kali per render cycle, masing-masing iterasi semua `months → weeks → accounts → platforms`. Dengan data besar ini O(n⁴).

**Fix: Tambah simple caching dengan dirty flag**

```javascript
let _postsCache = null;
let _postsCacheDirty = true;

function invalidatePostsCache() {
  _postsCacheDirty = true;
  _postsCache = null;
}

function getAllPosts() {
  if (!_postsCacheDirty && _postsCache !== null) return _postsCache;
  
  const result = [];
  months.forEach(mo => {
    mo.weeks?.forEach(wk => {
      accounts.forEach(a => {
        allPlatforms().forEach(plt => {
          const d = aD(wk, a);
          const posts = d[plt.id + 'Posts'] || [];
          posts.forEach(p => {
            result.push({ ...p, _mo: mo.id, _wk: wk.id, _acc: a, _plt: plt.id });
          });
        });
      });
    });
  });
  
  _postsCache = result;
  _postsCacheDirty = false;
  return result;
}
```

Panggil `invalidatePostsCache()` di setiap fungsi yang mengubah data post (`scheduleSave`, `deletePostById`, `_qcBuildPost`, `_restorePost`).

---

## FASE 2 — Code Quality & CSS Architecture

### 2.1 — Hapus 828 Inline Styles

**Ini adalah perubahan terbesar dan paling visible.** Inline styles adalah signature utama "AI vibe coding".

**Strategi:**

**Step 1: Identifikasi pattern yang paling sering muncul**

Jalankan audit ini untuk menemukan inline style patterns yang paling sering:
```javascript
// Jalankan di browser console untuk audit
const els = document.querySelectorAll('[style]');
const patterns = {};
els.forEach(el => {
  const s = el.getAttribute('style');
  patterns[s] = (patterns[s] || 0) + 1;
});
console.table(Object.entries(patterns).sort((a,b) => b[1]-a[1]).slice(0,30));
```

**Step 2: Buat utility classes untuk pattern yang paling sering**

Tambahkan ke CSS (jangan inline lagi):
```css
/* Utility classes - ganti inline styles yang berulang */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-8 { gap: 8px; }
.gap-12 { gap: 12px; }
.gap-16 { gap: 16px; }
.p-12 { padding: 12px; }
.p-16 { padding: 16px; }
.mt-8 { margin-top: 8px; }
.mt-16 { margin-top: 16px; }
.text-sm { font-size: 12px; }
.text-xs { font-size: 11px; }
.font-bold { font-weight: 700; }
.font-800 { font-weight: 800; }
.color-t2 { color: var(--t2); }
.color-t3 { color: var(--t3); }
.color-accent { color: var(--accent); }
.w-full { width: 100%; }
.rounded { border-radius: var(--radius); }
.rounded-lg { border-radius: var(--radius-lg); }
.border { border: 1px solid var(--b); }
.bg-surf { background: var(--surf); }
.bg-hover { background: var(--bg-hover); }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cursor-pointer { cursor: pointer; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; min-width: 0; }
```

**Step 3: Ganti di HTML template strings**

Prioritas utama — section-section yang paling sering di-render (karena ini yang paling terasa):
- `renderDashboard()` template strings
- `renderGoals()` template strings  
- `renderContentTimeline()` template strings
- `buildGoalHistoryHTML()` template strings
- Semua modal HTML

**Target:** Kurangi dari 828 ke maksimal 100 inline styles (hanya untuk dynamic values seperti `width: ${pct}%` yang memang perlu inline).

---

### 2.2 — Hapus 152 Duplicate CSS Selectors

**Cara approach:**

1. Export semua CSS ke file temporary
2. Audit duplicate selectors
3. Gabungkan rules yang sama ke satu lokasi
4. Susun ulang CSS dengan struktur yang jelas:

```css
/* ====================================
   STRUKTUR CSS YANG BENAR
   ==================================== */

/* 1. CSS Variables & Reset */
:root { ... }
[data-theme="dark"] { ... }
* { box-sizing: border-box; }

/* 2. Base Elements */
html, body { ... }
h1, h2, h3 { ... }

/* 3. Layout */
.app { ... }
.nav-sidebar { ... }
.main-area { ... }
.topbar { ... }
.view { ... }

/* 4. Navigation */
.nav-item { ... }
.nav-brand { ... }
/* ... */

/* 5. Components - per komponen */
/* 5a. KPI Cards */
.kpi-card { ... }
/* 5b. Modals */
.modal { ... }
/* dst */

/* 6. Views - per view */
/* 6a. Dashboard */
/* 6b. Analytics */
/* dst */

/* 7. Utilities */
/* 8. Responsive */
@media (max-width: 768px) { ... }

/* 9. Dark Mode Overrides */
[data-theme="dark"] .specific-component { ... }
```

---

### 2.3 — Namespace Global Variables

**Masalah:** 47 global variables (`months`, `accounts`, `platforms`, dll.) semua exposed ke `window`. Rentan corrupt dan tidak ada encapsulation.

**Fix: Bungkus dalam object namespace**

```javascript
// Ganti semua global let/var dengan satu object
const App = {
  // State
  state: {
    months: [],
    accounts: [],
    platforms: [],
    customGoals: [],
    pillars: [],
    competitors: [],
    userProfile: { email: '', displayName: '', reminderEnabled: true },
    sel: { mid: null, wid: null, acc: null, plt: 'tt', erMode: 'impression' },
    // ... semua state lainnya
  },
  
  // Cache
  cache: {
    posts: null,
    postsDirty: true,
  },
  
  // UI state
  ui: {
    view: 'dash',
    charts: {},
    analyticsTab: 'trend',
    // ... semua UI state
  }
};
```

**Catatan penting:** Ini adalah refactor besar. Lakukan secara bertahap — mulai dari satu variabel, test, lanjut ke berikutnya. Jangan ganti semua sekaligus atau akan banyak error.

---

### 2.4 — Tambah Accessibility Minimum

**Masalah:** Hanya 1 aria-label di seluruh file. Ini buruk untuk screen reader dan juga untuk SEO.

**Yang harus ditambahkan (minimum viable accessibility):**

```html
<!-- Semua icon-only buttons WAJIB punya aria-label -->
<button aria-label="Hapus post ini" onclick="deletePost(...)">🗑</button>
<button aria-label="Edit post" onclick="editPost(...)">✏️</button>
<button aria-label="Tambah post baru" onclick="openQCModal()">+</button>
<button aria-label="Toggle dark mode" onclick="toggleTheme()">🌙</button>

<!-- Semua modal WAJIB punya role dan aria attributes -->
<div class="modal-ov" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal">
    <h2 id="modal-title">Judul Modal</h2>
    <!-- content -->
  </div>
</div>

<!-- Navigation landmark -->
<nav class="nav-sidebar" aria-label="Navigasi utama">

<!-- Main content landmark -->
<main class="main-area" id="main-content">
```

**Target:** Tambahkan minimal 30 aria-label/role attributes, fokus pada semua button yang icon-only.

---

## FASE 3 — Error Handling & Resilience

### 3.1 — Tambah Error States

**Masalah:** Tidak ada error state. Kalau `renderDashboard()` throw error, user lihat blank screen.

**Buat global error boundary:**

```javascript
function renderView(renderFn, viewId) {
  try {
    renderFn();
  } catch (error) {
    console.error(`Error rendering ${viewId}:`, error);
    const el = document.getElementById(viewId);
    if (el) {
      el.innerHTML = `
        <div class="error-state">
          <div class="error-ico">⚠️</div>
          <div class="error-title">Terjadi kesalahan</div>
          <div class="error-msg">Halaman ini tidak bisa dimuat. Coba refresh browser.</div>
          <button onclick="location.reload()" class="btn-ok" style="margin-top:16px;">
            Refresh Halaman
          </button>
        </div>
      `;
    }
  }
}

// Gunakan di semua render calls
renderView(() => renderDashboard(), 'v-dash');
renderView(() => renderAnalytics(), 'v-analytics');
// dst
```

**Tambahkan CSS untuk error state:**
```css
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 12px;
  color: var(--t3);
  text-align: center;
  padding: 40px;
}
.error-ico { font-size: 48px; opacity: 0.5; }
.error-title { font-size: 16px; font-weight: 800; color: var(--t2); }
.error-msg { font-size: 13px; max-width: 320px; line-height: 1.6; }
```

---

### 3.2 — Auto-backup Warning yang Benar

**Masalah:** Data di localStorage bisa hilang kalau user clear browser. Tidak ada warning yang actionable.

**Implementasi:**

```javascript
const BACKUP_REMINDER_KEY = 'cr-last-backup-reminder';
const BACKUP_DONE_KEY = 'cr-last-backup-done';

function checkBackupReminder() {
  try {
    const allPosts = getAllPosts();
    if (allPosts.length < 5) return; // Tidak perlu reminder kalau data sedikit
    
    const lastReminder = localStorage.getItem(BACKUP_REMINDER_KEY);
    const lastDone = localStorage.getItem(BACKUP_DONE_KEY);
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    // Tampilkan reminder kalau sudah 7 hari sejak backup terakhir
    const shouldRemind = !lastDone || (now - parseInt(lastDone)) > sevenDays;
    const notTooFrequent = !lastReminder || (now - parseInt(lastReminder)) > 24 * 60 * 60 * 1000;
    
    if (shouldRemind && notTooFrequent) {
      localStorage.setItem(BACKUP_REMINDER_KEY, now.toString());
      showBackupReminderToast();
    }
  } catch(e) {}
}

function showBackupReminderToast() {
  // Toast dengan tombol action
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:var(--surf);border:1.5px solid var(--amber);
    color:var(--t);padding:12px 16px;border-radius:12px;
    font-size:13px;font-weight:600;z-index:9997;
    box-shadow:0 8px 24px rgba(0,0,0,0.3);
    display:flex;align-items:center;gap:12px;white-space:nowrap;
  `;
  t.innerHTML = `
    <span>⚠️ Backup data kamu sekarang — data tersimpan di browser ini saja.</span>
    <button onclick="exportJSONBackup();localStorage.setItem('${BACKUP_DONE_KEY}',Date.now());this.closest('div').remove()" 
      style="padding:6px 14px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:700;cursor:pointer;">
      Backup Sekarang
    </button>
    <button onclick="this.closest('div').remove()" 
      style="padding:6px 10px;border-radius:8px;border:1px solid var(--b);background:none;color:var(--t3);font-size:12px;cursor:pointer;">
      Nanti
    </button>
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 15000);
}
```

Panggil `checkBackupReminder()` di `initApp()` dengan delay:
```javascript
setTimeout(checkBackupReminder, 10000); // 10 detik setelah load
```

---

## FASE 4 — Minor Polish

### 4.1 — Tambah Google Form Feedback Link

Di settings panel, di section "Tentang":
```html
<div class="settings-row">
  <div class="settings-row-left">
    <div class="settings-row-label">Feedback & Bug Report</div>
    <div class="settings-row-sub">Bantu improve Creatorlytics</div>
  </div>
  <a href="https://forms.gle/LINK_FORM_DISINI" target="_blank" 
     class="settings-action-btn" style="text-decoration:none;text-align:center;">
    Isi Form →
  </a>
</div>
```

### 4.2 — Fix Version String

Ganti semua referensi ke version yang hardcoded:
```javascript
const APP_VERSION = '1.0.0-beta';
const APP_BUILD_DATE = '2025';
```

Tampilkan di Settings > Tentang:
```
Creatorlytics v1.0.0-beta
© 2025 · Local-only mode
```

### 4.3 — Tambah Print/Export CSS

```css
@media print {
  .nav-sidebar,
  .topbar,
  .mob-nav,
  .qc-fab,
  .view:not(.active) { display: none !important; }
  
  .main-area { overflow: visible; }
  .view.active { display: block; overflow: visible; }
  body { background: white; color: black; }
}
```

### 4.4 — Keyboard Accessibility untuk Modals

Semua modal harus punya keyboard trap yang proper:
```javascript
function trapFocus(modalEl) {
  const focusableSelectors = 'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';
  const focusable = modalEl.querySelectorAll(focusableSelectors);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  modalEl.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  
  // Auto-focus first element
  setTimeout(() => first?.focus(), 50);
}

// Panggil di openModal():
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  trapFocus(el);
}
```

---

## Checklist Final Sebelum Beta

Setelah semua fase selesai, cek ini satu per satu di browser Chrome, Firefox, dan HP Android:

**Fungsionalitas Dasar:**
- [ ] Onboarding jalan tanpa bug (tidak overlap dengan fi-modal)
- [ ] Quick Add Post bisa input dan tersimpan
- [ ] Dark mode ↔ Light mode toggle tanpa FOUC
- [ ] Light mode terlihat konsisten di semua view
- [ ] PDF preview dan export jalan
- [ ] Import CSV jalan
- [ ] Export JSON backup dan import jalan
- [ ] Undo delete jalan
- [ ] Keyboard shortcuts jalan (N, /, Esc, G+x, ?)
- [ ] Settings panel tersimpan dengan benar

**Visual:**
- [ ] Tidak ada teks "Mode: Dev" atau "tersimpan lokal" yang bikin anxiety
- [ ] Semua modal punya overlay yang cukup gelap (tidak tembus)
- [ ] Topbar tidak flash dark saat load di light mode
- [ ] Tidak ada komponen yang punya warna hardcoded yang salah di light mode

**Performance:**
- [ ] Switching view terasa instant
- [ ] Input di Quick Add Modal responsive tanpa lag
- [ ] Dengan 50+ post, dashboard tidak lemot

**Error Handling:**
- [ ] Kalau render error, muncul error state bukan blank screen
- [ ] Backup reminder muncul setelah 7 hari tidak backup

---

## Catatan Penting untuk Claude Opus

1. **Kerjakan berurutan** — Fase 1 dulu, baru Fase 2, baru Fase 3, baru Fase 4. Jangan lompat.

2. **Test setiap perubahan** — Setelah setiap perubahan major, pastikan app masih bisa dibuka dan fungsi utama masih jalan.

3. **Backup sebelum edit** — Sebelum mulai, duplikasi file original sebagai backup.

4. **Jangan tambah fitur baru** — Scope refactor ini adalah perbaikan kualitas, bukan penambahan fungsionalitas.

5. **Inline styles yang boleh tetap ada** — Hanya untuk dynamic values yang memang perlu inline:
   - `style="width: ${percentage}%"` — nilai yang berubah berdasarkan data
   - `style="color: ${pillar.color}"` — warna yang datang dari data user
   - `style="background: ${someColor}"` — warna dynamic dari computed value
   Selain itu, semua harus pindah ke CSS class.

6. **Jangan ubah logic bisnis** — Yang diubah adalah cara kode ditulis, bukan apa yang kode lakukan. Kalau tidak yakin apakah perubahan akan mempengaruhi behavior, tanya dulu.

7. **Setelah selesai, jalankan syntax check:**
```javascript
// Di Node.js, untuk cek JS syntax
node -e "
const fs = require('fs');
const html = fs.readFileSync('Sosmed.html', 'utf8');
let idx = 0, bn = 0;
while ((idx = html.indexOf('<script>', idx)) !== -1) {
  const end = html.indexOf('</script>', idx);
  const src = html.slice(idx+8, end); bn++;
  try { new Function(src); console.log('Block', bn, ': OK'); }
  catch(e) { console.log('Block', bn, ': ERROR -', e.message); }
  idx = end + 9;
}
"
```

---

## Summary Prioritas

| Fase | Item | Impact | Effort | Urutan |
|------|------|--------|--------|--------|
| 1.1 | Fix messaging anxiety | Tinggi | Rendah | 1 |
| 1.2 | Fix light mode + FOUC | Tinggi | Medium | 2 |
| 1.3 | Fix onboarding overlap | Tinggi | Rendah | 3 |
| 1.4 | Fix XSS vulnerabilities | Tinggi | Medium | 4 |
| 1.5 | Cache getAllPosts() | Medium | Rendah | 5 |
| 2.1 | Hapus inline styles | Tinggi | Tinggi | 6 |
| 2.2 | Hapus duplicate CSS | Medium | Medium | 7 |
| 2.3 | Namespace global vars | Medium | Tinggi | 8 |
| 2.4 | Tambah accessibility | Medium | Medium | 9 |
| 3.1 | Error states | Medium | Medium | 10 |
| 3.2 | Auto-backup reminder | Medium | Medium | 11 |
| 4.x | Minor polish | Rendah | Rendah | 12 |
