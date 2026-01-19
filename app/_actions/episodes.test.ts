/**
 * Tests for Episodes Server Actions (Clean Architecture)
 * @module episodes.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockGetCurrentUserOptional } from "@/__mocks__/auth";
import { createMockUser } from "@/__tests__/factories";
import {
  mockTrackEpisodeExecute,
  mockGetEpisodeDetailsExecute,
  resetAllMocks,
} from "@/__mocks__/infrastructure/factories/UseCaseFactory";

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
    resetAllMocks();
  });

  describe("trackEpisode", () => {
    it("should track episode for authenticated user", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockTrackEpisodeExecute.mockResolvedValue({
        success: true,
        progress: {
          episodeId: 1,
          rating: 5,
          notes: "Great episode!",
          hasWatched: true,
        },
      });

      const result = await trackEpisode(1, 5, "Great episode!");

      expect(mockTrackEpisodeExecute).toHaveBeenCalledWith(
        { episodeId: 1, rating: 5, notes: "Great episode!" },
        mockUser.id
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

      await expect(trackEpisode(1, 5, "Notes")).rejects.toThrow(
        "Please log in to track episodes"
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
      mockTrackEpisodeExecute.mockResolvedValue({
        success: true,
        progress: {
          episodeId: 1,
          rating: 4,
          notes: "",
          hasWatched: true,
        },
      });

      const result = await trackEpisode(1, 4, "");

      expect(mockTrackEpisodeExecute).toHaveBeenCalledWith(
        expect.objectContaining({ notes: "" }),
        mockUser.id
      );
      expect(result).toEqual({ success: true });
    });

    it("should update existing progress", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockTrackEpisodeExecute.mockResolvedValue({
        success: true,
        progress: {
          episodeId: 1,
          rating: 3,
          notes: "Updated notes",
          hasWatched: true,
        },
      });

      const result = await trackEpisode(1, 3, "Updated notes");

      expect(mockTrackEpisodeExecute).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should handle database errors gracefully", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockTrackEpisodeExecute.mockRejectedValue(new Error("Database error"));

      await expect(trackEpisode(1, 5, "Notes")).rejects.toThrow(
        "Failed to track episode"
      );
    });
  });

  describe("getEpisodeProgress", () => {
    it("should return progress for authenticated user", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      const mockProgress = {
        episodeId: 1,
        userId: mockUser.id,
        rating: 4,
        notes: "Good episode",
        watchedAt: new Date(),
      };
      mockGetEpisodeDetailsExecute.mockResolvedValue({
        episode: { id: 1, title: "Test" },
        userProgress: mockProgress,
      });

      const result = await getEpisodeProgress(1);

      expect(mockGetEpisodeDetailsExecute).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual(mockProgress);
    });

    it("should return null when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);
      mockGetEpisodeDetailsExecute.mockResolvedValue({
        episode: { id: 1, title: "Test" },
        userProgress: null,
      });

      const result = await getEpisodeProgress(1);

      expect(result).toBeNull();
    });

    it("should return null when no progress exists", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockGetEpisodeDetailsExecute.mockResolvedValue({
        episode: { id: 1, title: "Test" },
        userProgress: null,
      });

      const result = await getEpisodeProgress(1);

      expect(result).toBeNull();
    });
  });
});
