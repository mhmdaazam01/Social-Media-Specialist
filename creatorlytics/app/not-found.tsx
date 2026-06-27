import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Providers } from '@/components/providers/Providers';
import Script from 'next/script';
import { Bricolage_Grotesque, DM_Sans, DM_Mono, Inter } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export default function NotFound() {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Reads theme cookie BEFORE paint to eliminate flash */}
        <Script
          id="theme-init-not-found"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/);var t=c?c[1]:'light';if(t!=='dark')t='light';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
        <Providers>
          <div className="flex min-h-screen flex-col items-center justify-center bg-cly-bg px-4 text-center">
            <div className="text-8xl font-extrabold tracking-widest text-cly-brand animate-pulse">
              404
            </div>
            <div className="bg-cly-brand-tint text-cly-brand px-3 py-1 text-xs rounded-full uppercase tracking-wider font-semibold transform rotate-6 -mt-3 mb-8">
              Halaman Tidak Ditemukan
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-cly-text">Kamu Tersesat!</h2>
            <p className="text-sm text-cly-text-muted max-w-md mb-8">
              Halaman yang kamu cari tidak ada atau telah dipindahkan ke alamat lain.
            </p>
            <Link href="/dashboard">
              <Button size="default" className="bg-cly-brand hover:bg-cly-brand-hover text-white">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </Providers>
      </body>
    </html>
  );
}
