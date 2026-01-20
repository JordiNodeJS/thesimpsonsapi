"use client";

import { useState } from "react";
import { createCollection } from "@/actions/collections";
import { useFormAction } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CreateCollectionForm() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { execute, isPending } = useFormAction(
    async () => {
      if (!name.trim()) {
        setError("Name is required");
        return;
      }
      try {
        await createCollection(name, desc);
        setName("");
        setDesc("");
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create collection",
        );
      }
    },
    { onError: (err) => setError(err.message) },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Collection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Collection Name (e.g. Homer's Wisdom)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          onClick={() => execute()}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Creating..." : "Create Collection"}
        </Button>
      </CardContent>
    </Card>
  );
}
