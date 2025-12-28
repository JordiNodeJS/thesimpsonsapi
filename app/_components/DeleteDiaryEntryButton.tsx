"use client";

import { useState } from "react";
import { deleteDiaryEntry } from "@/app/_actions/diary";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteDiaryEntryButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this memory?")) return;
    setLoading(true);
    try {
      await deleteDiaryEntry(id);
    } catch (error) {
      console.error("Failed to delete entry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 size={16} />
    </Button>
  );
}
