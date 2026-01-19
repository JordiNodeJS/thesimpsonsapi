import { DiaryEntry } from "@/core/domain/entities";
import { DiaryRepository, LocationRepository, CharacterRepository } from "@/core/application/ports/repositories";
import { NotFoundException } from "@/core/domain/exceptions";

/**
 * Input DTO for CreateDiaryEntryUseCase
 */
export interface CreateDiaryEntryInput {
  characterId: number;
  locationId: number;
  description: string;
}

/**
 * Output DTO for CreateDiaryEntryUseCase
 */
export interface CreateDiaryEntryOutput {
  success: boolean;
  entry: {
    id: number;
    description: string;
    entryDate: Date | null;
    characterName: string | null;
    locationName: string | null;
  };
}

/**
 * Use Case: Create Diary Entry
 * Allows authenticated users to create diary entries
 */
export class CreateDiaryEntryUseCase {
  constructor(
    private diaryRepository: DiaryRepository,
    private characterRepository: CharacterRepository,
    private locationRepository: LocationRepository
  ) {}

  async execute(input: CreateDiaryEntryInput, userId: string): Promise<CreateDiaryEntryOutput> {
    // 1. Validate character exists
    const character = await this.characterRepository.findById(input.characterId);
    if (!character) {
      throw new NotFoundException("Character", input.characterId);
    }

    // 2. Validate location exists
    const location = await this.locationRepository.findById(input.locationId);
    if (!location) {
      throw new NotFoundException("Location", input.locationId);
    }

    // 3. Create diary entry entity (validates description)
    const entry = DiaryEntry.createNew(
      userId,
      input.characterId,
      input.locationId,
      input.description
    );

    // 4. Persist entry
    const savedEntry = await this.diaryRepository.create(entry);

    // 5. Return result with related names
    return {
      success: true,
      entry: {
        id: savedEntry.id,
        description: savedEntry.description,
        entryDate: savedEntry.entryDate,
        characterName: character.name,
        locationName: location.name,
      },
    };
  }
}
