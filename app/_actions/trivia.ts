"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/app/_lib/auth";
import { UseCaseFactory } from "@/infrastructure/factories";
import { ValidationException } from "@/core/domain/exceptions";

// Zod schemas for input validation
const SubmitTriviaSchema = z.object({
  entityType: z.enum(["CHARACTER", "EPISODE"]),
  entityId: z.number().int().positive(),
  content: z
    .string()
    .min(10, "Trivia must be at least 10 characters")
    .max(1000),
});

/**
 * Server Action: Submit Trivia
 * Thin controller that delegates to use case
 */
export async function submitTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number,
  content: string,
) {
  const validated = SubmitTriviaSchema.parse({ entityType, entityId, content });
  const user = await getCurrentUser();

  try {
    const useCase = UseCaseFactory.createSubmitTriviaUseCase();
    await useCase.execute(
      {
        entityType: validated.entityType,
        entityId: validated.entityId,
        content: validated.content,
      },
      user.id,
      user.name || user.email || "Anonymous",
    );

    // Revalidate paths based on entity type
    if (validated.entityType === "CHARACTER") {
      revalidatePath(`/characters/${validated.entityId}`);
    }
    if (validated.entityType === "EPISODE") {
      revalidatePath(`/episodes/${validated.entityId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[submitTrivia] Error:", error);

    if (error instanceof ValidationException) {
      throw new Error(error.message);
    }

    throw new Error("Failed to submit trivia");
  }
}

/**
 * Server Action: Get Trivia
 */
export async function getTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number,
) {
  const useCase = UseCaseFactory.createListTriviaUseCase();
  const result = await useCase.execute(entityType, entityId);
  return result.trivia;
}
