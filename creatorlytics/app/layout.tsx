import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creatorlytics",
  description: "Social media analytics dashboard untuk kreator Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Reads theme cookie BEFORE paint to eliminate flash */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/);var t=c?c[1]:'light';if(t!=='dark')t='light';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
