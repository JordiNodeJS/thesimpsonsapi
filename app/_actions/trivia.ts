"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { findTriviaByEntity } from "@/app/_lib/repositories";

export async function submitTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number,
  content: string
) {
  const user = await getCurrentUser();
  await prisma.triviaFact.create({
    data: {
      relatedEntityType: entityType,
      relatedEntityId: entityId,
      content,
      submittedByUserId: user.id,
    },
  });
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
