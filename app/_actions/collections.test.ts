/**
 * Tests for Collections Server Actions
 * @module collections.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/__mocks__/prisma";
import { mockGetCurrentUser } from "@/__mocks__/auth";
import { createMockUser } from "@/__tests__/factories";

// Import after mocks are setup
import {
  createCollection,
  getCollections,
  addQuote,
  getCollectionQuotes,
} from "./collections";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Collections Server Actions", () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCollection", () => {
    it("should create a collection for authenticated user", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.quoteCollection.create.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        name: "Best Quotes",
        description: "My favorite quotes",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createCollection(
        "Best Quotes",
        "My favorite quotes",
      );

      expect(prismaMock.quoteCollection.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          name: "Best Quotes",
          description: "My favorite quotes",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        createCollection("Test Collection", "Description"),
      ).rejects.toThrow("Unauthorized");
    });

    it("should validate collection name is required", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await expect(createCollection("", "Description")).rejects.toThrow();
    });

    it("should validate collection name max length (100)", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      const longName = "a".repeat(101);

      await expect(createCollection(longName, "")).rejects.toThrow();
    });

    it("should validate description max length (500)", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      const longDesc = "a".repeat(501);

      await expect(createCollection("Name", longDesc)).rejects.toThrow();
    });

    it("should allow empty description", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.quoteCollection.create.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        name: "Quotes",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createCollection("Quotes", "");

      expect(result).toEqual({ success: true });
    });

    it("should handle database errors", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.quoteCollection.create.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(createCollection("Test", "Description")).rejects.toThrow(
        "Failed to create collection",
      );
    });
  });

  describe("getCollections", () => {
    it("should return collections for authenticated user", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      const mockCollections = [
        {
          id: 1,
          userId: mockUser.id,
          name: "Collection 1",
          description: "Desc 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: mockUser.id,
          name: "Collection 2",
          description: "Desc 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      prismaMock.quoteCollection.findMany.mockResolvedValue(mockCollections);

      const result = await getCollections();

      expect(prismaMock.quoteCollection.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { id: "desc" },
      });
      expect(result).toHaveLength(2);
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

      await expect(getCollections()).rejects.toThrow("Unauthorized");
    });
  });

  describe("addQuote", () => {
    it("should add a quote to a collection", async () => {
      prismaMock.collectionQuote.create.mockResolvedValue({
        id: 1,
        collectionId: 1,
        quoteText: "D'oh!",
        characterName: "Homer Simpson",
        sourceEpisode: "S01E01",
        createdAt: new Date(),
      });

      const result = await addQuote(1, "D'oh!", "Homer Simpson", "S01E01");

      expect(prismaMock.collectionQuote.create).toHaveBeenCalledWith({
        data: {
          collectionId: 1,
          quoteText: "D'oh!",
          characterName: "Homer Simpson",
          sourceEpisode: "S01E01",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("should validate quote text is required", async () => {
      await expect(addQuote(1, "", "Homer", "S01E01")).rejects.toThrow();
    });

    it("should validate character name is required", async () => {
      await expect(addQuote(1, "Quote", "", "S01E01")).rejects.toThrow();
    });

    it("should validate collection ID is positive", async () => {
      await expect(addQuote(-1, "Quote", "Homer", "")).rejects.toThrow();
      await expect(addQuote(0, "Quote", "Homer", "")).rejects.toThrow();
    });

    it("should allow empty episode source", async () => {
      prismaMock.collectionQuote.create.mockResolvedValue({
        id: 1,
        collectionId: 1,
        quoteText: "D'oh!",
        characterName: "Homer Simpson",
        sourceEpisode: "",
        createdAt: new Date(),
      });

      const result = await addQuote(1, "D'oh!", "Homer Simpson", "");

      expect(result).toEqual({ success: true });
    });

    it("should handle database errors", async () => {
      prismaMock.collectionQuote.create.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(addQuote(1, "Quote", "Homer", "")).rejects.toThrow(
        "Failed to add quote to collection",
      );
    });
  });

  describe("getCollectionQuotes", () => {
    it("should return quotes for a collection", async () => {
      const mockQuotes = [
        {
          id: 1,
          collectionId: 1,
          quoteText: "D'oh!",
          characterName: "Homer",
          sourceEpisode: "S01E01",
          createdAt: new Date(),
        },
        {
          id: 2,
          collectionId: 1,
          quoteText: "Ay caramba!",
          characterName: "Bart",
          sourceEpisode: "S01E02",
          createdAt: new Date(),
        },
      ];
      prismaMock.collectionQuote.findMany.mockResolvedValue(mockQuotes);

      const result = await getCollectionQuotes(1);

      expect(prismaMock.collectionQuote.findMany).toHaveBeenCalledWith({
        where: { collectionId: 1 },
        orderBy: { id: "desc" },
      });
      expect(result).toHaveLength(2);
    });

    it("should return empty array for collection with no quotes", async () => {
      prismaMock.collectionQuote.findMany.mockResolvedValue([]);

      const result = await getCollectionQuotes(999);

      expect(result).toHaveLength(0);
    });
  });
});
