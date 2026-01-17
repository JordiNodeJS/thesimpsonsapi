"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { findTriviaByEntity } from "@/app/_lib/repositories";

const SubmitTriviaSchema = z.object({
  entityType: z.enum(["CHARACTER", "EPISODE"]),
  entityId: z.number().int().positive(),
  content: z
    .string()
    .min(10, "Trivia must be at least 10 characters")
    .max(1000),
});

export async function submitTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number,
  content: string
) {
  const validated = SubmitTriviaSchema.parse({ entityType, entityId, content });
  const user = await getCurrentUser();
  
  try {
    await prisma.triviaFact.create({
      data: {
        relatedEntityType: validated.entityType,
        relatedEntityId: validated.entityId,
        content: validated.content,
        submittedByUserId: user.id,
      },
    });
    
    // Revalidate paths based on entity type
    if (validated.entityType === "CHARACTER")
      revalidatePath(`/characters/${validated.entityId}`);
    if (validated.entityType === "EPISODE")
      revalidatePath(`/episodes/${validated.entityId}`);
    
    return { success: true };
  } catch (error) {
    console.error("[submitTrivia] Error:", error);
    throw new Error("Failed to submit trivia");
  }
}

export async function getTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number
) {
  return findTriviaByEntity(entityType, entityId);
}
