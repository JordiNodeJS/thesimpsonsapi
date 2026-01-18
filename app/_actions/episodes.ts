"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUserOptional } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { findEpisodeProgressByUser } from "@/app/_lib/repositories";

const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

export async function trackEpisode(
  episodeId: number,
  rating: number,
  notes: string,
) {
  const validated = TrackEpisodeSchema.parse({ episodeId, rating, notes });
  const user = await getCurrentUserOptional();
  if (!user) {
    throw new Error("Please log in to track episodes");
  }

  try {
    await prisma.userEpisodeProgress.upsert({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId: validated.episodeId,
        },
      },
      update: {
        rating: validated.rating,
        notes: validated.notes || "",
        watchedAt: new Date(),
      },
      create: {
        userId: user.id,
        episodeId: validated.episodeId,
        rating: validated.rating,
        notes: validated.notes || "",
        watchedAt: new Date(),
      },
    });
    revalidatePath(`/episodes/${validated.episodeId}`);
    revalidatePath("/episodes");
    return { success: true };
  } catch (error) {
    console.error("[trackEpisode] Error:", error);
    throw new Error("Failed to track episode");
  }
}

export async function getEpisodeProgress(episodeId: number) {
  const user = await getCurrentUserOptional();
  if (!user) return null;
  return findEpisodeProgressByUser(user.id, episodeId);
}
