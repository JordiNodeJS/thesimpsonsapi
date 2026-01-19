import { Character } from "@/core/domain/entities";
import { CharacterRepository } from "@/core/application/ports/repositories";

/**
 * Output DTO for ListCharactersUseCase
 */
export interface CharacterListOutput {
  characters: Array<{
    id: number;
    name: string;
    occupation: string | null;
    imageUrl: string | null;
  }>;
  total: number;
}

/**
 * Use Case: List Characters
 * Retrieves a list of characters
 */
export class ListCharactersUseCase {
  constructor(private characterRepository: CharacterRepository) {}

  async execute(limit?: number): Promise<CharacterListOutput> {
    const characters = await this.characterRepository.findAll(limit);

    return {
      characters: characters.map((char) => ({
        id: char.id,
        name: char.name,
        occupation: char.occupation,
        imageUrl: char.imageUrl,
      })),
      total: characters.length,
    };
  }

  async executeFeatured(): Promise<CharacterListOutput> {
    const characters = await this.characterRepository.findFeatured();

    return {
      characters: characters.map((char) => ({
        id: char.id,
        name: char.name,
        occupation: char.occupation,
        imageUrl: char.imageUrl,
      })),
      total: characters.length,
    };
  }
}
