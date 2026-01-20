"use client";

import { useEffect } from "react";

interface ViewedCharacter {
  id: number;
  name: string;
  image: string;
}

/**
 * Componente que tracka personajes recientemente vistos en localStorage.
 * Usa un state hydration-safe que no causa mismatches en SSR.
 */
export default function RecentlyViewedTracker({
  character,
}: {
  character: ViewedCharacter;
}) {
  useEffect(() => {
    // Solo ejecutar en el cliente (useEffect no corre en el servidor)
    try {
      const stored = localStorage.getItem("recently-viewed-characters");
      const viewed = stored ? JSON.parse(stored) : [];
      const filtered = viewed.filter(
        (c: ViewedCharacter) => c.id !== character.id,
      );
      const updated = [character, ...filtered].slice(0, 5);
      localStorage.setItem(
        "recently-viewed-characters",
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("Failed to update recently viewed:", error);
    }
  }, [character]);

  // No renderiza nada - solo efecto secundario
  return null;
}
