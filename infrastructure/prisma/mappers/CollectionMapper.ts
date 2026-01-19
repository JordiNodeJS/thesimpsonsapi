import {
  QuoteCollection,
  CollectionQuote,
  QuoteCollectionData,
  CollectionQuoteData,
} from "@/core/domain/entities";

type PrismaQuoteCollection = {
  id: number;
  userId: string | null;
  name: string;
  description: string | null;
};

type PrismaCollectionQuote = {
  id: number;
  collectionId: number | null;
  quoteText: string;
  characterName: string | null;
  sourceEpisode: string | null;
};

/**
 * Quote Collection Mapper
 * Converts between Prisma models and Domain entities
 */
export class CollectionMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaQuoteCollection): QuoteCollection {
    return QuoteCollection.create({
      id: record.id,
      userId: record.userId,
      name: record.name,
      description: record.description,
    });
  }

  /**
   * Maps Domain entity to create data
   */
  static toCreateData(collection: QuoteCollection): {
    userId: string;
    name: string;
    description: string;
  } {
    return {
      userId: collection.userId!,
      name: collection.name,
      description: collection.description || "",
    };
  }
}

/**
 * Collection Quote Mapper
 * Converts between Prisma models and Domain entities
 */
export class CollectionQuoteMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaCollectionQuote): CollectionQuote {
    return CollectionQuote.create({
      id: record.id,
      collectionId: record.collectionId,
      quoteText: record.quoteText,
      characterName: record.characterName,
      sourceEpisode: record.sourceEpisode,
    });
  }

  /**
   * Maps Domain entity to create data
   */
  static toCreateData(quote: CollectionQuote): {
    collectionId: number;
    quoteText: string;
    characterName: string;
    sourceEpisode: string;
  } {
    return {
      collectionId: quote.collectionId!,
      quoteText: quote.quoteText,
      characterName: quote.characterName || "",
      sourceEpisode: quote.sourceEpisode || "",
    };
  }
}
