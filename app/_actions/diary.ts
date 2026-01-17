"use server";

import { prisma } from "@/app/_lib/prisma";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import {
  findDiaryEntriesByUser,
  findAllLocations,
} from "@/app/_lib/repositories";

export async function createDiaryEntry(
  characterId: number,
  locationId: number,
  description: string
) {
  const user = await getCurrentUser();
  await prisma.diaryEntry.create({
    data: {
      userId: user.id,
      characterId,
      locationId,
      activityDescription: description,
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

export async function deleteDiaryEntry(id: number) {
  const user = await getCurrentUser();
  await prisma.diaryEntry.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });
  revalidatePath("/diary");
}
