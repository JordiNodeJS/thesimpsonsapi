import { TriviaFact } from "@/core/domain/entities";
import {
  TriviaRepository,
  CharacterRepository,
  EpisodeRepository,
} from "@/core/application/ports/repositories";
import { NotFoundException } from "@/core/domain/exceptions";

/**
 * Input DTO for SubmitTriviaUseCase
 */
export interface SubmitTriviaInput {
  entityType: "CHARACTER" | "EPISODE";
  entityId: number;
  content: string;
}

/**
 * Output DTO for SubmitTriviaUseCase
 */
export interface SubmitTriviaOutput {
  success: boolean;
  trivia: {
    id: number;
    content: string;
    entityType: string | null;
    entityId: number;
  };
}

/**
 * Use Case: Submit Trivia
 * Allows authenticated users to submit trivia facts
 */
export class SubmitTriviaUseCase {
  constructor(
    private triviaRepository: TriviaRepository,
    private characterRepository: CharacterRepository,
    private episodeRepository: EpisodeRepository,
  ) {}

  async execute(
    input: SubmitTriviaInput,
    userId: string,
    username: string,
  ): Promise<SubmitTriviaOutput> {
    // 1. Validate entity exists
    if (input.entityType === "CHARACTER") {
      const character = await this.characterRepository.findById(input.entityId);
      if (!character) {
        throw new NotFoundException("Character", input.entityId);
      }
    } else if (input.entityType === "EPISODE") {
      const episode = await this.episodeRepository.findById(input.entityId);
      if (!episode) {
        throw new NotFoundException("Episode", input.entityId);
      }
    }

    // 2. Create trivia entity (validates content length)
    const trivia = TriviaFact.createNew(
      input.entityType,
      input.entityId,
      input.content,
      userId,
      username,
    );

    // 3. Persist trivia
    const savedTrivia = await this.triviaRepository.create(trivia);

    // 4. Return result
    return {
      success: true,
      trivia: {
        id: savedTrivia.id,
        content: savedTrivia.content,
        entityType: savedTrivia.relatedEntityType,
        entityId: savedTrivia.relatedEntityId,
      },
    };
  }
}
