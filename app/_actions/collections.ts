"use server";

import { execute } from "@/app/_lib/db-utils";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import {
  findCollectionsByUser,
  findQuotesByCollection,
} from "@/app/_lib/repositories";

export async function createCollection(name: string, description: string) {
  const user = await getCurrentUser();
  await execute(
    `INSERT INTO quote_collections (user_id, name, description) VALUES ($1, $2, $3)`,
    [user.id, name, description]
  );
  revalidatePath("/collections");
}

export async function getCollections() {
  const user = await getCurrentUser();
  return findCollectionsByUser(user.id);
}

export async function addQuote(
  collectionId: number,
  text: string,
  character: string,
  episode: string
) {
  await execute(
    `INSERT INTO collection_quotes (collection_id, quote_text, character_name, source_episode) 
     VALUES ($1, $2, $3, $4)`,
    [collectionId, text, character, episode]
  );
  revalidatePath("/collections");
}

export async function getCollectionQuotes(collectionId: number) {
  return findQuotesByCollection(collectionId);
}
