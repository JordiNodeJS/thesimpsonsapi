import { CollectionRepository } from "@/core/application/ports/repositories";

/**
 * Output DTO for ListCollectionsUseCase
 */
export interface CollectionListOutput {
  collections: Array<{
    id: number;
    name: string;
    description: string | null;
    quoteCount?: number;
  }>;
  total: number;
}

/**
 * Use Case: List User Collections
 * Retrieves all quote collections for an authenticated user
 */
export class ListCollectionsUseCase {
  constructor(private collectionRepository: CollectionRepository) {}

  async execute(userId: string): Promise<CollectionListOutput> {
    const collections = await this.collectionRepository.findByUser(userId);

    return {
      collections: collections.map((col) => ({
        id: col.id,
        name: col.name,
        description: col.description,
      })),
      total: collections.length,
    };
  }
}

/**
 * Output DTO for GetCollectionQuotesUseCase
 */
export interface CollectionQuotesOutput {
  quotes: Array<{
    id: number;
    quoteText: string;
    characterName: string | null;
    sourceEpisode: string | null;
    attribution: string;
  }>;
  total: number;
}

/**
 * Use Case: Get Collection Quotes
 * Retrieves all quotes in a collection
 */
export class GetCollectionQuotesUseCase {
  constructor(private collectionRepository: CollectionRepository) {}

  async execute(collectionId: number): Promise<CollectionQuotesOutput> {
    const quotes = await this.collectionRepository.getQuotes(collectionId);

    return {
      quotes: quotes.map((q) => ({
        id: q.id,
        quoteText: q.quoteText,
        characterName: q.characterName,
        sourceEpisode: q.sourceEpisode,
        attribution: q.getAttribution(),
      })),
      total: quotes.length,
    };
  }
}
