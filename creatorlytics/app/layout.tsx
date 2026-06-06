import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Inline script: reads theme cookie BEFORE paint to eliminate flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var cookie = document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/);
    var theme = cookie ? cookie[1] : 'dark';
    if (theme !== 'light') theme = 'dark';
    document.documentElement.classList.add(theme);
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
            `.trim(),
          }}
        />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
