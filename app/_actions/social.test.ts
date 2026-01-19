/**
 * Tests for Social Server Actions (Clean Architecture)
 * @module social.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockGetCurrentUserOptional } from "@/__mocks__/auth";
import { createMockUser } from "@/__tests__/factories";
import {
  mockToggleFollowExecute,
  mockPostCommentExecute,
  mockGetCharacterDetailsExecute,
  mockCharacterRepoIsFollowing,
  resetAllMocks,
} from "@/__mocks__/infrastructure/factories/UseCaseFactory";

// Import after mocks are setup
import { toggleFollow, isFollowing, postComment, getComments } from "./social";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Social Server Actions", () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();
    resetAllMocks();
  });

  describe("toggleFollow", () => {
    it("should follow a character when not currently following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockToggleFollowExecute.mockResolvedValue({ isFollowing: true });

      const result = await toggleFollow(1);

      expect(mockToggleFollowExecute).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual({ success: true, isFollowing: true });
    });

    it("should unfollow a character when currently following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockToggleFollowExecute.mockResolvedValue({ isFollowing: false });

      const result = await toggleFollow(1);

      expect(mockToggleFollowExecute).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual({ success: true, isFollowing: false });
    });

    it("should return error when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

      const result = await toggleFollow(1);

      expect(result).toEqual({
        success: false,
        error: "Please log in to follow characters",
      });
    });

    it("should validate character ID", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);

      await expect(toggleFollow(-1)).rejects.toThrow();
      await expect(toggleFollow(0)).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockToggleFollowExecute.mockRejectedValue(new Error("Database error"));

      const result = await toggleFollow(1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("isFollowing", () => {
    it("should return true when user is following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockCharacterRepoIsFollowing.mockResolvedValue(true);

      const result = await isFollowing(1);

      expect(result).toBe(true);
    });

    it("should return false when user is not following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockCharacterRepoIsFollowing.mockResolvedValue(false);

      const result = await isFollowing(1);

      expect(result).toBe(false);
    });

    it("should return false when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

      const result = await isFollowing(1);

      expect(result).toBe(false);
    });
  });

  describe("postComment", () => {
    it("should create a comment for authenticated user", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockPostCommentExecute.mockResolvedValue({ success: true });

      const result = await postComment(1, "Great character!");

      expect(mockPostCommentExecute).toHaveBeenCalledWith(
        { characterId: 1, content: "Great character!" },
        mockUser.id,
        expect.any(String)
      );
      expect(result).toEqual({ success: true });
    });

    it("should return error when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

      const result = await postComment(1, "Test comment");

      expect(result).toEqual({
        success: false,
        error: "Please log in to post comments",
      });
    });

    it("should validate empty content", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);

      await expect(postComment(1, "")).rejects.toThrow();
    });

    it("should validate content length (max 1000)", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      const longContent = "a".repeat(1001);

      await expect(postComment(1, longContent)).rejects.toThrow();
    });

    it("should validate character ID", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);

      await expect(postComment(-1, "Test")).rejects.toThrow();
      await expect(postComment(0, "Test")).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      mockPostCommentExecute.mockRejectedValue(new Error("Database error"));

      const result = await postComment(1, "Test");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getComments", () => {
    it("should return comments for a character", async () => {
      mockGetCharacterDetailsExecute.mockResolvedValue({
        character: { id: 1, name: "Homer" },
        comments: [
          { id: 1, userId: mockUser.id, characterId: 1, content: "Comment 1", username: "user1", createdAt: null },
          { id: 2, userId: "other", characterId: 1, content: "Comment 2", username: "user2", createdAt: null },
        ],
        social: { isFollowing: false, followerCount: 0 },
      });

      const result = await getComments(1);

      expect(mockGetCharacterDetailsExecute).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no comments exist", async () => {
      mockGetCharacterDetailsExecute.mockResolvedValue({
        character: { id: 999, name: "Unknown" },
        comments: [],
        social: { isFollowing: false, followerCount: 0 },
      });

      const result = await getComments(999);

      expect(result).toHaveLength(0);
    });
  });
});
