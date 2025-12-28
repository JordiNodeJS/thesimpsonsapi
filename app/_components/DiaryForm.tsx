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
import { Character, Location } from "@/app/_lib/types";
import { useLocalStorage } from "@/app/_lib/hooks";

export default function DiaryForm({
  characters,
  locations,
}: {
  characters: Character[];
  locations: Location[];
}) {
  const [draft, setDraft] = useLocalStorage("diary-draft", {
    charId: "",
    locId: "",
    desc: "",
  });

  const [charId, setCharId] = useState(draft.charId);
  const [locId, setLocId] = useState(draft.locId);
  const [desc, setDesc] = useState(draft.desc);
  const [loading, setLoading] = useState(false);

  // Update draft in localStorage when fields change
  useEffect(() => {
    setDraft({ charId, locId, desc });
  }, [charId, locId, desc, setDraft]);

  const handleSubmit = async () => {
    if (!charId || !locId || !desc) return;
    setLoading(true);
    await createDiaryEntry(parseInt(charId), parseInt(locId), desc);
    setDesc("");
    setCharId("");
    setLocId("");
    setDraft({ charId: "", locId: "", desc: "" });
    setLoading(false);
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      <h2 className="text-xl font-semibold">Log a New Memory</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Who were you with?</Label>
          <Select value={charId} onValueChange={setCharId}>
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
          <Select value={locId} onValueChange={setLocId}>
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
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g., Had a Duff beer and watched the game..."
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Writing in Diary..." : "Save Entry"}
      </Button>
    </div>
  );
}
