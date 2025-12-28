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

  const { execute, isPending } = useFormAction(async () => {
    await toggleFollow(characterId);
    setIsFollowing((prev) => !prev);
  });

  return (
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
  );
}
