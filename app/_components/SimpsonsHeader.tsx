"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { UserNav } from "./UserNav";

const CLOUDS_COUNT = 4;

function BackgroundCloud({ index }: { index: number }) {
  const style = {
    top: `${10 + index * 20}%`,
    left: `${-10 + (index % 2) * 50}%`,
    animationName: "cloud-drift",
    animationDuration: `${30 + index * 10}s`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationDelay: `${index * -5}s`,
  } as React.CSSProperties;

  return (
    <div className="absolute opacity-40 pointer-events-none" style={style}>
      <svg
        width="180"
        height="100"
        viewBox="0 0 200 120"
        fill="currentColor"
        className="text-white/80"
        role="presentation"
        aria-hidden="true"
      >
        <circle cx="50" cy="70" r="40" />
        <circle cx="90" cy="60" r="45" />
        <circle cx="130" cy="70" r="40" />
        <circle cx="90" cy="85" r="35" />
      </svg>
    </div>
  );
}

function Donut() {
  return (
    <div 
      className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-110 cursor-help group"
      role="img"
      aria-label="Homer's favorite donut - decorative element"
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className="animate-bounce drop-shadow-xl w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
        role="presentation"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="#F3B0C3"
          stroke="#D18BA0"
          strokeWidth="2"
        />
        <circle
          cx="50"
          cy="50"
          r="12"
          fill="currentColor"
          className="text-sky-400 dark:text-sky-900"
        />
        <rect
          x="35"
          y="25"
          width="6"
          height="2"
          rx="1"
          fill="#FFD700"
          transform="rotate(45 35 25)"
        />
        <rect
          x="55"
          y="20"
          width="6"
          height="2"
          rx="1"
          fill="#4169E1"
          transform="rotate(-20 55 20)"
        />
        <rect
          x="70"
          y="40"
          width="6"
          height="2"
          rx="1"
          fill="#32CD32"
          transform="rotate(10 70 40)"
        />
        <rect
          x="65"
          y="65"
          width="6"
          height="2"
          rx="1"
          fill="#FF4500"
          transform="rotate(60 65 65)"
        />
        <rect
          x="40"
          y="75"
          width="6"
          height="2"
          rx="1"
          fill="#9370DB"
          transform="rotate(-45 40 75)"
        />
        <rect
          x="20"
          y="50"
          width="6"
          height="2"
          rx="1"
          fill="#FF69B4"
          transform="rotate(90 20 50)"
        />
      </svg>
      <div 
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
        role="tooltip"
      >
        Mmm... donuts
      </div>
    </div>
  );
}

function TvSet() {
  return (
    <div 
      className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-110 group"
      role="img"
      aria-label="Vintage television set - decorative element"
    >
      <div className="relative w-24 h-20 bg-purple-700 rounded-lg border-4 border-purple-900 shadow-xl flex items-center justify-center">
        {/* Screen */}
        <div className="w-16 h-12 bg-zinc-200 rounded overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent z-10" />
          <div className="w-full h-full bg-zinc-800 animate-pulse" />
        </div>
        {/* Knobs */}
        <div className="absolute right-1 top-2 flex flex-col gap-1">
          <div className="w-2 h-2 rounded-full bg-zinc-300 shadow-sm" />
          <div className="w-2 h-2 rounded-full bg-zinc-300 shadow-sm" />
        </div>
        {/* Antennas */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-8">
          <div className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-zinc-400 origin-bottom -rotate-[30deg]" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-8 bg-zinc-400 origin-bottom rotate-[30deg]" />
        </div>
      </div>
    </div>
  );
}

function DiaryBook() {
  return (
    <div 
      className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-110 group rotate-3"
      role="img"
      aria-label="Lisa's diary - decorative element"
    >
      <div className="relative w-20 h-24 bg-pink-500 rounded-r-lg border-l-8 border-l-zinc-800 shadow-xl flex flex-col items-center justify-center">
        <div className="absolute top-0 bottom-0 left-0 w-px bg-black/10" />
        <div className="w-12 h-16 border-2 border-pink-700/30 bg-white/10 rounded-sm" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-16 bg-zinc-200 rounded-r shadow-md border border-zinc-300" />{" "}
        {/* Pen */}
      </div>
    </div>
  );
}

function ComicBook() {
  return (
    <div 
      className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-110 group -rotate-6"
      role="img"
      aria-label="Radioactive Man comic book - decorative element"
    >
      <div className="relative w-20 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-sm shadow-xl border border-white/20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-6 bg-red-600 flex items-center justify-center">
          <span className="text-[8px] font-black text-white uppercase tracking-tighter">
            Radioactive Man
          </span>
        </div>
        <div className="absolute inset-4 bg-yellow-400 rounded-full opacity-80" />
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-black rotate-12">
          <span className="text-[10px] font-black">$100</span>
        </div>
      </div>
    </div>
  );
}

type ThemeConfig = {
  title: string;
  subtitle: string;
  bgClass: string;
  borderClass: string;
  textStrokeColor: string;
  icon: React.ReactNode;
};

export default function SimpsonsHeader() {
  const pathname = usePathname();

  // Hide on home page
  if (pathname === "/") return null;

  let theme: ThemeConfig = {
    title: "Springfield",
    subtitle: "The Official Companion",
    bgClass: "bg-sky-400 dark:bg-sky-900",
    borderClass: "border-yellow-400",
    textStrokeColor: "#0047AB",
    icon: <Donut />,
  };

  if (pathname.startsWith("/characters")) {
    theme = {
      title: "Citizens",
      subtitle: "Meet the Cast",
      bgClass: "bg-sky-400 dark:bg-sky-900",
      borderClass: "border-yellow-400",
      textStrokeColor: "#0047AB",
      icon: <Donut />,
    };
  } else if (pathname.startsWith("/episodes")) {
    theme = {
      title: "On The Air",
      subtitle: "Episode Guide",
      bgClass: "bg-[#F196A8] dark:bg-[#8B4352]", // Simpsons Living Room Pink
      borderClass: "border-orange-400",
      textStrokeColor: "#8B4513",
      icon: <TvSet />,
    };
  } else if (pathname.startsWith("/diary")) {
    theme = {
      title: "Dear Diary",
      subtitle: "Top Secret Notes",
      bgClass: "bg-purple-400 dark:bg-purple-900",
      borderClass: "border-pink-300",
      textStrokeColor: "#4B0082",
      icon: <DiaryBook />,
    };
  } else if (pathname.startsWith("/collections")) {
    theme = {
      title: "The Dungeon",
      subtitle: "Rare Collectibles",
      bgClass: "bg-emerald-600 dark:bg-emerald-900",
      borderClass: "border-green-400",
      textStrokeColor: "#006400",
      icon: <ComicBook />,
    };
  }

  return (
    <header
      className={`relative w-full h-32 sm:h-40 overflow-hidden ${theme.bgClass} border-b-4 ${theme.borderClass} transition-colors duration-500`}
      role="banner"
      aria-label={`${theme.title} - ${theme.subtitle}`}
    >
      {/* Background Pattern / Clouds */}
      <div className="absolute inset-0" aria-hidden="true">
        {[...Array(CLOUDS_COUNT)].map((_, i) => (
          <BackgroundCloud key={i} index={i} />
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center justify-between relative z-10">
        <div className="flex flex-col max-w-[60%] sm:max-w-none">
          <h1
            className="text-white font-black text-3xl sm:text-4xl md:text-5xl italic tracking-tighter uppercase transform -rotate-2 origin-left drop-shadow-lg"
            style={{
              WebkitTextStroke: `2px ${theme.textStrokeColor}`,
              textShadow: `4px 4px 0 ${theme.textStrokeColor}`,
            }}
          >
            {theme.title}
          </h1>
          <div className="inline-block bg-white/95 dark:bg-black/70 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full mt-2 transform rotate-1 origin-left shadow-sm border border-white/20">
            <p className="text-zinc-900 dark:text-zinc-100 font-bold text-[0.6rem] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              {theme.subtitle}
            </p>
          </div>
        </div>

        {/* User Navigation */}
        <div className="hidden md:block">
          <UserNav />
        </div>
      </div>

      {/* Characteristic Element */}
      {theme.icon}

      {/* Sun/Light Glow */}
      <div 
        className="absolute -top-10 -left-10 w-60 h-60 bg-white rounded-full blur-[80px] opacity-20 animate-pulse pointer-events-none" 
        aria-hidden="true"
      />
    </header>
  );
}
