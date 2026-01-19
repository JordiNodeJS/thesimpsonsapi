import { QuoteCollection } from "@/core/domain/entities";
import { CollectionRepository } from "@/core/application/ports/repositories";

/**
 * Input DTO for CreateCollectionUseCase
 */
export interface CreateCollectionInput {
  name: string;
  description?: string;
}

/**
 * Output DTO for CreateCollectionUseCase
 */
export interface CreateCollectionOutput {
  success: boolean;
  collection: {
    id: number;
    name: string;
    description: string | null;
  };
}

/**
 * Use Case: Create Quote Collection
 * Allows authenticated users to create quote collections
 */
export class CreateCollectionUseCase {
  constructor(private collectionRepository: CollectionRepository) {}

  async execute(input: CreateCollectionInput, userId: string): Promise<CreateCollectionOutput> {
    // 1. Create collection entity (validates name)
    const collection = QuoteCollection.createNew(userId, input.name, input.description);

    // 2. Persist collection
    const savedCollection = await this.collectionRepository.create(collection);

    // 3. Return result
    return {
      success: true,
      collection: {
        id: savedCollection.id,
        name: savedCollection.name,
        description: savedCollection.description,
      },
    };
  }
}
