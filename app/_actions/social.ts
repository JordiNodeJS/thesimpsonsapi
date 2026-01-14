"use server";

import { execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import {
  isUserFollowingCharacter,
  findCommentsByCharacter,
} from "@/app/_lib/repositories";

export async function toggleFollow(characterId: number) {
  const user = await getCurrentUser();
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
}

export async function isFollowing(characterId: number) {
  const user = await getCurrentUser();
  return isUserFollowingCharacter(user.id, characterId);
}

export async function postComment(characterId: number, content: string) {
  const user = await getCurrentUser();
  await execute(
    `INSERT INTO ${TABLES.characterComments} (user_id, character_id, content) VALUES ($1, $2, $3)`,
    [user.id, characterId, content]
  );
  revalidatePath(`/characters/${characterId}`);
}

export async function getComments(characterId: number) {
  return findCommentsByCharacter(characterId);
}
