"use server";

import { execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
import { getCurrentUser, getCurrentUserOptional } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import {
  isUserFollowingCharacter,
  findCommentsByCharacter,
} from "@/app/_lib/repositories";

export async function toggleFollow(characterId: number) {
  const user = await getCurrentUserOptional();
  if (!user) {
    return { success: false, error: "Please log in to follow characters" };
  }

  try {
    const isCurrentlyFollowing = await isUserFollowingCharacter(
      user.id,
      characterId
    );

    if (isCurrentlyFollowing) {
      await execute(
        `DELETE FROM ${TABLES.characterFollows} WHERE user_id = $1 AND character_id = $2`,
        [user.id, characterId]
      );
    } else {
      await execute(
        `INSERT INTO ${TABLES.characterFollows} (user_id, character_id) VALUES ($1, $2)`,
        [user.id, characterId]
      );
    }
    revalidatePath(`/characters/${characterId}`);
    return { success: true, isFollowing: !isCurrentlyFollowing };
  } catch (error) {
    console.error("[toggleFollow] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update follow status" 
    };
  }
}

export async function isFollowing(characterId: number) {
  const user = await getCurrentUserOptional();
  if (!user) return false;
  return isUserFollowingCharacter(user.id, characterId);
}

export async function postComment(characterId: number, content: string) {
  const user = await getCurrentUserOptional();
  if (!user) {
    return { success: false, error: "Please log in to post comments" };
  }

  try {
    await execute(
      `INSERT INTO ${TABLES.characterComments} (user_id, character_id, content) VALUES ($1, $2, $3)`,
      [user.id, characterId, content]
    );
    revalidatePath(`/characters/${characterId}`);
    return { success: true };
  } catch (error) {
    console.error("[postComment] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to post comment" 
    };
  }
}

export async function getComments(characterId: number) {
  return findCommentsByCharacter(characterId);
}
