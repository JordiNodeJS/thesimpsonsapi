import { QuoteCollection, CollectionQuote } from "@/core/domain/entities";

/**
 * Collection Repository Interface (Port)
 * Defines the contract for quote collection data access
 */
export interface CollectionRepository {
  /**
   * Find collections by user
   */
  findByUser(userId: string): Promise<QuoteCollection[]>;

  /**
   * Find a collection by ID
   */
  findById(id: number): Promise<QuoteCollection | null>;

  /**
   * Create a new collection
   */
  create(collection: QuoteCollection): Promise<QuoteCollection>;

  /**
   * Delete a collection (only if owned by user)
   */
  delete(id: number, userId: string): Promise<boolean>;

  /**
   * Get quotes in a collection
   */
  getQuotes(collectionId: number): Promise<CollectionQuote[]>;

  /**
   * Add a quote to a collection
   */
  addQuote(quote: CollectionQuote): Promise<CollectionQuote>;

  /**
   * Remove a quote from a collection
   */
  removeQuote(quoteId: number): Promise<boolean>;
}
