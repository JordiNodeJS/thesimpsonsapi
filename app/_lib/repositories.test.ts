/**
 * Tests for Repository Functions
 * @module repositories.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/__mocks__/prisma";
import {
  createMockCharacter,
  createMockEpisode,
  createMockLocation,
  createMockDiaryEntry,
  createMockTriviaFact,
  createMockCommentWithUser,
} from "@/__tests__/factories";

// Import after mocks are setup
import {
  findAllCharacters,
  findCharacterById,
  findFeaturedCharacters,
  findCharacterNames,
  findAllEpisodes,
  findEpisodeById,
  findAllLocations,
  findCommentsByCharacter,
  findTriviaByEntity,
  findLatestTrivia,
  findDiaryEntriesByUser,
  findEpisodeProgressByUser,
  findCollectionsByUser,
  findQuotesByCollection,
  isUserFollowingCharacter,
  getStats,
} from "./repositories";

describe("Repository Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Character Repositories", () => {
    describe("findAllCharacters", () => {
      it("should return all characters with default limit", async () => {
        const mockCharacters = [
          createMockCharacter({ id: 1, name: "Homer" }),
          createMockCharacter({ id: 2, name: "Marge" }),
        ];
        prismaMock.character.findMany.mockResolvedValue(mockCharacters);

        const result = await findAllCharacters();

        expect(prismaMock.character.findMany).toHaveBeenCalledWith({
          take: 50,
          orderBy: { id: "asc" },
        });
        expect(result).toHaveLength(2);
      });

      it("should respect custom limit", async () => {
        prismaMock.character.findMany.mockResolvedValue([]);

        await findAllCharacters(10);

        expect(prismaMock.character.findMany).toHaveBeenCalledWith({
          take: 10,
          orderBy: { id: "asc" },
        });
      });
    });

    describe("findCharacterById", () => {
      it("should return character when found", async () => {
        const mockCharacter = createMockCharacter({ id: 1 });
        prismaMock.character.findUnique.mockResolvedValue(mockCharacter);

        const result = await findCharacterById(1);

        expect(prismaMock.character.findUnique).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        expect(result).toEqual(mockCharacter);
      });

      it("should return null when not found", async () => {
        prismaMock.character.findUnique.mockResolvedValue(null);

        const result = await findCharacterById(999);

        expect(result).toBeNull();
      });
    });

    describe("findFeaturedCharacters", () => {
      it("should return Simpson family members", async () => {
        const familyMembers = [
          createMockCharacter({ id: 1, name: "Homer Simpson" }),
          createMockCharacter({ id: 2, name: "Marge Simpson" }),
          createMockCharacter({ id: 3, name: "Bart Simpson" }),
        ];
        prismaMock.character.findMany.mockResolvedValue(familyMembers);

        const result = await findFeaturedCharacters();

        expect(prismaMock.character.findMany).toHaveBeenCalledWith({
          where: {
            name: {
              in: [
                "Homer Simpson",
                "Marge Simpson",
                "Bart Simpson",
                "Lisa Simpson",
                "Maggie Simpson",
              ],
            },
          },
          take: 5,
        });
        expect(result).toHaveLength(3);
      });
    });

    describe("findCharacterNames", () => {
      it("should return character names ordered alphabetically", async () => {
        const mockNames = [
          {
            id: 3,
            name: "Bart Simpson",
            externalId: 3,
            occupation: null,
            imageUrl: null,
          },
          {
            id: 1,
            name: "Homer Simpson",
            externalId: 1,
            occupation: null,
            imageUrl: null,
          },
          {
            id: 2,
            name: "Marge Simpson",
            externalId: 2,
            occupation: null,
            imageUrl: null,
          },
        ];
        prismaMock.character.findMany.mockResolvedValue(mockNames);

        const result = await findCharacterNames();

        expect(prismaMock.character.findMany).toHaveBeenCalledWith({
          select: { id: true, name: true, imageUrl: true },
          orderBy: { name: "asc" },
        });
        expect(result).toHaveLength(3);
      });
    });
  });

  describe("Episode Repositories", () => {
    describe("findAllEpisodes", () => {
      it("should return episodes ordered by season and episode number", async () => {
        const mockEpisodes = [
          createMockEpisode({ id: 1, season: 1, episodeNumber: 1 }),
          createMockEpisode({ id: 2, season: 1, episodeNumber: 2 }),
        ];
        prismaMock.episode.findMany.mockResolvedValue(mockEpisodes);

        const result = await findAllEpisodes();

        expect(prismaMock.episode.findMany).toHaveBeenCalledWith({
          take: 50,
          orderBy: [{ season: "asc" }, { episodeNumber: "asc" }],
        });
        expect(result).toHaveLength(2);
      });
    });

    describe("findEpisodeById", () => {
      it("should return episode when found", async () => {
        const mockEpisode = createMockEpisode({ id: 1 });
        prismaMock.episode.findUnique.mockResolvedValue(mockEpisode);

        const result = await findEpisodeById(1);

        expect(result).toEqual(mockEpisode);
      });

      it("should return null when not found", async () => {
        prismaMock.episode.findUnique.mockResolvedValue(null);

        const result = await findEpisodeById(999);

        expect(result).toBeNull();
      });
    });
  });

  describe("Location Repositories", () => {
    describe("findAllLocations", () => {
      it("should return locations ordered by name", async () => {
        const mockLocations = [
          createMockLocation({ id: 1, name: "Kwik-E-Mart" }),
          createMockLocation({ id: 2, name: "Moe's Tavern" }),
        ];
        prismaMock.location.findMany.mockResolvedValue(mockLocations);

        const result = await findAllLocations();

        expect(prismaMock.location.findMany).toHaveBeenCalledWith({
          orderBy: { name: "asc" },
        });
        expect(result).toHaveLength(2);
      });
    });
  });

  describe("Comment Repositories", () => {
    describe("findCommentsByCharacter", () => {
      it("should return comments with user info", async () => {
        const mockComments = [
          {
            ...createMockCommentWithUser(),
            createdAt: new Date("2026-01-15"),
          },
        ];
        prismaMock.characterComment.findMany.mockResolvedValue(mockComments);

        const result = await findCommentsByCharacter(1);

        expect(prismaMock.characterComment.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { characterId: 1 },
            include: { user: { select: { username: true, name: true } } },
            orderBy: { createdAt: "desc" },
          }),
        );
        expect(result[0]).toHaveProperty("username");
      });

      it("should handle anonymous users", async () => {
        const mockComment = {
          id: 1,
          userId: null,
          characterId: 1,
          content: "Test",
          createdAt: new Date(),
          user: null,
        };
        prismaMock.characterComment.findMany.mockResolvedValue([mockComment]);

        const result = await findCommentsByCharacter(1);

        expect(result[0].username).toBe("Anonymous");
      });
    });
  });

  describe("Trivia Repositories", () => {
    describe("findTriviaByEntity", () => {
      it("should return trivia for character", async () => {
        const mockTrivia = [
          {
            ...createMockTriviaFact({ relatedEntityType: "CHARACTER" }),
            createdAt: new Date("2026-01-15"),
            user: { username: "testuser", name: "Test User" },
          },
        ];
        prismaMock.triviaFact.findMany.mockResolvedValue(mockTrivia);

        const result = await findTriviaByEntity("CHARACTER", 1);

        expect(prismaMock.triviaFact.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              relatedEntityType: "CHARACTER",
              relatedEntityId: 1,
            },
          }),
        );
        expect(result[0]).toHaveProperty("username");
      });

      it("should return trivia for episode", async () => {
        prismaMock.triviaFact.findMany.mockResolvedValue([]);

        await findTriviaByEntity("EPISODE", 5);

        expect(prismaMock.triviaFact.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              relatedEntityType: "EPISODE",
              relatedEntityId: 5,
            },
          }),
        );
      });
    });

    describe("findLatestTrivia", () => {
      it("should return latest trivia with default limit", async () => {
        prismaMock.triviaFact.findMany.mockResolvedValue([]);

        await findLatestTrivia();

        expect(prismaMock.triviaFact.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 3,
            orderBy: { createdAt: "desc" },
          }),
        );
      });

      it("should respect custom limit", async () => {
        prismaMock.triviaFact.findMany.mockResolvedValue([]);

        await findLatestTrivia(5);

        expect(prismaMock.triviaFact.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 5,
          }),
        );
      });
    });
  });

  describe("Diary Repositories", () => {
    describe("findDiaryEntriesByUser", () => {
      it("should return diary entries with relations", async () => {
        const mockEntries = [
          {
            ...createMockDiaryEntry(),
            entryDate: new Date("2026-01-15"),
            character: { name: "Homer Simpson" },
            location: { name: "Moe's Tavern" },
          },
        ];
        prismaMock.diaryEntry.findMany.mockResolvedValue(mockEntries);

        const result = await findDiaryEntriesByUser("user-123");

        expect(prismaMock.diaryEntry.findMany).toHaveBeenCalledWith({
          where: { userId: "user-123" },
          include: {
            character: { select: { name: true } },
            location: { select: { name: true } },
          },
          orderBy: [{ entryDate: "desc" }, { id: "desc" }],
        });
        expect(result[0]).toHaveProperty("characterName");
        expect(result[0]).toHaveProperty("locationName");
      });
    });
  });

  describe("Episode Progress Repositories", () => {
    describe("findEpisodeProgressByUser", () => {
      it("should return progress when exists", async () => {
        const mockProgress = {
          id: 1,
          userId: "user-123",
          episodeId: 1,
          rating: 5,
          notes: "Great!",
          watchedAt: new Date(),
        };
        prismaMock.userEpisodeProgress.findUnique.mockResolvedValue(
          mockProgress,
        );

        const result = await findEpisodeProgressByUser("user-123", 1);

        expect(prismaMock.userEpisodeProgress.findUnique).toHaveBeenCalledWith({
          where: {
            userId_episodeId: {
              userId: "user-123",
              episodeId: 1,
            },
          },
        });
        expect(result).toEqual(mockProgress);
      });

      it("should return null when no progress", async () => {
        prismaMock.userEpisodeProgress.findUnique.mockResolvedValue(null);

        const result = await findEpisodeProgressByUser("user-123", 999);

        expect(result).toBeNull();
      });
    });
  });

  describe("Collection Repositories", () => {
    describe("findCollectionsByUser", () => {
      it("should return user collections", async () => {
        const mockCollections = [
          {
            id: 2,
            userId: "user-123",
            name: "Collection 2",
            description: null,
          },
          {
            id: 1,
            userId: "user-123",
            name: "Collection 1",
            description: null,
          },
        ];
        prismaMock.quoteCollection.findMany.mockResolvedValue(mockCollections);

        const result = await findCollectionsByUser("user-123");

        expect(prismaMock.quoteCollection.findMany).toHaveBeenCalledWith({
          where: { userId: "user-123" },
          orderBy: { id: "desc" },
        });
        expect(result).toHaveLength(2);
      });
    });

    describe("findQuotesByCollection", () => {
      it("should return quotes for collection", async () => {
        const mockQuotes = [
          {
            id: 1,
            collectionId: 1,
            quoteText: "D'oh!",
            characterName: null,
            sourceEpisode: null,
          },
          {
            id: 2,
            collectionId: 1,
            quoteText: "Ay caramba!",
            characterName: null,
            sourceEpisode: null,
          },
        ];
        prismaMock.collectionQuote.findMany.mockResolvedValue(mockQuotes);

        const result = await findQuotesByCollection(1);

        expect(prismaMock.collectionQuote.findMany).toHaveBeenCalledWith({
          where: { collectionId: 1 },
          orderBy: { id: "desc" },
        });
        expect(result).toHaveLength(2);
      });
    });
  });

  describe("Social Repositories", () => {
    describe("isUserFollowingCharacter", () => {
      it("should return true when following", async () => {
        prismaMock.characterFollow.findUnique.mockResolvedValue({
          userId: "user-123",
          characterId: 1,
          createdAt: new Date(),
        });

        const result = await isUserFollowingCharacter("user-123", 1);

        expect(result).toBe(true);
      });

      it("should return false when not following", async () => {
        prismaMock.characterFollow.findUnique.mockResolvedValue(null);

        const result = await isUserFollowingCharacter("user-123", 1);

        expect(result).toBe(false);
      });
    });
  });

  describe("Stats Repositories", () => {
    describe("getStats", () => {
      it("should return aggregated stats", async () => {
        prismaMock.character.count.mockResolvedValue(100);
        prismaMock.episode.count.mockResolvedValue(700);
        prismaMock.triviaFact.count.mockResolvedValue(50);

        const result = await getStats();

        expect(result).toEqual({
          characters: 100,
          episodes: 700,
          trivia: 50,
        });
      });
    });
  });
});
