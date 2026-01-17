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
  await prisma.diaryEntry.deleteMany({
    where: {
      id: validated.id,
      userId: user.id,
    },
  });
  revalidatePath("/diary");
}
