/**
 * Diary Server Actions - Frame-centric Pattern
 *
 * Simplified Server Actions following Next.js 16 best practices.
 * All business logic is embedded directly in the actions.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma, withAuthenticatedRLS } from "@/lib/db";
import {
  CreateDiaryEntrySchema,
  DeleteDiaryEntrySchema,
} from "@/lib/validators";

/**
 * Create a new diary entry
 *
 * Business rules embedded:
 * - Character must exist
 * - Location must exist
 * - Description validated by Zod (1-1000 chars)
 * - Entry belongs to authenticated user
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
    // 1. Verify character exists
    const character = await tx.character.findUnique({
      where: { id: validated.characterId },
    });

    if (!character) {
      throw new Error(`Character with ID ${validated.characterId} not found`);
    }

    // 2. Verify location exists
    const location = await tx.location.findUnique({
      where: { id: validated.locationId },
    });

    if (!location) {
      throw new Error(`Location with ID ${validated.locationId} not found`);
    }

    // 3. Create diary entry
    const entry = await tx.diaryEntry.create({
      data: {
        userId: user.id,
        characterId: validated.characterId,
        locationId: validated.locationId,
        activityDescription: validated.description,
        entryDate: new Date(),
      },
    });

    // 4. Revalidate cache
    revalidatePath("/diary");

    return {
      success: true,
      entry: {
        id: entry.id,
        description: entry.activityDescription,
        entryDate: entry.entryDate,
        characterName: character.name,
        locationName: location.name,
      },
    };
  });
}

/**
 * Get user's diary entries
 *
 * RLS automatically filters by current user
 */
export async function getDiaryEntries() {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const entries = await tx.diaryEntry.findMany({
      where: { userId: user.id },
      include: {
        character: {
          select: { name: true, imageUrl: true },
        },
        location: {
          select: { name: true },
        },
      },
      orderBy: { entryDate: "desc" },
    });

    return entries.map((entry) => ({
      id: entry.id,
      description: entry.activityDescription,
      entryDate: entry.entryDate,
      characterName: entry.character?.name ?? null,
      characterImage: entry.character?.imageUrl ?? null,
      locationName: entry.location?.name ?? null,
    }));
  });
}

/**
 * Get all locations for dropdown
 */
export async function getLocations() {
  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  return locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
  }));
}

/**
 * Delete a diary entry
 *
 * RLS ensures users can only delete their own entries
 */
export async function deleteDiaryEntry(id: number) {
  const validated = DeleteDiaryEntrySchema.parse({ id });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    // Verify entry exists and belongs to user (RLS handles this too)
    const entry = await tx.diaryEntry.findUnique({
      where: { id: validated.id },
    });

    if (!entry) {
      throw new Error(`Diary entry with ID ${validated.id} not found`);
    }

    if (entry.userId !== user.id) {
      throw new Error("Not authorized to delete this entry");
    }

    await tx.diaryEntry.delete({
      where: { id: validated.id },
    });

    revalidatePath("/diary");
    return { success: true };
  });
}
