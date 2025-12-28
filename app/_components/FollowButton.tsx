"use client";

import { useState } from "react";
import { toggleFollow } from "@/app/_actions/social";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function FollowButton({
  characterId,
  initialIsFollowing,
}: {
  characterId: number;
  initialIsFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleFollow(characterId);
    setIsFollowing(!isFollowing);
    setLoading(false);
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      onClick={handleToggle}
      disabled={loading}
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
