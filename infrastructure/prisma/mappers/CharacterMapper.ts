import { Character, CharacterData } from "@/core/domain/entities";

type PrismaCharacter = {
  id: number;
  externalId: number;
  name: string;
  occupation: string | null;
  imageUrl: string | null;
};

/**
 * Character Mapper
 * Converts between Prisma models and Domain entities
 */
export class CharacterMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaCharacter): Character {
    return Character.create({
      id: record.id,
      externalId: record.externalId,
      name: record.name,
      occupation: record.occupation,
      imageUrl: record.imageUrl,
    });
  }

  /**
   * Maps Domain entity to persistence data
   */
  static toPersistence(character: Character): PrismaCharacter {
    return {
      id: character.id,
      externalId: character.externalId,
      name: character.name,
      occupation: character.occupation,
      imageUrl: character.imageUrl,
    };
  }
}
