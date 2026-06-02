# 🐛 Cara Debug di Kiro

## 1. 🖥️ Lihat Console di Browser (Paling Mudah!)

### Step by Step:

1. **Buka aplikasi** di browser (http://localhost:3000)
2. **Tekan F12** atau klik kanan → "Inspect" → tab "Console"
3. **Refresh halaman** atau lakukan aksi (misal: buat goal baru)
4. **Lihat output di Console**

### Emoji Legend di Console:
- 🔍 = Info/Debug message
- ✅ = Success
- ❌ = Error

### Contoh Output yang Normal:

```
🔍 [useGoals] Fetching goals...
🔍 [useGoals] Response: { data: [...], error: null }
✅ [useGoals] Goals loaded: 3 goals

🔍 [GoalProgress] Filtering goals for: { month: 6, year: 2026 }
🔍 [GoalProgress] Total goals: 3
🔍 [GoalProgress] Goal: Test Goal - Month: 6 Year: 2026
🔍 [GoalProgress] Goal: Old Goal - Month: 5 Year: 2026
✅ [GoalProgress] Filtered goals: 1
```

### Contoh Output yang Error:

```
❌ [useGoals] Error: { code: '42501', message: 'permission denied for table goals' }
```

---

## 2. 🌐 Lihat Network Tab (Untuk Cek Request/Response)

### Step by Step:

1. **Buka F12** → tab "Network"
2. **Filter ke "Fetch/XHR"** (button di atas list)
3. **Lakukan aksi** (misal: buat goal)
4. **Klik request** yang muncul (biasanya URL ke Supabase)
5. **Lihat:**
   - **Headers**: status code (200 = ok, 400+ = error)
   - **Response**: data yang dikembalikan server
   - **Payload**: data yang dikirim ke server

### Contoh Network Request yang Normal:

**Request:**
```
URL: https://xrqjwzucvaiuznghswem.supabase.co/rest/v1/goals
Method: POST
Status: 201 Created
```

**Payload (data yang dikirim):**
```json
{
  "label": "Test Goal",
  "emoji": "",
  "target": 1000,
  "metric": "followers",
  "platform": "instagram",
  "month": 6,
  "year": 2026,
  "user_id": "..."
}
```

**Response (data yang dikembalikan):**
```json
{
  "id": "uuid-here",
  "label": "Test Goal",
  "target": 1000,
  ...
}
```

---

## 3. 📁 Tambah console.log di Code (Sudah Aku Tambahin!)

Sekarang di file-file ini sudah ada console.log:

### File: `lib/hooks/useGoals.ts`

**Sudah ada log di:**
- `fetchGoals()` - Saat fetch data dari Supabase
- `createGoal()` - Saat buat goal baru

**Kamu bisa tambahin lebih banyak:**
```typescript
console.log('Variabel apapun:', nilaiVariabel);
console.log('Data goal:', goal);
console.log('User ID:', user?.id);
```

### File: `components/dashboard/GoalProgress.tsx`

**Sudah ada log di:**
- Filter logic - Menampilkan berapa goals yang di-filter
- Detail setiap goal yang di-cek

---

## 4. 🔧 Cara Pakai getDiagnostics Tool (Built-in Kiro)

Kiro punya tool bawaan untuk cek TypeScript errors. Caranya:

1. **Klik file** yang mau dicek
2. **Terus bilang ke aku:** "cek diagnostics untuk file ini"
3. Aku akan jalankan tool dan kasih tau errornya

Atau kamu bisa manual run:
```bash
npm run build
```

Kalau ada TypeScript error, akan muncul di output.

---

## 5. 🎯 Debug Specific Issue: Goals Tidak Muncul

### Checklist:

#### ✅ Step 1: Cek Console Log
Buka dashboard, refresh, lihat console:
- Apakah ada `🔍 [useGoals] Fetching goals...`?
- Apakah ada `✅ [useGoals] Goals loaded: X goals`?
- Berapa jumlah goals yang loaded?

#### ✅ Step 2: Cek Filter
Lihat di console:
```
🔍 [GoalProgress] Filtering goals for: { month: 6, year: 2026 }
🔍 [GoalProgress] Total goals: 3
```

Bandingkan:
- **month** di log vs **month** goal kamu
- **year** di log vs **year** goal kamu

Kalau tidak sama → goal tidak akan muncul di dashboard!

#### ✅ Step 3: Cek Network Tab
Saat buat goal baru:
1. Buka Network tab
2. Filter ke "Fetch/XHR"
3. Cari request ke `/rest/v1/goals`
4. Klik dan lihat Response
5. Pastikan status `201 Created`

#### ✅ Step 4: Cek di Supabase Dashboard
1. Buka https://supabase.com/dashboard
2. Pilih project
3. Table Editor → goals
4. Lihat data di sana
5. Cek kolom `month` dan `year`

---

## 6. 💡 Tips Debugging

### Tip 1: Pakai console.log Sederhana
```typescript
// Di awal function
console.log('Function dipanggil!');

// Cek value variabel
console.log('Nilai goals:', goals);

// Cek kondisi
console.log('Apakah user ada?', !!user);
```

### Tip 2: Pakai console.table untuk Array
```typescript
// Lebih readable untuk array of objects
console.table(goals);
console.table(posts);
```

### Tip 3: Pakai debugger Statement
Tambahkan `debugger;` di code, browser akan pause di situ:
```typescript
async function createGoal(goal) {
  debugger; // Browser akan pause di sini
  const { data, error } = await supabase...
}
```

Terus kamu bisa inspect variabel di Console tab.

### Tip 4: Clear Console Regularly
Tekan tombol 🚫 (clear) di console atau `Ctrl + L` biar ga bingung.

---

## 7. 🚨 Common Errors dan Cara Bacanya

### Error: "permission denied for table goals"
**Artinya:** RLS policy di Supabase tidak mengizinkan akses
**Solusi:** Run `fix-permissions.sql` di Supabase SQL Editor

### Error: "null is not an object"
**Artinya:** Ada variabel yang undefined/null tapi kamu akses propertynya
**Contoh:** `user.id` tapi `user` = null
**Solusi:** Cek apakah user sudah loaded: `if (!user) return;`

### Error: "Cannot read property of undefined"
**Artinya:** Mirip di atas
**Solusi:** Pakai optional chaining: `user?.id`

### Warning: "Hydration mismatch"
**Artinya:** HTML dari server beda dengan HTML di client
**Solusi:** Biasanya gara-gara tanggal/waktu, pakai `useState` untuk data dynamic

---

## 8. 📝 Workflow Debug yang Efektif

1. **Identifikasi masalah**: "Goals tidak muncul di dashboard"
2. **Tambah console.log** di titik-titik kunci (sudah aku tambahin!)
3. **Buka Console** dan lakukan aksi
4. **Baca output** dari atas ke bawah
5. **Cari error** (emoji ❌) atau data yang unexpected
6. **Fix code** berdasarkan temuan
7. **Test lagi**
8. **Ulangi** sampai work

---

## 9. 🎬 Demo: Debug Goals Issue

### Skenario: Buat goal tapi tidak muncul di dashboard

**1. Buka dashboard → Console (F12)**

Output:
```
🔍 [useGoals] Fetching goals...
✅ [useGoals] Goals loaded: 1 goals
🔍 [GoalProgress] Filtering goals for: { month: 6, year: 2026 }
🔍 [GoalProgress] Goal: Test Goal - Month: 5 Year: 2026
✅ [GoalProgress] Filtered goals: 0
```

**Analisa:**
- Goals loaded = 1 ✅
- Tapi filtered = 0 ❌
- Kenapa? Goal `month: 5` tapi sekarang `month: 6`

**Solusi:** Edit goal, ubah bulan ke 6

---

**2. Buat goal baru → Console**

Output:
```
🔍 [useGoals] Creating goal: { label: "Test", target: 1000, ... }
❌ [useGoals] Create error: { code: '42501', message: 'permission denied' }
```

**Analisa:**
- Error permission ❌

**Solusi:** Run `fix-permissions.sql`

---

## 10. 🆘 Kalau Masih Stuck

Screenshot 3 hal ini dan kasih tau aku:

1. **Console tab** (full output)
2. **Network tab** (saat buat goal, klik request goals, screenshot Response)
3. **Supabase Table Editor** (screenshot table goals)

Aku akan bantu analyze! 🚀

---

## Quick Commands

```bash
# Build untuk cek TypeScript errors
npm run build

# Run dev server
npm run dev

# Kill process kalau stuck (Windows)
taskkill /F /IM node.exe

# Clear Next.js cache kalau weird
rm -rf .next
npm run build
```

Selamat debugging! 🐛✨
