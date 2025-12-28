"use server";

import { execute } from "@/app/_lib/db-utils";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { findTriviaByEntity } from "@/app/_lib/repositories";

export async function submitTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number,
  content: string
) {
  const user = await getCurrentUser();
  await execute(
    `INSERT INTO trivia_facts (related_entity_type, related_entity_id, content, submitted_by_user_id)
     VALUES ($1, $2, $3, $4)`,
    [entityType, entityId, content, user.id]
  );
  // Revalidate paths based on entity type
  if (entityType === "CHARACTER") revalidatePath(`/characters/${entityId}`);
  if (entityType === "EPISODE") revalidatePath(`/episodes/${entityId}`);
}

export async function getTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number
) {
  return findTriviaByEntity(entityType, entityId);
}
