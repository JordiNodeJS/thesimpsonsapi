import { Location, DiaryEntry, LocationData, DiaryEntryData } from "@/core/domain/entities";

type PrismaLocation = {
  id: number;
  externalId: number;
  name: string;
};

type PrismaDiaryEntry = {
  id: number;
  userId: string | null;
  characterId: number | null;
  locationId: number | null;
  activityDescription: string;
  entryDate: Date | null;
  character?: { name: string } | null;
  location?: { name: string } | null;
};

/**
 * Location Mapper
 * Converts between Prisma models and Domain entities
 */
export class LocationMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaLocation): Location {
    return Location.create({
      id: record.id,
      externalId: record.externalId,
      name: record.name,
    });
  }
}

/**
 * Diary Entry Mapper
 * Converts between Prisma models and Domain entities
 */
export class DiaryEntryMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaDiaryEntry): DiaryEntry {
    return DiaryEntry.create({
      id: record.id,
      userId: record.userId,
      characterId: record.characterId,
      locationId: record.locationId,
      activityDescription: record.activityDescription,
      entryDate: record.entryDate,
      characterName: record.character?.name ?? null,
      locationName: record.location?.name ?? null,
    });
  }

  /**
   * Maps Domain entity to create data
   */
  static toCreateData(entry: DiaryEntry): {
    userId: string;
    characterId: number;
    locationId: number;
    activityDescription: string;
    entryDate: Date;
  } {
    return {
      userId: entry.userId!,
      characterId: entry.characterId!,
      locationId: entry.locationId!,
      activityDescription: entry.description,
      entryDate: entry.entryDate || new Date(),
    };
  }
}
