"use client";

import { useState } from "react";
import { toggleFollow } from "@/app/_actions/social";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface FollowButtonProps {
  characterId: number;
  initialIsFollowing: boolean;
}

export default function FollowButton({
  characterId,
  initialIsFollowing,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [error, setError] = useState<string | null>(null);

  const { execute, isPending } = useFormAction(async () => {
    try {
      const result = await toggleFollow(characterId);
      if (result?.success) {
        setIsFollowing((prev) => !prev);
        setError(null);
      } else if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update follow status");
    }
  });

  return (
    <div className="space-y-2">
      <Button
        variant={isFollowing ? "secondary" : "default"}
        onClick={() => execute()}
        disabled={isPending}
        className="gap-2"
      >
        <Heart
          className={isFollowing ? "fill-red-500 text-red-500" : ""}
          size={18}
        />
        {isFollowing ? "Following" : "Follow"}
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
