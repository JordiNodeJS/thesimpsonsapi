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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, User, Loader2 } from "lucide-react";

interface DiaryFormProps {
  characters: Array<{ id: number; name: string; image_url: string | null }>;
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
    <div className="space-y-6 p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Log a New Memory</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Record your adventures in Springfield.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Who were you with?
          </Label>
          <Select
            value={formState.charId}
            onValueChange={(charId) =>
              setFormState((prev) => ({ ...prev, charId }))
            }
          >
            <SelectTrigger className="h-12 bg-muted/20 border-muted hover:border-primary/50 transition-all duration-200">
              <SelectValue placeholder="Select a friend..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {characters.map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id.toString()}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6 border border-border/50">
                      <AvatarImage
                        src={c.image_url || undefined}
                        alt={c.name}
                        className="object-contain bg-white"
                      />
                      <AvatarFallback className="text-[10px] bg-sky-100 text-sky-700">
                        {c.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Where were you?
          </Label>
          <Select
            value={formState.locId}
            onValueChange={(locId) =>
              setFormState((prev) => ({ ...prev, locId }))
            }
          >
            <SelectTrigger className="h-12 bg-muted/20 border-muted hover:border-primary/50 transition-all duration-200">
              <SelectValue placeholder="Pick a location..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {locations.map((l) => (
                <SelectItem
                  key={l.id}
                  value={l.id.toString()}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{l.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What happened?
        </Label>
        <Textarea
          value={formState.desc}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, desc: e.target.value }))
          }
          placeholder="Describe your adventure in Springfield... e.g., 'Had a Duff beer at Moe's and discussed the Springfield Isotopes game with the gang.'"
          className="min-h-[120px]"
        />
      </div>

      <Button
        onClick={() => execute()}
        disabled={isPending}
        className="w-full h-10 font-medium"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Writing...
          </>
        ) : (
          "Save Entry"
        )}
      </Button>
    </div>
  );
}
