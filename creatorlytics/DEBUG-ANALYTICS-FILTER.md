# 🐛 Debug Guide - Analytics Filter Platform Nol

## Masalah:
Pas filter platform (Instagram/TikTok) di Analytics, datanya jadi nol semua. Tapi kalau pilih "Semua Platform", datanya ada.

## ✅ Yang Sudah Diperbaiki:
1. Migrate `AnalyticsFilter` dari Zustand → Supabase hooks
2. Tambah debug logging di Console

## 🔍 Cara Debug:

### Step 1: Buka Console (F12)

1. **Buka halaman Analytics** di app
2. **Tekan F12** → tab "Console"
3. **Lihat output debug:**

```
🔍 [Analytics] All posts: 5
🔍 [Analytics] Filter platform: all
🔍 [Analytics] Available platforms: [
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" }
]
✅ [Analytics] Final filtered posts: 5
```

### Step 2: Filter ke Platform Specific

1. **Pilih "Instagram"** di dropdown
2. **Lihat Console lagi:**

```
🔍 [Analytics] All posts: 5
🔍 [Analytics] Filter platform: instagram
🔍 [Analytics] Available platforms: [...]
🔍 [Analytics] Posts before filter: [
  { name: "qwe", platform: "tiktok" },
  { name: "123", platform: "instagram" },
  { name: "2323", platform: "instagram" },
  { name: "12323", platform: "tiktok" },
  { name: "qwee", platform: "instagram" }
]
🔍 [Analytics] Posts after filter: 3
✅ [Analytics] Final filtered posts: 3
```

### Step 3: Analisa Output

**Bandingkan:**
- **Filter platform**: `"instagram"` (yang dipilih di dropdown)
- **Post platform**: `"tiktok"`, `"instagram"` (yang ada di data)

**Kalau tidak match** (misal filter pakai `"ig"` tapi data pakai `"instagram"`), maka filtered posts akan 0.

---

## 🐞 Kemungkinan Penyebab:

### Penyebab 1: Platform ID Mismatch

**Problem:**
- Platform table punya ID: `"ig"`, `"tt"`
- Posts table punya platform: `"instagram"`, `"tiktok"`
- Filter pakai ID dari platform table, jadi tidak match!

**Solusi:**
Samakan platform ID antara posts dan platforms.

**Cara Fix:**

#### Option A: Update Posts di Database
Ubah platform ID di posts table:
1. Buka Supabase Dashboard → SQL Editor
2. Run query:
```sql
-- Update posts yang pakai full name jadi pakai ID
UPDATE posts 
SET platform = 'ig' 
WHERE platform = 'instagram';

UPDATE posts 
SET platform = 'tt' 
WHERE platform = 'tiktok';

-- Lihat hasilnya
SELECT DISTINCT platform FROM posts;
```

#### Option B: Update Platform Table
Atau ubah platform_id di platforms table biar match:
```sql
-- Update platform ID jadi full name
UPDATE platforms 
SET platform_id = 'instagram' 
WHERE platform_id = 'ig';

UPDATE platforms 
SET platform_id = 'tiktok' 
WHERE platform_id = 'tt';

-- Lihat hasilnya
SELECT * FROM platforms;
```

**Rekomendasi:** **Option B** lebih baik karena platform_id jadi lebih readable.

---

### Penyebab 2: Case Sensitivity

**Problem:**
- Platform table: `"Instagram"` (capital I)
- Posts table: `"instagram"` (lowercase)
- JavaScript comparison case-sensitive!

**Solusi:**
Normalize semua jadi lowercase.

```sql
-- Lowercase semua platform di posts
UPDATE posts 
SET platform = LOWER(platform);

-- Lowercase semua platform_id di platforms
UPDATE platforms 
SET platform_id = LOWER(platform_id);
```

---

## 🧪 Test Setelah Fix:

1. **Refresh app** (Ctrl + Shift + R)
2. **Buka Analytics**
3. **Pilih "Instagram"** di filter
4. **Cek Console:**
   - Filter platform harus match dengan post platform
   - Filtered posts > 0

---

## 📊 Contoh Output yang Benar:

```
🔍 [Analytics] Filter platform: instagram
🔍 [Analytics] Posts before filter: [
  { name: "qwe", platform: "tiktok" },
  { name: "123", platform: "instagram" }, ← MATCH!
  { name: "2323", platform: "instagram" }, ← MATCH!
  { name: "12323", platform: "tiktok" },
  { name: "qwee", platform: "instagram" } ← MATCH!
]
🔍 [Analytics] Posts after filter: 3 ← Bukan 0!
```

---

## 🚨 Quick Fix SQL (Jalankan di Supabase SQL Editor):

```sql
-- 1. Cek dulu platform apa aja yang ada di posts
SELECT DISTINCT platform FROM posts;

-- 2. Cek platform_id di platforms table  
SELECT platform_id, name FROM platforms;

-- 3. Kalau beda, samakan:
-- Pilih salah satu (A atau B):

-- Option A: Normalize ke lowercase full name
UPDATE platforms SET platform_id = LOWER(name);
UPDATE posts SET platform = LOWER(platform);

-- Option B: Normalize ke short code
-- (Sesuaikan dengan data kamu)
UPDATE posts SET platform = 'ig' WHERE platform ILIKE '%instagram%';
UPDATE posts SET platform = 'tt' WHERE platform ILIKE '%tiktok%';
UPDATE platforms SET platform_id = 'ig' WHERE name ILIKE '%instagram%';
UPDATE platforms SET platform_id = 'tt' WHERE name ILIKE '%tiktok%';
```

---

## 💡 Prevention:

Biar tidak terjadi lagi, pastikan **saat tambah post baru**, platform ID yang disimpan **sama persis** dengan platform_id di platforms table.

Di PostModal, sudah pakai dropdown yang ambil dari platforms table, jadi seharusnya sudah consistent. Tapi kalau ada post lama yang manual entry atau import CSV, bisa jadi pakai ID yang beda.

---

**Setelah deploy selesai, buka app → F12 → Console → test filter → screenshot console output → kasih tau aku hasilnya!** 🚀
