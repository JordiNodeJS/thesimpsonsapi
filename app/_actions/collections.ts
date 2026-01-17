"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import {
  findCollectionsByUser,
  findQuotesByCollection,
} from "@/app/_lib/repositories";

export async function createCollection(name: string, description: string) {
  const user = await getCurrentUser();
  await prisma.quoteCollection.create({
    data: {
      userId: user.id,
      name,
      description,
    },
  });
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
  await prisma.collectionQuote.create({
    data: {
      collectionId,
      quoteText: text,
      characterName: character,
      sourceEpisode: episode,
    },
  });
  revalidatePath("/collections");
}

export async function getCollectionQuotes(collectionId: number) {
  return findQuotesByCollection(collectionId);
}
