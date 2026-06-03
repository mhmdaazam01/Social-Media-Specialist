'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🔴 [Error Boundary]:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="rounded-full bg-red-500/10 p-4 text-red-500 mb-4 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Terjadi Kesalahan!</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Maaf, sistem mengalami gangguan saat memproses permintaan Anda. Kami telah mencatat kesalahan ini.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} size="default">
          Coba Lagi
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/dashboard')}
        >
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
}
