"use client";

import { useLocalStorage } from "@/app/_lib/hooks";
import Link from "next/link";
import CharacterImage from "@/app/_components/CharacterImage";

interface ViewedCharacter {
  id: number;
  name: string;
  image: string;
}

export default function RecentlyViewedList() {
  const [recentlyViewed] = useLocalStorage<ViewedCharacter[]>(
    "recently-viewed-characters",
    []
  );

  // Only render on client after hydration
  if (typeof window === "undefined" || recentlyViewed.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recentlyViewed.map((char) => (
          <Link
            key={char.id}
            href={`/characters/${char.id}`}
            className="flex-shrink-0 w-32 group"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all group-hover:border-yellow-500">
              <CharacterImage
                src={char.image}
                alt={char.name}
                fill
                className="object-contain p-2 transition-transform group-hover:scale-110"
              />
            </div>
            <p className="mt-2 text-xs font-bold text-center truncate uppercase tracking-tighter">
              {char.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
