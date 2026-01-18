/**
 * Tests for Episodes Server Actions
 * @module episodes.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/__mocks__/prisma";
import { mockGetCurrentUserOptional } from "@/__mocks__/auth";
import { createMockUser } from "@/__tests__/factories";

// Import after mocks are setup
import { trackEpisode, getEpisodeProgress } from "./episodes";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Episodes Server Actions", () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("trackEpisode", () => {
    it("should track episode for authenticated user", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.userEpisodeProgress.upsert.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        episodeId: 1,
        rating: 5,
        notes: "Great episode!",
        watchedAt: new Date(),
      });

      const result = await trackEpisode(1, 5, "Great episode!");

      expect(prismaMock.userEpisodeProgress.upsert).toHaveBeenCalledWith({
        where: {
          userId_episodeId: {
            userId: mockUser.id,
            episodeId: 1,
          },
        },
        update: expect.objectContaining({
          rating: 5,
          notes: "Great episode!",
        }),
        create: expect.objectContaining({
          userId: mockUser.id,
          episodeId: 1,
          rating: 5,
          notes: "Great episode!",
        }),
      });
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

      await expect(trackEpisode(1, 5, "Notes")).rejects.toThrow(
        "Please log in to track episodes",
      );
    });

    it("should validate rating range (1-5)", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);

      // Rating too low
      await expect(trackEpisode(1, 0, "")).rejects.toThrow();

      // Rating too high
      await expect(trackEpisode(1, 6, "")).rejects.toThrow();
    });

    it("should validate episode ID is positive", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);

      await expect(trackEpisode(-1, 5, "")).rejects.toThrow();
      await expect(trackEpisode(0, 5, "")).rejects.toThrow();
    });

    it("should handle empty notes", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.userEpisodeProgress.upsert.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        episodeId: 1,
        rating: 4,
        notes: "",
        watchedAt: new Date(),
      });

      const result = await trackEpisode(1, 4, "");

      expect(prismaMock.userEpisodeProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            notes: "",
          }),
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it("should update existing progress", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.userEpisodeProgress.upsert.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        episodeId: 1,
        rating: 3,
        notes: "Updated notes",
        watchedAt: new Date(),
      });

      const result = await trackEpisode(1, 3, "Updated notes");

      expect(prismaMock.userEpisodeProgress.upsert).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should handle database errors gracefully", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.userEpisodeProgress.upsert.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(trackEpisode(1, 5, "Notes")).rejects.toThrow(
        "Failed to track episode",
      );
    });
  });

  describe("getEpisodeProgress", () => {
    it("should return progress for authenticated user", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      const mockProgress = {
        id: 1,
        userId: mockUser.id,
        episodeId: 1,
        rating: 4,
        notes: "Good episode",
        watchedAt: new Date(),
      };
      prismaMock.userEpisodeProgress.findUnique.mockResolvedValue(mockProgress);

      const result = await getEpisodeProgress(1);

      expect(prismaMock.userEpisodeProgress.findUnique).toHaveBeenCalledWith({
        where: {
          userId_episodeId: {
            userId: mockUser.id,
            episodeId: 1,
          },
        },
      });
      expect(result).toEqual(mockProgress);
    });

    it("should return null when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

      const result = await getEpisodeProgress(1);

      expect(result).toBeNull();
      expect(prismaMock.userEpisodeProgress.findUnique).not.toHaveBeenCalled();
    });

    it("should return null when no progress exists", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.userEpisodeProgress.findUnique.mockResolvedValue(null);

      const result = await getEpisodeProgress(999);

      expect(result).toBeNull();
    });
  });
});
