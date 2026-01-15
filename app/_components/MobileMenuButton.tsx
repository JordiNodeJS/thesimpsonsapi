"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MobileMenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menú de navegación"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          className="focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
          <span className="ml-2">Menu</span>
        </Button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 md:hidden animate-fadeIn"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className="fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-zinc-950 border-l-2 border-zinc-300 dark:border-zinc-700 shadow-[0_0_60px_rgba(0,0,0,0.8)] z-50 md:hidden animate-slideInRight"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            <div className="flex flex-col h-full">
              {/* Header del drawer */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="font-black text-lg tracking-tighter uppercase italic">
                  Springfield <span className="text-yellow-500">Life</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="h-8 w-8 p-0 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-1 p-4">
                <MobileNavLink href="/episodes" currentPath={pathname}>
                  Episodes
                </MobileNavLink>
                <MobileNavLink href="/characters" currentPath={pathname}>
                  Characters
                </MobileNavLink>
                <MobileNavLink href="/diary" currentPath={pathname}>
                  Diary
                </MobileNavLink>
                <MobileNavLink href="/collections" currentPath={pathname}>
                  Collections
                </MobileNavLink>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

interface MobileNavLinkProps {
  href: string;
  currentPath: string;
  children: React.ReactNode;
}

function MobileNavLink({ href, currentPath, children }: MobileNavLinkProps) {
  const isActive = currentPath.startsWith(href);

  return (
    <Link
      href={href}
      className={`
        px-4 py-3 rounded-lg font-bold uppercase tracking-widest text-sm
        transition-all duration-200
        ${
          isActive
            ? "bg-yellow-500 text-white shadow-md"
            : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }
      `}
    >
      {children}
    </Link>
  );
}
