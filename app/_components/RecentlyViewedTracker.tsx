"use client";

import { useEffect } from "react";
import { useLocalStorage } from "@/app/_lib/hooks";

interface ViewedCharacter {
  id: number;
  name: string;
  image: string;
}

export default function RecentlyViewedTracker({
  character,
}: {
  character: ViewedCharacter;
}) {
  const [, setRecentlyViewed] = useLocalStorage<ViewedCharacter[]>(
    "recently-viewed-characters",
    []
  );

  useEffect(() => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((c) => c.id !== character.id);
      return [character, ...filtered].slice(0, 5);
    });
  }, [character, setRecentlyViewed]);

  return null;
}
