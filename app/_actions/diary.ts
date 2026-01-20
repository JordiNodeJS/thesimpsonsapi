/**
 * Diary Server Actions - FULL DDD PATTERN
 *
 * 🎓 EDUCATIONAL NOTE: Why Full DDD Here?
 * =======================================
 * The Diary domain is a perfect example of where DDD adds real value:
 *
 * 1. BUSINESS RULES
 *    - Character must exist (referential integrity)
 *    - Location must exist (referential integrity)
 *    - Description has min/max length rules
 *
 * 2. USER OWNERSHIP
 *    - All entries belong to a specific user
 *    - Users can only see/modify their own entries
 *    - RLS enforcement at database level
 *
 * 3. AUTHORIZATION
 *    - All operations require authentication
 *    - Delete checks ownership via RLS
 *
 * 4. TESTABILITY
 *    - UseCase layer can be unit tested with mocked repos
 *    - Domain entity validates data independently
 *
 * CONTRAST WITH SIMPLE PATTERN:
 * - Characters list → No business rules, public data
 * - Episode list → No business rules, public data
 *
 * See docs/ARCHITECTURE_DECISION_MATRIX.md for the decision guide.
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/app/_lib/prisma";
import { withAuthenticatedRLS } from "@/app/_lib/prisma-rls";
import { UseCaseFactory } from "@/infrastructure/factories";
import {
  AuthorizationException,
  DomainException,
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

      if (
        error instanceof NotFoundException ||
        error instanceof ValidationException ||
        error instanceof DomainException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw error;
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

      if (
        error instanceof NotFoundException ||
        error instanceof AuthorizationException ||
        error instanceof DomainException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to delete diary entry");
    }
  });
}
