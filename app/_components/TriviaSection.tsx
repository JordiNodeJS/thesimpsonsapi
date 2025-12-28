"use client";

import { useState } from "react";
import { submitTrivia } from "@/app/_actions/trivia";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface TriviaFact {
  id: number;
  content: string;
  username: string;
}

interface TriviaSectionProps {
  entityType: "CHARACTER" | "EPISODE";
  entityId: number;
  facts: TriviaFact[];
}

export default function TriviaSection({
  entityType,
  entityId,
  facts,
}: TriviaSectionProps) {
  const [content, setContent] = useState("");

  const { execute, isPending } = useFormAction(async () => {
    if (!content.trim()) return;
    await submitTrivia(entityType, entityId, content);
    setContent("");
  });

  return (
    <div className="space-y-6 mt-8 pt-8 border-t">
      <h3 className="text-xl font-semibold">Did You Know?</h3>

      <div className="grid gap-4">
        {facts.map((fact) => (
          <div
            key={fact.id}
            className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg"
          >
            <p className="italic text-lg">&quot;{fact.content}&quot;</p>
            <div className="mt-2 flex justify-end">
              <Badge variant="outline" className="text-xs">
                Submitted by {fact.username}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Add a fun fact:</p>
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a trivia fact..."
            className="min-h-[80px]"
          />
        </div>
        <Button onClick={() => execute()} disabled={isPending} size="sm">
          {isPending ? "Submitting..." : "Submit Fact"}
        </Button>
      </div>
    </div>
  );
}
