"use server";

import { pool } from "@/app/_lib/db";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function createDiaryEntry(
  characterId: number,
  locationId: number,
  description: string
) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO diary_entries (user_id, character_id, location_id, activity_description, entry_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [user.id, characterId, locationId, description]
    );
    revalidatePath("/diary");
  } finally {
    client.release();
  }
}

export async function getDiaryEntries() {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT d.*, c.name as character_name, l.name as location_name 
       FROM diary_entries d
       JOIN characters c ON d.character_id = c.id
       JOIN locations l ON d.location_id = l.id
       WHERE d.user_id = $1
       ORDER BY d.entry_date DESC, d.id DESC`,
      [user.id]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function getLocations() {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM locations ORDER BY name ASC`);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function deleteDiaryEntry(id: number) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM diary_entries WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );
    revalidatePath("/diary");
  } finally {
    client.release();
  }
}
