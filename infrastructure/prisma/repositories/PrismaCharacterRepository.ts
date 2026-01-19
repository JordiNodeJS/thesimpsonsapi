import { CharacterRepository } from "@/core/application/ports/repositories";
import { Character } from "@/core/domain/entities";
import { prisma } from "@/app/_lib/prisma";
import { CharacterMapper } from "../mappers";

/**
 * Prisma implementation of CharacterRepository
 * Implements the port defined in the Application layer
 */
export class PrismaCharacterRepository implements CharacterRepository {
  async findAll(limit: number = 50): Promise<Character[]> {
    const records = await prisma.character.findMany({
      take: limit,
      orderBy: { id: "asc" },
    });

    return records.map(CharacterMapper.toDomain);
  }

  async findById(id: number): Promise<Character | null> {
    const record = await prisma.character.findUnique({
      where: { id },
    });

    return record ? CharacterMapper.toDomain(record) : null;
  }

  async findFeatured(): Promise<Character[]> {
    const records = await prisma.character.findMany({
      where: {
        name: {
          in: [
            "Homer Simpson",
            "Marge Simpson",
            "Bart Simpson",
            "Lisa Simpson",
            "Maggie Simpson",
          ],
        },
      },
      take: 5,
    });

    return records.map(CharacterMapper.toDomain);
  }

  async findNames(): Promise<
    Array<{ id: number; name: string; imageUrl: string | null }>
  > {
    const records = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
      orderBy: { name: "asc" },
    });

    return records;
  }

  async isFollowing(userId: string, characterId: number): Promise<boolean> {
    const follow = await prisma.characterFollow.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId,
        },
      },
    });

    return follow !== null;
  }

  async getFollowerCount(characterId: number): Promise<number> {
    const count = await prisma.characterFollow.count({
      where: { characterId },
    });

    return count;
  }
}
