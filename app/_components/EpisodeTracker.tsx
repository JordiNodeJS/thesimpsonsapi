"use client";

import { useState } from "react";
import { trackEpisode } from "@/app/_actions/episodes";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { EpisodeProgress } from "@/app/_lib/types";

interface EpisodeTrackerProps {
  episodeId: number;
  initialProgress: EpisodeProgress | null;
}

export default function EpisodeTracker({
  episodeId,
  initialProgress,
}: EpisodeTrackerProps) {
  const [rating, setRating] = useState(initialProgress?.rating || 0);
  const [notes, setNotes] = useState(initialProgress?.notes || "");

  const { execute, isPending } = useFormAction(async () => {
    await trackEpisode(episodeId, rating, notes);
  });

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
      <h3 className="font-semibold text-lg">Track Episode</h3>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} of 5 stars`}
              className={`p-3 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 rounded ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <Star fill={rating >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you think?"
        />
      </div>

      <Button onClick={() => execute()} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Progress"
        )}
      </Button>
    </div>
  );
}
