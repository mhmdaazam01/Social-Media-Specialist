# Creatorlytics Project Rules

## Styling
- Jika menggunakan Next.js dengan Tailwind CSS, selalu edit styling langsung di `className` menggunakan utility class Tailwind.
- Jangan membuat atau mengedit file CSS kustom (Custom CSS) kecuali untuk kasus yang sangat spesifik dan memang sangat dibutuhkan.

## Workflow
- Setelah selesai generate atau edit kode, SELALU jalankan pengecekan lint (`npm run lint`) dan typecheck (`npx tsc --noEmit`) untuk memastikan tidak ada error sebelum melaporkan ke user.
