"use client";

import { useState } from "react";
import { submitTrivia } from "@/app/_actions/trivia";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function TriviaSection({
  entityType,
  entityId,
  facts,
}: {
  entityType: "CHARACTER" | "EPISODE";
  entityId: number;
  facts: any[];
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await submitTrivia(entityType, entityId, content);
    setContent("");
    setLoading(false);
  };

  return (
    <div className="space-y-6 mt-8 pt-8 border-t">
      <h3 className="text-xl font-semibold">Did You Know?</h3>

      <div className="grid gap-4">
        {facts.map((fact) => (
          <div
            key={fact.id}
            className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg"
          >
            <p className="italic text-lg">"{fact.content}"</p>
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
        <Button onClick={handleSubmit} disabled={loading} size="sm">
          Submit Fact
        </Button>
      </div>
    </div>
  );
}
