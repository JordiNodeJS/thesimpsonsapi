import { DiaryRepository } from "@/core/application/ports/repositories";
import {
  AuthorizationException,
  NotFoundException,
} from "@/core/domain/exceptions";

/**
 * Output DTO for DeleteDiaryEntryUseCase
 */
export interface DeleteDiaryEntryOutput {
  success: boolean;
  deletedId: number;
}

/**
 * Use Case: Delete Diary Entry
 * Allows authenticated users to delete their own diary entries
 */
export class DeleteDiaryEntryUseCase {
  constructor(private diaryRepository: DiaryRepository) {}

  async execute(
    entryId: number,
    userId: string,
  ): Promise<DeleteDiaryEntryOutput> {
    // 1. Verify entry exists and belongs to user
    const entry = await this.diaryRepository.findById(entryId);
    if (!entry) {
      throw new NotFoundException("DiaryEntry", entryId);
    }

    if (!entry.belongsTo(userId)) {
      throw new AuthorizationException(
        "You can only delete your own diary entries",
      );
    }

    // 2. Delete entry
    const deleted = await this.diaryRepository.delete(entryId, userId);
    if (!deleted) {
      throw new NotFoundException("DiaryEntry", entryId);
    }

    // 3. Return result
    return {
      success: true,
      deletedId: entryId,
    };
  }
}
