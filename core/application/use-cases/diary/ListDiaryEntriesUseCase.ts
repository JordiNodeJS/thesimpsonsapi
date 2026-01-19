import { DiaryRepository } from "@/core/application/ports/repositories";

/**
 * Output DTO for ListDiaryEntriesUseCase
 * Uses activityDescription for compatibility with existing UI
 */
export interface DiaryEntryListOutput {
  entries: Array<{
    id: number;
    activityDescription: string;
    entryDate: string | null;
    characterName: string | null;
    locationName: string | null;
  }>;
  total: number;
}

/**
 * Use Case: List Diary Entries
 * Retrieves all diary entries for an authenticated user
 */
export class ListDiaryEntriesUseCase {
  constructor(private diaryRepository: DiaryRepository) {}

  async execute(userId: string): Promise<DiaryEntryListOutput> {
    const entries = await this.diaryRepository.findByUser(userId);

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        activityDescription: entry.description,
        entryDate: entry.entryDate?.toISOString() ?? null,
        characterName: entry.characterName,
        locationName: entry.locationName,
      })),
      total: entries.length,
    };
  }
}
