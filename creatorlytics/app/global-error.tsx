'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className={`min-h-full ${inter.className}`}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-cly-bg p-4 text-center">
          <div className="max-w-md w-full bg-cly-surface border border-cly-border rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <AlertCircle className="size-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-cly-text mb-2">Terjadi Kesalahan Kritis</h1>
            
            <p className="text-cly-text-2 mb-6 text-sm">
              Sistem mendeteksi kesalahan yang tidak terduga. Silakan coba muat ulang halaman.
              <br />
              <span className="text-xs text-cly-text-3 mt-2 block break-words">
                Error: {error.message || 'Unknown error'}
              </span>
            </p>

            <div className="flex gap-3 w-full">
              <Button 
                onClick={() => reset()} 
                className="flex-1 gap-2 bg-cly-brand hover:bg-cly-brand-hover text-white"
              >
                <RefreshCcw className="size-4" />
                Coba Lagi
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => {
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                window.location.href = '/dashboard';
              }}>
                  <Home className="size-4" />
                  Dashboard
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
