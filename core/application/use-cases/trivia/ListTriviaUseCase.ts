import { TriviaRepository } from "@/core/application/ports/repositories";

/**
 * Output DTO for ListTriviaUseCase
 */
export interface TriviaListOutput {
  trivia: Array<{
    id: number;
    content: string;
    username: string;
    createdAt: string | null;
  }>;
  total: number;
}

/**
 * Use Case: List Trivia
 * Retrieves trivia facts for an entity
 */
export class ListTriviaUseCase {
  constructor(private triviaRepository: TriviaRepository) {}

  async execute(entityType: "CHARACTER" | "EPISODE", entityId: number): Promise<TriviaListOutput> {
    const trivia = await this.triviaRepository.findByEntity(entityType, entityId);

    return {
      trivia: trivia.map((t) => ({
        id: t.id,
        content: t.content,
        username: t.username,
        createdAt: t.createdAt?.toISOString() ?? null,
      })),
      total: trivia.length,
    };
  }
}
