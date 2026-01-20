/**
 * Episodes Server Actions - HYBRID PATTERN
 *
 * 🎓 EDUCATIONAL NOTE: Why Full DDD for Mutations?
 * ================================================
 * This file demonstrates the HYBRID approach:
 *
 * READ operations (Simple Pattern):
 * - Episode listing → Use app/_lib/repositories.ts directly
 * - No business rules, just data retrieval
 *
 * WRITE operations (Full DDD Pattern):
 * - trackEpisode → Uses TrackEpisodeUseCase
 * - Business rules: validate rating (1-5), check episode exists
 * - User state: manages watch history, timestamps
 * - RLS protection: ensures user owns their progress
 *
 * The UseCase layer is NOT overkill here because:
 * 1. Rating validation is a business rule (1-5 range)
 * 2. Episode existence check prevents orphan records
 * 3. Progress tracking involves state management
 * 4. Unit testing business logic in isolation is valuable
 *
 * Compare with app/_lib/repositories.ts for SIMPLE pattern examples.
 * See docs/ARCHITECTURE_DECISION_MATRIX.md for the decision guide.
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/app/_lib/prisma";
import { withAuthenticatedRLS, withOptionalRLS } from "@/app/_lib/prisma-rls";
import { UseCaseFactory } from "@/infrastructure/factories";
import {
  NotFoundException,
  ValidationException,
} from "@/core/domain/exceptions";

// Zod schemas for input validation at delivery layer
const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

/**
 * Server Action: Track Episode
 * Thin controller that delegates to use case with RLS
 */
export async function trackEpisode(
  episodeId: number,
  rating: number,
  notes: string = "",
) {
  // 1. Validate input
  const validated = TrackEpisodeSchema.parse({ episodeId, rating, notes });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    try {
      // 3. Create and execute use case
      const useCase = UseCaseFactory.createTrackEpisodeUseCase();
      await useCase.execute(
        {
          episodeId: validated.episodeId,
          rating: validated.rating,
          notes: validated.notes,
        },
        user.id,
      );

      // 4. Handle framework-specific concerns
      revalidatePath(`/episodes/${validated.episodeId}`);
      revalidatePath("/episodes");

      return { success: true };
    } catch (error) {
      console.error("[trackEpisode] Error:", error);

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (error instanceof NotFoundException) {
        throw new Error("Episode not found");
      }
      if (error instanceof ValidationException) {
        throw new Error(error.message);
      }

      throw new Error("Failed to track episode");
    }
  });
}

/**
 * Server Action: Get Episode Progress
 * Retrieves user's progress for an episode
 * Works with/without authentication using RLS
 */
export async function getEpisodeProgress(episodeId: number) {
  return withOptionalRLS(prisma, async (tx, user) => {
    if (!user) return null;

    const useCase = UseCaseFactory.createGetEpisodeDetailsUseCase();
    const result = await useCase.execute(episodeId, user.id);

    return result.userProgress;
  });
}
