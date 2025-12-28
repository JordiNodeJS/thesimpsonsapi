"use client";

import { useState } from "react";
import { createCollection } from "@/app/_actions/collections";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CreateCollectionForm() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { execute, isPending } = useFormAction(
    async () => {
      if (!name) return;
      await createCollection(name, desc);
      setName("");
      setDesc("");
    },
    { onError: (err) => console.error("Failed to create collection:", err) }
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
