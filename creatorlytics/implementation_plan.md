# Tailwind Migration & Code Check Plan

## Latar Belakang
Permintaan: Pindahkan gaya dari custom CSS (`landing.css`) ke class Tailwind langsung di komponen, dan lakukan pengecekan tipe (Typecheck) serta linter (ESLint).

## User Review Required
> [!WARNING]
> Migrasi 900+ baris CSS kompleks dari `landing.css` ke Tailwind utility classes akan mengubah seluruh struktur HTML di `app/page.tsx`. Proses ini akan menggantikan class custom (seperti `lp-dpanel`, `lp-aigrid`) menjadi class utilitas panjang (seperti `mt-4 bg-[#17181B] rounded-[14px] border border-[rgba(235,235,236,.11)] overflow-hidden`).
> **Apakah Anda setuju untuk melakukan rewrite ini secara penuh?** Jika ini hanya preference, perlu dicatat bahwa kode Tailwind-nya nanti akan cukup panjang. Jika setuju, saya akan segera mengeksekusinya.

> [!IMPORTANT]
> Saat ini `npm` sedang saya install di background menggunakan `winget` (Node.js LTS) karena sebelumnya tidak terdeteksi. Setelah instalasi selesai, terminal perlu direstart untuk memuat `npm` ke dalam sistem PATH agar saya bisa menjalankan linter dan typecheck. Jika instalasi background gagal (misalnya karena butuh izin Admin UAC), Anda mungkin harus menginstalnya sendiri secara manual (download Node.js dari website resmi).

## Proposed Changes

### 1. CSS Variables & Theme
Beberapa variabel seperti animasi kompleks (`lp-fadeUp`) dan gradient noise (grain) masih akan disimpan di `globals.css` karena Tailwind tidak memiliki default untuk fractal noise. Variabel warna khusus landing page (seperti `--lime`, `--s1`) akan saya pindahkan ke `@theme` di `globals.css` jika sering digunakan berulang kali.

#### [DELETE] `app/landing.css`
File ini akan dihapus sepenuhnya.

#### [MODIFY] `app/globals.css`
Menambahkan beberapa custom utility dan animasi yang sangat sulit atau kotor jika dibuat inline (misalnya animasi marquee infinite).

#### [MODIFY] `app/page.tsx`
Menulis ulang semua elemen JSX untuk langsung menggunakan Tailwind (menghapus import `landing.css`).

### 2. Linting & Typechecking
Menjalankan perintah berikut:
- `npm install` (untuk menginstall `node_modules`)
- `npx tsc --noEmit`
- `npm run lint`

## Verification Plan

### Automated Tests
- Menjalankan `npx tsc --noEmit` untuk memastikan tidak ada TS errors.
- Menjalankan `npm run lint` untuk memastikan tidak ada ESLint warnings.

### Manual Verification
- Pastikan tampilan UI Landing Page tidak rusak (pixel-perfect matching) setelah dipindahkan ke Tailwind.
