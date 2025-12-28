"use server";

import { execute } from "@/app/_lib/db-utils";
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
  await execute(
    `INSERT INTO diary_entries (user_id, character_id, location_id, activity_description, entry_date)
     VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
    [user.id, characterId, locationId, description]
  );
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
  await execute(`DELETE FROM diary_entries WHERE id = $1 AND user_id = $2`, [
    id,
    user.id,
  ]);
  revalidatePath("/diary");
}
