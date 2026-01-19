import { CollectionQuote } from "@/core/domain/entities";
import { CollectionRepository } from "@/core/application/ports/repositories";
import { AuthorizationException, NotFoundException } from "@/core/domain/exceptions";

/**
 * Input DTO for AddQuoteUseCase
 */
export interface AddQuoteInput {
  collectionId: number;
  text: string;
  character: string;
  episode?: string;
}

/**
 * Output DTO for AddQuoteUseCase
 */
export interface AddQuoteOutput {
  success: boolean;
  quote: {
    id: number;
    quoteText: string;
    characterName: string | null;
    sourceEpisode: string | null;
  };
}

/**
 * Use Case: Add Quote to Collection
 * Allows users to add quotes to their collections
 */
export class AddQuoteUseCase {
  constructor(private collectionRepository: CollectionRepository) {}

  async execute(input: AddQuoteInput, userId: string): Promise<AddQuoteOutput> {
    // 1. Validate collection exists and belongs to user
    const collection = await this.collectionRepository.findById(input.collectionId);
    if (!collection) {
      throw new NotFoundException("Collection", input.collectionId);
    }

    if (!collection.belongsTo(userId)) {
      throw new AuthorizationException("You can only add quotes to your own collections");
    }

    // 2. Create quote entity (validates content)
    const quote = CollectionQuote.createNew(
      input.collectionId,
      input.text,
      input.character,
      input.episode
    );

    // 3. Persist quote
    const savedQuote = await this.collectionRepository.addQuote(quote);

    // 4. Return result
    return {
      success: true,
      quote: {
        id: savedQuote.id,
        quoteText: savedQuote.quoteText,
        characterName: savedQuote.characterName,
        sourceEpisode: savedQuote.sourceEpisode,
      },
    };
  }
}
