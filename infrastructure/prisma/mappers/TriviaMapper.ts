import { TriviaFact, TriviaFactData } from "@/core/domain/entities";

type PrismaTriviaFact = {
  id: number;
  relatedEntityType: string | null;
  relatedEntityId: number;
  content: string;
  submittedByUserId: string | null;
  createdAt: Date | null;
  user?: {
    username: string | null;
    name: string | null;
  } | null;
};

/**
 * Trivia Fact Mapper
 * Converts between Prisma models and Domain entities
 */
export class TriviaMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaTriviaFact): TriviaFact {
    return TriviaFact.create({
      id: record.id,
      relatedEntityType: record.relatedEntityType,
      relatedEntityId: record.relatedEntityId,
      content: record.content,
      submittedByUserId: record.submittedByUserId,
      createdAt: record.createdAt,
      username: record.user?.username || record.user?.name || "Anonymous",
    });
  }

  /**
   * Maps Domain entity to create data
   */
  static toCreateData(trivia: TriviaFact): {
    relatedEntityType: string;
    relatedEntityId: number;
    content: string;
    submittedByUserId: string;
  } {
    return {
      relatedEntityType: trivia.relatedEntityType!,
      relatedEntityId: trivia.relatedEntityId,
      content: trivia.content,
      submittedByUserId: trivia.submittedByUserId!,
    };
  }
}
