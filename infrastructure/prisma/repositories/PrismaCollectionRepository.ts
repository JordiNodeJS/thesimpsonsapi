import { CollectionRepository } from "@/core/application/ports/repositories";
import { QuoteCollection, CollectionQuote } from "@/core/domain/entities";
import { prisma } from "@/app/_lib/prisma";
import { CollectionMapper, CollectionQuoteMapper } from "../mappers";

/**
 * Prisma implementation of CollectionRepository
 */
export class PrismaCollectionRepository implements CollectionRepository {
  async findByUser(userId: string): Promise<QuoteCollection[]> {
    const records = await prisma.quoteCollection.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    });

    return records.map(CollectionMapper.toDomain);
  }

  async findById(id: number): Promise<QuoteCollection | null> {
    const record = await prisma.quoteCollection.findUnique({
      where: { id },
    });

    return record ? CollectionMapper.toDomain(record) : null;
  }

  async create(collection: QuoteCollection): Promise<QuoteCollection> {
    const data = CollectionMapper.toCreateData(collection);

    const record = await prisma.quoteCollection.create({
      data,
    });

    return CollectionMapper.toDomain(record);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const result = await prisma.quoteCollection.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return result.count > 0;
  }

  async getQuotes(collectionId: number): Promise<CollectionQuote[]> {
    const records = await prisma.collectionQuote.findMany({
      where: { collectionId },
      orderBy: { id: "desc" },
    });

    return records.map(CollectionQuoteMapper.toDomain);
  }

  async addQuote(quote: CollectionQuote): Promise<CollectionQuote> {
    const data = CollectionQuoteMapper.toCreateData(quote);

    const record = await prisma.collectionQuote.create({
      data,
    });

    return CollectionQuoteMapper.toDomain(record);
  }

  async removeQuote(quoteId: number): Promise<boolean> {
    const result = await prisma.collectionQuote.deleteMany({
      where: { id: quoteId },
    });

    return result.count > 0;
  }
}
