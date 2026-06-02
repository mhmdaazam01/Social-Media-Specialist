# ⚡ Quick Fix: Analytics Platform Filter

## 🐛 Problem:
Pas pilih platform (Instagram/TikTok) di Analytics, data jadi nol.

## ✅ Solution (5 Menit):

### Step 1: Buka Supabase Dashboard

1. Login ke https://supabase.com/dashboard
2. Pilih project **Creatorlytics**
3. Klik **SQL Editor** di sidebar

### Step 2: Run SQL Fix

Copy-paste SQL ini ke SQL Editor:

```sql
-- Normalize platform IDs: lowercase full names
UPDATE platforms SET platform_id = LOWER(name);
UPDATE posts SET platform = LOWER(platform);

-- Verify: Should see "MATCHED ✓" for all
SELECT 
  p.platform,
  COUNT(*) as post_count,
  CASE 
    WHEN pl.platform_id IS NOT NULL THEN 'MATCHED ✓'
    ELSE 'NOT MATCHED ✗'
  END as status
FROM posts p
LEFT JOIN platforms pl ON p.platform = pl.platform_id
GROUP BY p.platform, pl.platform_id
ORDER BY post_count DESC;
```

**Klik "Run"** ▶️

### Step 3: Check Results

Output harus seperti ini:

```
| platform   | post_count | status      |
|------------|------------|-------------|
| instagram  | 3          | MATCHED ✓   |
| tiktok     | 2          | MATCHED ✓   |
```

Semua harus **"MATCHED ✓"**!

### Step 4: Test di App

1. **Refresh app** (Ctrl + Shift + R)
2. **Buka Analytics**
3. **Pilih platform** (Instagram/TikTok)
4. **Data harus muncul!** ✅

---

## 🔍 Debug (Kalau Masih Error):

### Check Console (F12):

Buka Analytics page, terus:

```
🔍 [Analytics] Filter platform: instagram
🔍 [Analytics] Posts before filter: [
  { name: "Post 1", platform: "instagram" },  ← Harus SAMA!
  { name: "Post 2", platform: "tiktok" }
]
✅ [Analytics] Posts after filter: 1  ← Harus > 0!
```

**Yang Penting:** `platform` di posts harus **SAMA PERSIS** dengan filter!

---

## 📄 Alternative: Use Full SQL Script

Kalau mau lebih thorough, run file **`fix-platform-ids.sql`** (ada di root folder).

Step by step nya ada di file itu.

---

## 🆘 Kalau Masih Stuck:

Screenshot 2 hal:
1. **Console output** (F12 → Console → pilih platform)
2. **SQL query result** (dari Step 2 di atas)

Kasih tau aku! 🚀
