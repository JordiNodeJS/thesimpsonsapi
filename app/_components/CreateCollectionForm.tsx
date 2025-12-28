"use client";

import { useState } from "react";
import { createCollection } from "@/app/_actions/collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CreateCollectionForm() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);
    await createCollection(name, desc);
    setName("");
    setDesc("");
    setLoading(false);
  };

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
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          Create Collection
        </Button>
      </CardContent>
    </Card>
  );
}
