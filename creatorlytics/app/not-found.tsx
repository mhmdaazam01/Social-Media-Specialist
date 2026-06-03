import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="text-8xl font-extrabold tracking-widest text-primary animate-pulse">404</div>
      <div className="bg-primary/20 text-primary px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold transform rotate-6 -mt-3 mb-8">
        Halaman Tidak Ditemukan
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Kamu Tersesat!</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Halaman yang kamu cari tidak ada atau telah dipindahkan ke alamat lain.
      </p>
      <Link href="/dashboard">
        <Button size="default">Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
