import { TriviaRepository } from "@/core/application/ports/repositories";
import { TriviaFact } from "@/core/domain/entities";
import { prisma } from "@/app/_lib/prisma";
import { TriviaMapper } from "../mappers";

/**
 * Prisma implementation of TriviaRepository
 */
export class PrismaTriviaRepository implements TriviaRepository {
  async findByEntity(
    entityType: "CHARACTER" | "EPISODE",
    entityId: number,
  ): Promise<TriviaFact[]> {
    const records = await prisma.triviaFact.findMany({
      where: {
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      },
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map(TriviaMapper.toDomain);
  }

  async findById(id: number): Promise<TriviaFact | null> {
    const record = await prisma.triviaFact.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    return record ? TriviaMapper.toDomain(record) : null;
  }

  async create(trivia: TriviaFact): Promise<TriviaFact> {
    const data = TriviaMapper.toCreateData(trivia);

    const record = await prisma.triviaFact.create({
      data,
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    return TriviaMapper.toDomain(record);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const result = await prisma.triviaFact.deleteMany({
      where: {
        id,
        submittedByUserId: userId,
      },
    });

    return result.count > 0;
  }
}
