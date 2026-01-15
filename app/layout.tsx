import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import SimpsonsHeader from "@/app/_components/SimpsonsHeader";
import HelpButton from "@/app/_components/HelpButton";
import { Toaster } from "@/app/_components/Toaster";
import { MobileMenuButton } from "@/app/_components/MobileMenuButton";
import { CURRENT_YEAR, SITE_INFO } from "@/app/_lib/constants";
import { DesktopNav } from "@/app/_components/DesktopNav";
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
            <DesktopNav />
            <MobileMenuButton />
          </div>
        </nav>
        <SimpsonsHeader />
        <main className="flex-1 bg-zinc-50 dark:bg-black">{children}</main>
        <HelpButton />
        <Toaster />
        <footer className="border-t bg-white dark:bg-zinc-950 py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © {CURRENT_YEAR} {SITE_INFO.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/guide"
                className="text-zinc-600 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded px-2 py-1"
              >
                About
              </Link>
              <a
                href="https://github.com/JordiNodeJS/thesimpsonsapi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded px-2 py-1"
              >
                GitHub
              </a>
            </div>
            <p className="text-sm font-medium">
              Creado por{" "}
              <a
                href={SITE_INFO.creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-600 hover:text-yellow-500 transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded"
              >
                {SITE_INFO.creator}
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
