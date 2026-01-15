"use server";

import { execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
import { getCurrentUser, getCurrentUserOptional } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { findEpisodeProgressByUser } from "@/app/_lib/repositories";

export async function trackEpisode(
  episodeId: number,
  rating: number,
  notes: string
) {
  const user = await getCurrentUser();
  await execute(
    `INSERT INTO ${TABLES.userEpisodeProgress} (user_id, episode_id, rating, notes, watched_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, episode_id) 
     DO UPDATE SET rating = $3, notes = $4, watched_at = NOW()`,
    [user.id, episodeId, rating, notes]
  );
  revalidatePath(`/episodes/${episodeId}`);
  revalidatePath("/episodes");
}

export async function getEpisodeProgress(episodeId: number) {
  const user = await getCurrentUser();
  if (!user) return null;
  return findEpisodeProgressByUser(user.id, episodeId);
}
