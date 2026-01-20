/**
 * Collections Server Actions - Frame-centric Pattern
 *
 * Simplified Server Actions following Next.js 16 best practices.
 * Manages quote collections for authenticated users.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma, withAuthenticatedRLS } from "@/lib/db";
import {
  CreateCollectionSchema,
  DeleteCollectionSchema,
} from "@/lib/validators";
import { z } from "zod";

// Local schema for adding quotes (more specific than the generic one)
const AddQuoteSchema = z.object({
  collectionId: z.number().int().positive(),
  text: z.string().min(1, "Quote text is required").max(1000),
  character: z.string().min(1).max(100),
  episode: z.string().max(200).optional(),
});

/**
 * Create a new quote collection
 */
export async function createCollection(name: string, description: string = "") {
  const validated = CreateCollectionSchema.parse({ name, description });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const collection = await tx.quoteCollection.create({
      data: {
        userId: user.id,
        name: validated.name,
        description: validated.description ?? null,
      },
    });

    revalidatePath("/collections");
    return { success: true, id: collection.id };
  });
}

/**
 * Get user's collections with quote counts
 */
export async function getCollections() {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const collections = await tx.quoteCollection.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { quotes: true },
        },
      },
    });

    return collections.map((col) => ({
      id: col.id,
      name: col.name,
      description: col.description,
      quoteCount: col._count.quotes,
    }));
  });
}

/**
 * Add a quote to a collection
 */
export async function addQuote(
  collectionId: number,
  text: string,
  character: string,
  episode: string = "",
) {
  const validated = AddQuoteSchema.parse({
    collectionId,
    text,
    character,
    episode,
  });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    // Verify collection belongs to user
    const collection = await tx.quoteCollection.findUnique({
      where: { id: validated.collectionId },
    });

    if (!collection) {
      throw new Error(`Collection with ID ${validated.collectionId} not found`);
    }

    if (collection.userId !== user.id) {
      throw new Error("Not authorized to add quotes to this collection");
    }

    const quote = await tx.collectionQuote.create({
      data: {
        collectionId: validated.collectionId,
        quoteText: validated.text,
        characterName: validated.character,
        sourceEpisode: validated.episode || null,
      },
    });

    revalidatePath("/collections");
    return { success: true, id: quote.id };
  });
}

/**
 * Get quotes from a specific collection
 */
export async function getCollectionQuotes(collectionId: number) {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    // Verify collection belongs to user
    const collection = await tx.quoteCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.userId !== user.id) {
      throw new Error("Collection not found or not authorized");
    }

    const quotes = await tx.collectionQuote.findMany({
      where: { collectionId },
    });

    return quotes.map((q) => ({
      id: q.id,
      text: q.quoteText,
      character: q.characterName,
      episode: q.sourceEpisode,
    }));
  });
}

/**
 * Delete a collection and all its quotes
 */
export async function deleteCollection(id: number) {
  const validated = DeleteCollectionSchema.parse({ id });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const collection = await tx.quoteCollection.findUnique({
      where: { id: validated.id },
    });

    if (!collection) {
      throw new Error(`Collection with ID ${validated.id} not found`);
    }

    if (collection.userId !== user.id) {
      throw new Error("Not authorized to delete this collection");
    }

    // Delete quotes first (cascade), then collection
    await tx.collectionQuote.deleteMany({
      where: { collectionId: validated.id },
    });

    await tx.quoteCollection.delete({
      where: { id: validated.id },
    });

    revalidatePath("/collections");
    return { success: true };
  });
}

/**
 * Delete a single quote
 */
export async function deleteQuote(quoteId: number) {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const quote = await tx.collectionQuote.findUnique({
      where: { id: quoteId },
      include: { collection: true },
    });

    if (!quote) {
      throw new Error("Quote not found");
    }

    if (quote.collection?.userId !== user.id) {
      throw new Error("Not authorized to delete this quote");
    }

    await tx.collectionQuote.delete({
      where: { id: quoteId },
    });

    revalidatePath("/collections");
    return { success: true };
  });
}
