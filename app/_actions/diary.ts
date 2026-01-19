"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/app/_lib/auth";
import { prisma } from "@/app/_lib/prisma";
import { withAuthenticatedRLS } from "@/app/_lib/prisma-rls";
import { UseCaseFactory } from "@/infrastructure/factories";
import {
  AuthorizationException,
  NotFoundException,
  ValidationException,
} from "@/core/domain/exceptions";

// Zod schemas for input validation
const CreateDiaryEntrySchema = z.object({
  characterId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  description: z.string().min(1, "Description is required").max(1000),
});

const DeleteDiaryEntrySchema = z.object({
  id: z.number().int().positive(),
});

/**
 * Server Action: Create Diary Entry
 * Thin controller that delegates to use case with RLS
 */
export async function createDiaryEntry(
  characterId: number,
  locationId: number,
  description: string,
) {
  const validated = CreateDiaryEntrySchema.parse({
    characterId,
    locationId,
    description,
  });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    try {
      const useCase = UseCaseFactory.createCreateDiaryEntryUseCase();
      await useCase.execute(
        {
          characterId: validated.characterId,
          locationId: validated.locationId,
          description: validated.description,
        },
        user.id,
      );

      revalidatePath("/diary");
      return { success: true };
    } catch (error) {
      console.error("[createDiaryEntry] Error:", error);

      if (error instanceof NotFoundException) {
        throw new Error(error.message);
      }
      if (error instanceof ValidationException) {
        throw new Error(error.message);
      }

      throw new Error("Failed to create diary entry");
    }
  });
}

/**
 * Server Action: Get Diary Entries
 * RLS automatically filters entries by current user
 */
export async function getDiaryEntries() {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const useCase = UseCaseFactory.createListDiaryEntriesUseCase();
    const result = await useCase.execute(user.id);
    return result.entries;
  });
}

/**
 * Server Action: Get Locations
 */
export async function getLocations() {
  const locationRepo = UseCaseFactory.getLocationRepository();
  const locations = await locationRepo.findAll();
  return locations.map((loc) => loc.toJSON());
}

/**
 * Server Action: Delete Diary Entry
 * Thin controller that delegates to use case with RLS
 * RLS ensures users can only delete their own entries
 */
export async function deleteDiaryEntry(id: number) {
  const validated = DeleteDiaryEntrySchema.parse({ id });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    try {
      const useCase = UseCaseFactory.createDeleteDiaryEntryUseCase();
      await useCase.execute(validated.id, user.id);

      revalidatePath("/diary");
      return { success: true };
    } catch (error) {
      console.error("[deleteDiaryEntry] Error:", error);

      // Check by error code (more reliable than instanceof in test environments)
      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        if (errorCode === "NOT_FOUND" || error instanceof NotFoundException) {
          throw new Error("Entry not found");
        }
        if (
          errorCode === "UNAUTHORIZED" ||
          error instanceof AuthorizationException
        ) {
          throw new Error("You don't have permission to delete this entry");
        }
      }

      throw new Error("Failed to delete diary entry");
    }
  });
}
