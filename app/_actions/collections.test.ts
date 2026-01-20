/**
 * Tests for Collections Server Actions (Clean Architecture)
 * @module collections.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mockGetCurrentUser,
  mockGetCurrentUserOptional,
} from "@/__mocks__/auth";
import { createMockUser } from "@/__tests__/factories";
import {
  mockCreateCollectionExecute,
  mockListCollectionsExecute,
  mockAddQuoteExecute,
  mockGetCollectionQuotesExecute,
  resetAllMocks,
} from "@/__mocks__/infrastructure/factories/UseCaseFactory";

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
    resetAllMocks();
  });

  describe("createCollection", () => {
    it("should create a collection for authenticated user", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockCreateCollectionExecute.mockResolvedValue({ success: true });

      const result = await createCollection(
        "Best Quotes",
        "My favorite quotes",
      );

      expect(mockCreateCollectionExecute).toHaveBeenCalledWith(
        { name: "Best Quotes", description: "My favorite quotes" },
        mockUser.id,
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

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
      mockCreateCollectionExecute.mockResolvedValue({ success: true });

      const result = await createCollection("Quotes", "");

      expect(result).toEqual({ success: true });
    });

    it("should handle database errors", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockCreateCollectionExecute.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(createCollection("Test", "Description")).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("getCollections", () => {
    it("should return collections for authenticated user", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockListCollectionsExecute.mockResolvedValue({
        collections: [
          { id: 1, name: "Collection 1", description: "Desc 1" },
          { id: 2, name: "Collection 2", description: "Desc 2" },
        ],
        total: 2,
      });

      const result = await getCollections();

      expect(mockListCollectionsExecute).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(2);
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

      await expect(getCollections()).rejects.toThrow("Unauthorized");
    });
  });

  describe("addQuote", () => {
    it("should add a quote to a collection", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAddQuoteExecute.mockResolvedValue({
        success: true,
        quote: {
          id: 1,
          quoteText: "D'oh!",
          characterName: "Homer Simpson",
          sourceEpisode: "S01E01",
        },
      });

      const result = await addQuote(1, "D'oh!", "Homer Simpson", "S01E01");

      expect(mockAddQuoteExecute).toHaveBeenCalledWith(
        {
          collectionId: 1,
          text: "D'oh!",
          character: "Homer Simpson",
          episode: "S01E01",
        },
        mockUser.id,
      );
      expect(result).toEqual({ success: true });
    });

    it("should validate quote text is required", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      await expect(addQuote(1, "", "Homer", "S01E01")).rejects.toThrow();
    });

    it("should validate character name is required", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      await expect(addQuote(1, "Quote", "", "S01E01")).rejects.toThrow();
    });

    it("should validate collection ID is positive", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      await expect(addQuote(-1, "Quote", "Homer", "")).rejects.toThrow();
      await expect(addQuote(0, "Quote", "Homer", "")).rejects.toThrow();
    });

    it("should allow empty episode source", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAddQuoteExecute.mockResolvedValue({
        success: true,
        quote: {
          id: 1,
          quoteText: "D'oh!",
          characterName: "Homer Simpson",
          sourceEpisode: "",
        },
      });

      const result = await addQuote(1, "D'oh!", "Homer Simpson", "");

      expect(result).toEqual({ success: true });
    });

    it("should handle database errors", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockAddQuoteExecute.mockRejectedValue(new Error("Database error"));

      await expect(addQuote(1, "Quote", "Homer", "")).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("getCollectionQuotes", () => {
    it("should return quotes for a collection", async () => {
      mockGetCollectionQuotesExecute.mockResolvedValue({
        quotes: [
          {
            id: 1,
            quoteText: "D'oh!",
            characterName: "Homer",
            sourceEpisode: "S01E01",
            attribution: "Homer - S01E01",
          },
          {
            id: 2,
            quoteText: "Ay caramba!",
            characterName: "Bart",
            sourceEpisode: "S01E02",
            attribution: "Bart - S01E02",
          },
        ],
        total: 2,
      });

      const result = await getCollectionQuotes(1);

      expect(mockGetCollectionQuotesExecute).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
    });

    it("should return empty array for collection with no quotes", async () => {
      mockGetCollectionQuotesExecute.mockResolvedValue({
        quotes: [],
        total: 0,
      });

      const result = await getCollectionQuotes(999);

      expect(result).toHaveLength(0);
    });
  });
});
