"use client";

import { useState } from "react";
import { postComment } from "@/app/_actions/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CommentSection({
  characterId,
  comments,
}: {
  characterId: number;
  comments: any[];
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await postComment(characterId, content);
    setContent("");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Community Wall</h3>

      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a message for this character..."
        />
        <Button onClick={handleSubmit} disabled={loading}>
          Post Comment
        </Button>
      </div>

      <div className="space-y-4 mt-8">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-900"
          >
            <Avatar>
              <AvatarFallback>
                {comment.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.username}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
