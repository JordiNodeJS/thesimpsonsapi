"use client";

import { deleteDiaryEntry } from "@/app/_actions/diary";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteDiaryEntryButton({ id }: { id: number }) {
  const { execute, isPending } = useFormAction(
    async () => {
      if (!confirm("Are you sure you want to delete this memory?")) return;
      await deleteDiaryEntry(id);
    },
    { onError: (err) => console.error("Failed to delete entry:", err) }
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => execute()}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 size={16} />
    </Button>
  );
}
