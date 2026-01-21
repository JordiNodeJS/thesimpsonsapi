/**
 * Episodes Server Actions - Frame-centric Pattern
 *
 * Simplified Server Actions following Next.js 16 best practices.
 * Business logic is embedded directly, no UseCase abstraction needed.
 *
 * READ operations: Use lib/db/repositories.ts directly
 * WRITE operations: Inline validation + Prisma mutations here
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma, withAuthenticatedRLS, withOptionalRLS } from "@/lib/db";
import { TrackEpisodeSchema } from "@/lib/validators";

/**
 * Track an episode with rating
 *
 * Business rules embedded:
 * - Rating must be 1-5 (validated by Zod)
 * - Episode must exist (checked before upsert)
 * - User progress is upserted (create or update)
 */
export async function trackEpisode(
  episodeId: number,
  rating: number,
  notes: string = "",
) {
  // 1. Validate input with Zod
  const validated = TrackEpisodeSchema.parse({ episodeId, rating, notes });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    // 2. Verify episode exists
    const episode = await tx.episode.findUnique({
      where: { id: validated.episodeId },
    });

    if (!episode) {
      throw new Error(`Episode with ID ${validated.episodeId} not found`);
    }

    // 3. Upsert user progress
    await tx.userEpisodeProgress.upsert({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId: validated.episodeId,
        },
      },
      update: {
        rating: validated.rating,
        notes: validated.notes ?? null,
        watchedAt: new Date(),
      },
      create: {
        userId: user.id,
        episodeId: validated.episodeId,
        rating: validated.rating,
        notes: validated.notes ?? null,
        watchedAt: new Date(),
      },
    });

    // 4. Revalidate cache
    revalidatePath(`/episodes/${validated.episodeId}`);
    revalidatePath("/episodes");

    return { success: true };
  });
}

/**
 * Get user's progress for an episode
 *
 * Works with/without authentication using RLS
 */
export async function getEpisodeProgress(episodeId: number) {
  return withOptionalRLS(prisma, async (tx, user) => {
    if (!user) return null;

    const progress = await tx.userEpisodeProgress.findUnique({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId,
        },
      },
    });

    return progress;
  });
}

/**
 * Get all user's watched episodes
 */
export async function getUserWatchedEpisodes() {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const progress = await tx.userEpisodeProgress.findMany({
      where: { userId: user.id },
      include: {
        episode: true,
      },
      orderBy: { watchedAt: "desc" },
    });

    return progress;
  });
}
