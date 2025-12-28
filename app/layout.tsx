import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Springfield Life",
  description: "The ultimate Simpsons companion app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <nav className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight">
              Springfield Life
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link
                href="/episodes"
                className="hover:text-yellow-500 transition-colors"
              >
                Episodes
              </Link>
              <Link
                href="/characters"
                className="hover:text-yellow-500 transition-colors"
              >
                Characters
              </Link>
              <Link
                href="/diary"
                className="hover:text-yellow-500 transition-colors"
              >
                Diary
              </Link>
              <Link
                href="/collections"
                className="hover:text-yellow-500 transition-colors"
              >
                Collections
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 bg-zinc-50 dark:bg-black">{children}</main>
      </body>
    </html>
  );
}
