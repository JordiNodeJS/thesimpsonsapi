/**
 * Tests for Social Server Actions (Follow & Comments)
 * @module social.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/__mocks__/prisma";
import { mockGetCurrentUserOptional } from "@/__mocks__/auth";
import {
  createMockUser,
  createMockCommentWithUser,
} from "@/__tests__/factories";

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
  });

  describe("toggleFollow", () => {
    it("should follow a character when not currently following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.characterFollow.findUnique.mockResolvedValue(null);
      prismaMock.characterFollow.create.mockResolvedValue({
        userId: mockUser.id,
        characterId: 1,
        createdAt: new Date(),
      });

      const result = await toggleFollow(1);

      expect(prismaMock.characterFollow.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          characterId: 1,
        },
      });
      expect(result).toEqual({ success: true, isFollowing: true });
    });

    it("should unfollow a character when currently following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.characterFollow.findUnique.mockResolvedValue({
        userId: mockUser.id,
        characterId: 1,
        createdAt: new Date(),
      });
      prismaMock.characterFollow.delete.mockResolvedValue({
        userId: mockUser.id,
        characterId: 1,
        createdAt: new Date(),
      });

      const result = await toggleFollow(1);

      expect(prismaMock.characterFollow.delete).toHaveBeenCalledWith({
        where: {
          userId_characterId: {
            userId: mockUser.id,
            characterId: 1,
          },
        },
      });
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
      prismaMock.characterFollow.findUnique.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await toggleFollow(1);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("isFollowing", () => {
    it("should return true when user is following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.characterFollow.findUnique.mockResolvedValue({
        userId: mockUser.id,
        characterId: 1,
        createdAt: new Date(),
      });

      const result = await isFollowing(1);

      expect(result).toBe(true);
    });

    it("should return false when user is not following", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(mockUser);
      prismaMock.characterFollow.findUnique.mockResolvedValue(null);

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
      prismaMock.characterComment.create.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        characterId: 1,
        content: "Great character!",
        createdAt: new Date(),
      });

      const result = await postComment(1, "Great character!");

      expect(prismaMock.characterComment.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          characterId: 1,
          content: "Great character!",
        },
      });
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
      prismaMock.characterComment.create.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await postComment(1, "Test");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getComments", () => {
    it("should return comments for a character", async () => {
      const mockComments = [
        {
          id: 1,
          userId: mockUser.id,
          characterId: 1,
          content: "Comment 1",
          createdAt: new Date(),
          user: { username: "user1", name: "User One" },
        },
        {
          id: 2,
          userId: "other-user",
          characterId: 1,
          content: "Comment 2",
          createdAt: new Date(),
          user: { username: "user2", name: "User Two" },
        },
      ];

      prismaMock.characterComment.findMany.mockResolvedValue(
        mockComments as any,
      );

      const result = await getComments(1);

      expect(prismaMock.characterComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { characterId: 1 },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no comments exist", async () => {
      prismaMock.characterComment.findMany.mockResolvedValue([]);

      const result = await getComments(999);

      expect(result).toHaveLength(0);
    });
  });
});
