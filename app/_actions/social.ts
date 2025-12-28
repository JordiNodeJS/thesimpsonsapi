"use server";

import { pool } from "@/app/_lib/db";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleFollow(characterId: number) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    // Check if following
    const check = await client.query(
      `SELECT * FROM character_follows WHERE user_id = $1 AND character_id = $2`,
      [user.id, characterId]
    );

    if (check.rows.length > 0) {
      await client.query(
        `DELETE FROM character_follows WHERE user_id = $1 AND character_id = $2`,
        [user.id, characterId]
      );
    } else {
      await client.query(
        `INSERT INTO character_follows (user_id, character_id) VALUES ($1, $2)`,
        [user.id, characterId]
      );
    }
    revalidatePath(`/characters/${characterId}`);
  } finally {
    client.release();
  }
}

export async function isFollowing(characterId: number) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT 1 FROM character_follows WHERE user_id = $1 AND character_id = $2`,
      [user.id, characterId]
    );
    return res.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function postComment(characterId: number, content: string) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO character_comments (user_id, character_id, content) VALUES ($1, $2, $3)`,
      [user.id, characterId, content]
    );
    revalidatePath(`/characters/${characterId}`);
  } finally {
    client.release();
  }
}

export async function getComments(characterId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT c.*, u.username 
       FROM character_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.character_id = $1 
       ORDER BY c.created_at DESC`,
      [characterId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}
