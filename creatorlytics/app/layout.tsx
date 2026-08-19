import type { Metadata } from "next";
import { Inter, Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className={`min-h-full ${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
