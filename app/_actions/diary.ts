"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  findDiaryEntriesByUser,
  findAllLocations,
} from "@/app/_lib/repositories";

const CreateDiaryEntrySchema = z.object({
  characterId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  description: z.string().min(1, "Description is required").max(1000),
});

export async function createDiaryEntry(
  characterId: number,
  locationId: number,
  description: string
) {
  const validated = CreateDiaryEntrySchema.parse({
    characterId,
    locationId,
    description,
  });
  const user = await getCurrentUser();
  
  try {
    await prisma.diaryEntry.create({
      data: {
        userId: user.id,
        characterId: validated.characterId,
        locationId: validated.locationId,
        activityDescription: validated.description,
        entryDate: new Date(),
      },
    });
    revalidatePath("/diary");
    return { success: true };
  } catch (error) {
    console.error("[createDiaryEntry] Error:", error);
    throw new Error("Failed to create diary entry");
  }
}

export async function getDiaryEntries() {
  const user = await getCurrentUser();
  return findDiaryEntriesByUser(user.id);
}

export async function getLocations() {
  return findAllLocations();
}

const DeleteDiaryEntrySchema = z.object({
  id: z.number().int().positive(),
});

export async function deleteDiaryEntry(id: number) {
  const validated = DeleteDiaryEntrySchema.parse({ id });
  const user = await getCurrentUser();
  
  try {
    const result = await prisma.diaryEntry.deleteMany({
      where: {
        id: validated.id,
        userId: user.id,
      },
    });
    
    if (result.count === 0) {
      throw new Error("Entry not found or you don't have permission to delete it");
    }
    
    revalidatePath("/diary");
    return { success: true };
  } catch (error) {
    console.error("[deleteDiaryEntry] Error:", error);
    throw error instanceof Error ? error : new Error("Failed to delete diary entry");
  }
}
