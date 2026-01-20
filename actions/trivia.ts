/**
 * Trivia Server Actions - Frame-centric Pattern
 *
 * Handles trivia submissions for characters and episodes.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma, withAuthenticatedRLS } from "@/lib/db";
import { SubmitTriviaSchema } from "@/lib/validators";

/**
 * Submit a trivia fact
 */
export async function submitTrivia(
  entityType: "character" | "episode" | "location",
  entityId: number,
  content: string,
) {
  const validated = SubmitTriviaSchema.parse({ entityType, entityId, content });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    // Verify entity exists
    if (validated.entityType === "character") {
      const character = await tx.character.findUnique({
        where: { id: validated.entityId },
      });
      if (!character) {
        throw new Error(`Character with ID ${validated.entityId} not found`);
      }
    } else if (validated.entityType === "episode") {
      const episode = await tx.episode.findUnique({
        where: { id: validated.entityId },
      });
      if (!episode) {
        throw new Error(`Episode with ID ${validated.entityId} not found`);
      }
    } else if (validated.entityType === "location") {
      const location = await tx.location.findUnique({
        where: { id: validated.entityId },
      });
      if (!location) {
        throw new Error(`Location with ID ${validated.entityId} not found`);
      }
    }

    const trivia = await tx.triviaFact.create({
      data: {
        relatedEntityType: validated.entityType.toUpperCase(),
        relatedEntityId: validated.entityId,
        content: validated.content,
        submittedByUserId: user.id,
      },
    });

    // Revalidate paths based on entity type
    if (validated.entityType === "character") {
      revalidatePath(`/characters/${validated.entityId}`);
    } else if (validated.entityType === "episode") {
      revalidatePath(`/episodes/${validated.entityId}`);
    }

    return { success: true, id: trivia.id };
  }).catch((error: Error) => {
    if (error.message === "Unauthorized: No active session") {
      return { success: false, error: "Please log in to submit trivia" };
    }
    return { success: false, error: error.message };
  });
}

/**
 * Get trivia for an entity (public)
 */
export async function getTrivia(
  entityType: "character" | "episode" | "location",
  entityId: number,
) {
  const trivia = await prisma.triviaFact.findMany({
    where: {
      relatedEntityType: entityType.toUpperCase(),
      relatedEntityId: entityId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { username: true, name: true, email: true },
      },
    },
  });

  return trivia.map((t) => ({
    id: t.id,
    content: t.content,
    username:
      t.user?.username ||
      t.user?.name ||
      t.user?.email?.split("@")[0] ||
      "Anonymous",
    createdAt: t.createdAt,
  }));
}

/**
 * Get all trivia submitted by current user
 */
export async function getUserTrivia() {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const trivia = await tx.triviaFact.findMany({
      where: { submittedByUserId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return trivia.map((t) => ({
      id: t.id,
      content: t.content,
      entityType: t.relatedEntityType,
      entityId: t.relatedEntityId,
      createdAt: t.createdAt,
    }));
  });
}
