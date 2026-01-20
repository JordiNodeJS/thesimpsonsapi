"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/app/_lib/prisma";
import { withAuthenticatedRLS } from "@/app/_lib/prisma-rls";
import { UseCaseFactory } from "@/infrastructure/factories";
import { DomainException, ValidationException } from "@/core/domain/exceptions";

// Zod schemas for input validation
const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

const AddQuoteSchema = z.object({
  collectionId: z.number().int().positive(),
  text: z.string().min(1, "Quote text is required").max(1000),
  character: z.string().min(1).max(100),
  episode: z.string().max(200),
});

/**
 * Server Action: Create Collection
 * Thin controller that delegates to use case with RLS
 */
export async function createCollection(name: string, description: string) {
  const validated = CreateCollectionSchema.parse({ name, description });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    try {
      const useCase = UseCaseFactory.createCreateCollectionUseCase();
      await useCase.execute(
        {
          name: validated.name,
          description: validated.description || "",
        },
        user.id,
      );

      revalidatePath("/collections");
      return { success: true };
    } catch (error) {
      console.error("[createCollection] Error:", error);

      if (
        error instanceof ValidationException ||
        error instanceof DomainException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to create collection");
    }
  });
}

/**
 * Server Action: Get Collections
 * RLS automatically filters collections by current user
 */
export async function getCollections() {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const useCase = UseCaseFactory.createListCollectionsUseCase();
    const result = await useCase.execute(user.id);
    return result.collections;
  });
}

/**
 * Server Action: Add Quote to Collection
 * Thin controller that delegates to use case with RLS
 * RLS ensures users can only add quotes to their own collections
 */
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

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    try {
      const useCase = UseCaseFactory.createAddQuoteUseCase();
      await useCase.execute(
        {
          collectionId: validated.collectionId,
          text: validated.text,
          character: validated.character,
          episode: validated.episode || "",
        },
        user.id,
      );

      revalidatePath("/collections");
      return { success: true };
    } catch (error) {
      console.error("[addQuote] Error:", error);

      if (
        error instanceof ValidationException ||
        error instanceof DomainException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to add quote to collection");
    }
  });
}

/**
 * Server Action: Get Collection Quotes
 */
export async function getCollectionQuotes(collectionId: number) {
  const useCase = UseCaseFactory.createGetCollectionQuotesUseCase();
  const result = await useCase.execute(collectionId);
  return result.quotes;
}
