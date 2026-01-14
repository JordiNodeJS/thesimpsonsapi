"use client";

import { useState, useEffect } from "react";
import { createDiaryEntry } from "@/app/_actions/diary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocalStorage, useFormAction } from "@/app/_lib/hooks";

interface DiaryFormProps {
  characters: Array<{ id: number; name: string }>;
  locations: Array<{ id: number; name: string }>;
}

interface Draft {
  charId: string;
  locId: string;
  desc: string;
}

const EMPTY_DRAFT: Draft = { charId: "", locId: "", desc: "" };

export default function DiaryForm({ characters, locations }: DiaryFormProps) {
  const [draft, setDraft] = useLocalStorage<Draft>("diary-draft", EMPTY_DRAFT);
  const [formState, setFormState] = useState<Draft>(() => draft);

  // Sync draft to localStorage when form state changes
  useEffect(() => {
    setDraft(formState);
  }, [formState, setDraft]);

  const { execute, isPending } = useFormAction(async () => {
    if (!formState.charId || !formState.locId || !formState.desc) return;
    await createDiaryEntry(
      parseInt(formState.charId),
      parseInt(formState.locId),
      formState.desc
    );
    setFormState(EMPTY_DRAFT);
  });

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-xl font-semibold">Log a New Memory</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Who were you with?</Label>
          <Select
            value={formState.charId}
            onValueChange={(charId) =>
              setFormState((prev) => ({ ...prev, charId }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Character" />
            </SelectTrigger>
            <SelectContent>
              {characters.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Where were you?</Label>
          <Select
            value={formState.locId}
            onValueChange={(locId) =>
              setFormState((prev) => ({ ...prev, locId }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.id.toString()}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>What happened?</Label>
        <Textarea
          value={formState.desc}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, desc: e.target.value }))
          }
          placeholder="e.g., Had a Duff beer and watched the game..."
        />
      </div>

      <Button onClick={() => execute()} disabled={isPending} className="w-full">
        {isPending ? "Writing in Diary..." : "Save Entry"}
      </Button>
    </div>
  );
}
