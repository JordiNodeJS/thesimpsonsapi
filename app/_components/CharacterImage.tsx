"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";

interface CharacterImageProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function CharacterImage({
  src,
  alt,
  fill,
  className,
  priority,
  sizes,
}: CharacterImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 ${className} ${
          fill ? "absolute inset-0 h-full w-full" : "h-full w-full"
        }`}
      >
        <User size={fill ? 64 : 32} strokeWidth={1} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={
        sizes ||
        (fill
          ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          : undefined)
      }
      onError={() => setError(true)}
    />
  );
}
