import { cn } from "@/lib/utils";

export function CharacterCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
    </div>
  );
}

export function EpisodeCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden space-y-4 animate-pulse",
        className
      )}
    >
      <div className="h-48 bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-6 space-y-3">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
      </div>
    </div>
  );
}
