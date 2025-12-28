"use server";

import { pool } from "@/app/_lib/db";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function trackEpisode(
  episodeId: number,
  rating: number,
  notes: string
) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO user_episode_progress (user_id, episode_id, rating, notes, watched_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, episode_id) 
       DO UPDATE SET rating = $3, notes = $4, watched_at = NOW()`,
      [user.id, episodeId, rating, notes]
    );
    revalidatePath(`/episodes/${episodeId}`);
    revalidatePath("/episodes");
  } finally {
    client.release();
  }
}

export async function getEpisodeProgress(episodeId: number) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM user_episode_progress WHERE user_id = $1 AND episode_id = $2`,
      [user.id, episodeId]
    );
    return res.rows[0] || null;
  } finally {
    client.release();
  }
}
