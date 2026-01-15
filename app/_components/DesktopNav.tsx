"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/episodes", label: "Episodes" },
  { href: "/characters", label: "Characters" },
  { href: "/diary", label: "Diary" },
  { href: "/collections", label: "Collections" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "transition-colors hover:text-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded px-2 py-1",
              isActive
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-zinc-900 dark:text-zinc-100"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
