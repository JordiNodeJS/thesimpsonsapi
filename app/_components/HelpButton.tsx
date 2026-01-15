"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HelpButton() {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsTooltipVisible(true);
    }, 500);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsTooltipVisible(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[45] flex items-end gap-3">
      {/* Tooltip */}
      {isTooltipVisible && (
        <div className="bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-xl border border-zinc-700 whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
          ¿Necesitas ayuda? 🍩
        </div>
      )}

      {/* Help Button */}
      <Link href="/guide" prefetch={false}>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="group relative w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center ring-4 ring-yellow-400/20 hover:ring-yellow-400/40"
          aria-label="Abrir guía de usuario"
        >
          {/* Question Mark Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-7 h-7 text-zinc-900 group-hover:rotate-12 transition-transform duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>

          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-yellow-400 opacity-75 animate-ping" />
        </button>
      </Link>
    </div>
  );
}
