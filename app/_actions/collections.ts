"use server";

import { pool } from "@/app/_lib/db";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function createCollection(name: string, description: string) {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO quote_collections (user_id, name, description) VALUES ($1, $2, $3)`,
      [user.id, name, description]
    );
    revalidatePath("/collections");
  } finally {
    client.release();
  }
}

export async function getCollections() {
  const user = await getCurrentUser();
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM quote_collections WHERE user_id = $1 ORDER BY id DESC`,
      [user.id]
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function addQuote(
  collectionId: number,
  text: string,
  character: string,
  episode: string
) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO collection_quotes (collection_id, quote_text, character_name, source_episode) 
       VALUES ($1, $2, $3, $4)`,
      [collectionId, text, character, episode]
    );
    revalidatePath("/collections");
  } finally {
    client.release();
  }
}

export async function getCollectionQuotes(collectionId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT * FROM collection_quotes WHERE collection_id = $1 ORDER BY id DESC`,
      [collectionId]
    );
    return res.rows;
  } finally {
    client.release();
  }
}
