import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SimpsonsHeader from "@/app/_components/SimpsonsHeader";
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
        <nav className="border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-black text-2xl tracking-tighter uppercase italic group"
            >
              Springfield{" "}
              <span className="text-yellow-500 group-hover:text-yellow-600 transition-colors">
                Life
              </span>
            </Link>
            <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
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
            <div className="md:hidden">
              {/* Mobile menu could go here, but keeping it simple for now */}
              <Button variant="ghost" size="sm">
                Menu
              </Button>
            </div>
          </div>
        </nav>
        <SimpsonsHeader />
        <main className="flex-1 bg-zinc-50 dark:bg-black">{children}</main>
        <footer className="border-t bg-white dark:bg-zinc-950 py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © 2025 Springfield Life. All rights reserved.
            </p>
            <p className="text-sm font-medium">
              Creado por{" "}
              <a
                href="https://webcode.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-600 hover:text-yellow-500 transition-colors underline underline-offset-4"
              >
                webcode.es
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
