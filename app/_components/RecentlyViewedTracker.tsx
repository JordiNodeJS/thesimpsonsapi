"use client";

import { useEffect, useState } from "react";

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
  // Estado que marca si el componente ya se hidrataron en el cliente
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Solo ejecutar después de que el componente esté montado en el cliente
    if (!mounted) {
      setMounted(true);
      return;
    }

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
  }, [character, mounted]);

  // No renderiza nada - solo efecto secundario
  return null;
}
