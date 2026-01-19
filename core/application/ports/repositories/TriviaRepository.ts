import { TriviaFact } from "@/core/domain/entities";

/**
 * Trivia Repository Interface (Port)
 * Defines the contract for trivia fact data access
 */
export interface TriviaRepository {
  /**
   * Find trivia for an entity
   */
  findByEntity(entityType: "CHARACTER" | "EPISODE", entityId: number): Promise<TriviaFact[]>;

  /**
   * Find a trivia fact by ID
   */
  findById(id: number): Promise<TriviaFact | null>;

  /**
   * Create a new trivia fact
   */
  create(trivia: TriviaFact): Promise<TriviaFact>;

  /**
   * Delete a trivia fact (only if submitted by user)
   */
  delete(id: number, userId: string): Promise<boolean>;
}
