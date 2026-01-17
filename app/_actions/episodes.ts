"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUserOptional } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { findEpisodeProgressByUser } from "@/app/_lib/repositories";

export async function trackEpisode(
  episodeId: number,
  rating: number,
  notes: string
) {
  const user = await getCurrentUserOptional();
  if (!user) {
    throw new Error("Please log in to track episodes");
  }

  await prisma.userEpisodeProgress.upsert({
    where: {
      userId_episodeId: {
        userId: user.id,
        episodeId,
      },
    },
    update: {
      rating,
      notes,
      watchedAt: new Date(),
    },
    create: {
      userId: user.id,
      episodeId,
      rating,
      notes,
      watchedAt: new Date(),
    },
  });
  revalidatePath(`/episodes/${episodeId}`);
  revalidatePath("/episodes");
}

export async function getEpisodeProgress(episodeId: number) {
  const user = await getCurrentUserOptional();
  if (!user) return null;
  return findEpisodeProgressByUser(user.id, episodeId);
}
