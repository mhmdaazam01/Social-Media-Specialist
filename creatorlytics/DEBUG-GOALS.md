# Debug Guide - Goals Tidak Muncul di Dashboard

## Yang Sudah Diperbaiki

1. ✅ **GoalProgress Component** - Sudah migrasi dari Zustand ke Supabase hooks
2. ✅ **GoalModal Component** - Sudah migrasi dan menambahkan proper async/await
3. ✅ **GoalCard Component** - Sudah menggunakan hooks yang benar
4. ✅ **Goals Page** - Sudah full migrasi ke Supabase
5. ✅ **Account Select Bug** - Fixed di PostModal dan CalEventModal (sekarang pakai name bukan ID)

## Cara Debug Jika Goals Masih Belum Muncul

### 1. Cek di Browser Console (F12)

Buka halaman Dashboard atau Goals, terus buka Console (F12) dan cek apakah ada error merah.

### 2. Cek Network Tab

1. Buka F12 → tab "Network"
2. Filter ke "Fetch/XHR"
3. Coba buat goal baru
4. Cari request ke: `https://xrqjwzucvaiuznghswem.supabase.co/rest/v1/goals`
5. Klik request itu dan lihat:
   - **Status**: harus 201 (Created) atau 200 (OK)
   - **Response**: harus ada data goal yang baru dibuat
   - Kalau ada error 401/403 → masalah auth
   - Kalau ada error 42501 → masalah RLS permissions

### 3. Cek di Supabase Dashboard

1. Login ke https://supabase.com/dashboard
2. Pilih project "Creatorlytics"
3. Klik "Table Editor" di sidebar
4. Buka table "goals"
5. Cek apakah data goal yang kamu buat ada di sana
6. Perhatikan kolom:
   - `user_id` → harus sama dengan user_id kamu
   - `month` → harus sesuai bulan yang kamu pilih
   - `year` → harus sesuai tahun yang kamu pilih

### 4. Cek Month & Year Filter

GoalProgress di dashboard **hanya menampilkan goals untuk bulan dan tahun sekarang**.

Saat ini (Juni 2026):
- `month` harus `6`
- `year` harus `2026`

Jadi kalau kamu buat goal untuk bulan lain, tidak akan muncul di dashboard.

**Solusi**: 
- Pastikan saat buat goal, pilih Bulan = 6 dan Tahun = 2026
- Atau buka file `lib/utils/formatting.ts` dan cek fungsi `currentMonth()` dan `currentYear()`

### 5. Test Step by Step

1. **Buka halaman Goals** (`/goals`)
2. **Klik "Buat Goal"**
3. **Isi form:**
   - Label: "Test Goal"
   - Target: 1000
   - Metrik: pilih apa aja
   - Platform: pilih apa aja
   - Bulan: **6**
   - Tahun: **2026**
4. **Klik "Buat"**
5. **Cek apakah:**
   - Muncul toast "Goal berhasil dibuat" ✓
   - Goal langsung muncul di halaman Goals ✓
   - Kalau refresh, goal masih ada ✓
6. **Buka Dashboard** (`/dashboard`)
7. **Cek section "Progress Goal":**
   - Harusnya muncul goal yang tadi dibuat
   - Dengan progress bar
   - Dan text progress (contoh: 0 / 1000 Followers)

### 6. Common Issues

#### Issue: Toast muncul tapi goal tidak muncul di list
**Penyebab**: Request ke Supabase gagal tapi tidak throw error
**Solusi**: 
1. Buka Console (F12)
2. Cek error merah
3. Kalau ada error permission → run ulang `fix-permissions.sql`

#### Issue: Goal muncul di /goals tapi tidak di dashboard
**Penyebab**: Month/year tidak sesuai dengan bulan/tahun sekarang
**Solusi**: Edit goal, ubah bulan ke 6 dan tahun ke 2026

#### Issue: Error "permission denied for table goals"
**Penyebab**: RLS policies belum di-apply atau tidak benar
**Solusi**:
1. Buka Supabase Dashboard
2. SQL Editor
3. Run ulang script dari `fix-permissions.sql`
4. Atau run manual:
```sql
-- Grant permissions
GRANT ALL ON public.goals TO authenticated;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'goals';
```

## Files yang Terlibat

- `components/dashboard/GoalProgress.tsx` - Widget di dashboard
- `components/goals/GoalModal.tsx` - Form buat/edit goal
- `components/goals/GoalCard.tsx` - Card di halaman goals
- `app/goals/page.tsx` - Halaman goals
- `lib/hooks/useGoals.ts` - Custom hook untuk data goals
- `types/index.ts` - Goal interface
- `supabase-schema.sql` - Database schema
- `fix-permissions.sql` - RLS policies & permissions

## Kontak

Kalau masih stuck, screenshot:
1. Browser Console (F12)
2. Network tab saat buat goal
3. Data di Supabase Table Editor (table goals)

Terus kasih tau error message yang muncul.
