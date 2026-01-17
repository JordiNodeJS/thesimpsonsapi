"use client";

import { useState } from "react";
import { deleteDiaryEntry } from "@/app/_actions/diary";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteDiaryEntryButton({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);
  
  const { execute, isPending } = useFormAction(
    async () => {
      if (!confirm("Are you sure you want to delete this memory?")) return;
      try {
        await deleteDiaryEntry(id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete entry");
      }
    },
    { onError: (err) => setError(err.message) }
  );

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => execute()}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Delete entry"
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
