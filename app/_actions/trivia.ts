"use server";

import { pool } from "@/app/_lib/db";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function submitTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number,
  content: string
) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO trivia_facts (related_entity_type, related_entity_id, content, submitted_by_user_id)
       VALUES ($1, $2, $3, $4)`,
      [entityType, entityId, content, user.id]
    );
    // Revalidate paths based on entity type
    if (entityType === "CHARACTER") revalidatePath(`/characters/${entityId}`);
    if (entityType === "EPISODE") revalidatePath(`/episodes/${entityId}`);
  } finally {
    client.release();
  }
}

export async function getTrivia(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number
) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT t.*, u.username 
       FROM trivia_facts t
       JOIN users u ON t.submitted_by_user_id = u.id
       WHERE related_entity_type = $1 AND related_entity_id = $2
       ORDER BY created_at DESC`,
      [entityType, entityId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}
