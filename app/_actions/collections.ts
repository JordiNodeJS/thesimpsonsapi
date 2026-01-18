"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  findCollectionsByUser,
  findQuotesByCollection,
} from "@/app/_lib/repositories";

const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export async function createCollection(name: string, description: string) {
  const validated = CreateCollectionSchema.parse({ name, description });
  const user = await getCurrentUser();

  try {
    await prisma.quoteCollection.create({
      data: {
        userId: user.id,
        name: validated.name,
        description: validated.description || "",
      },
    });
    revalidatePath("/collections");
    return { success: true };
  } catch (error) {
    console.error("[createCollection] Error:", error);
    throw new Error("Failed to create collection");
  }
}

export async function getCollections() {
  const user = await getCurrentUser();
  return findCollectionsByUser(user.id);
}

const AddQuoteSchema = z.object({
  collectionId: z.number().int().positive(),
  text: z.string().min(1, "Quote text is required").max(1000),
  character: z.string().min(1).max(100),
  episode: z.string().max(200),
});

export async function addQuote(
  collectionId: number,
  text: string,
  character: string,
  episode: string,
) {
  const validated = AddQuoteSchema.parse({
    collectionId,
    text,
    character,
    episode,
  });

  try {
    await prisma.collectionQuote.create({
      data: {
        collectionId: validated.collectionId,
        quoteText: validated.text,
        characterName: validated.character,
        sourceEpisode: validated.episode || "",
      },
    });
    revalidatePath("/collections");
    return { success: true };
  } catch (error) {
    console.error("[addQuote] Error:", error);
    throw new Error("Failed to add quote to collection");
  }
}

export async function getCollectionQuotes(collectionId: number) {
  return findQuotesByCollection(collectionId);
}
