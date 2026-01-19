/**
 * Tests for Trivia Server Actions
 * @module trivia.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/__mocks__/prisma";
import { mockGetCurrentUser } from "@/__mocks__/auth";
import { createMockUser, createMockTriviaFact } from "@/__tests__/factories";

// Import after mocks are setup
import { submitTrivia, getTrivia } from "./trivia";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Trivia Server Actions", () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitTrivia", () => {
    it("should submit character trivia", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.triviaFact.create.mockResolvedValue(
        createMockTriviaFact({
          relatedEntityType: "CHARACTER",
          relatedEntityId: 1,
          content: "Homer's middle name is Jay",
          submittedByUserId: mockUser.id,
        }),
      );

      const result = await submitTrivia(
        "CHARACTER",
        1,
        "Homer's middle name is Jay",
      );

      expect(prismaMock.triviaFact.create).toHaveBeenCalledWith({
        data: {
          relatedEntityType: "CHARACTER",
          relatedEntityId: 1,
          content: "Homer's middle name is Jay",
          submittedByUserId: mockUser.id,
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("should submit episode trivia", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.triviaFact.create.mockResolvedValue(
        createMockTriviaFact({
          relatedEntityType: "EPISODE",
          relatedEntityId: 1,
          content: "First episode aired December 17, 1989",
          submittedByUserId: mockUser.id,
        }),
      );

      const result = await submitTrivia(
        "EPISODE",
        1,
        "First episode aired December 17, 1989",
      );

      expect(prismaMock.triviaFact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          relatedEntityType: "EPISODE",
        }),
      });
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        submitTrivia("CHARACTER", 1, "Some trivia fact"),
      ).rejects.toThrow("Unauthorized");
    });

    it("should validate trivia minimum length (10)", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await expect(submitTrivia("CHARACTER", 1, "Short")).rejects.toThrow();
    });

    it("should validate trivia maximum length (1000)", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      const longTrivia = "a".repeat(1001);

      await expect(submitTrivia("CHARACTER", 1, longTrivia)).rejects.toThrow();
    });

    it("should validate entity type enum", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await expect(
        submitTrivia("INVALID" as any, 1, "Some trivia content here"),
      ).rejects.toThrow();
    });

    it("should validate entity ID is positive", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await expect(
        submitTrivia("CHARACTER", -1, "Some trivia content here"),
      ).rejects.toThrow();

      await expect(
        submitTrivia("CHARACTER", 0, "Some trivia content here"),
      ).rejects.toThrow();
    });

    it("should handle database errors", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.triviaFact.create.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        submitTrivia("CHARACTER", 1, "Some trivia content here"),
      ).rejects.toThrow("Failed to submit trivia");
    });
  });

  describe("getTrivia", () => {
    it("should return trivia for a character", async () => {
      const mockTrivia = [
        {
          id: 1,
          relatedEntityType: "CHARACTER",
          relatedEntityId: 1,
          content: "Fact 1",
          submittedByUserId: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { username: "user1", name: "User One" },
        },
        {
          id: 2,
          relatedEntityType: "CHARACTER",
          relatedEntityId: 1,
          content: "Fact 2",
          submittedByUserId: "other-user",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { username: "user2", name: "User Two" },
        },
      ];

      prismaMock.triviaFact.findMany.mockResolvedValue(mockTrivia as any);

      const result = await getTrivia("CHARACTER", 1);

      expect(prismaMock.triviaFact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            relatedEntityType: "CHARACTER",
            relatedEntityId: 1,
          },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it("should return trivia for an episode", async () => {
      const mockTrivia = [
        {
          id: 1,
          relatedEntityType: "EPISODE",
          relatedEntityId: 5,
          content: "Episode fact",
          submittedByUserId: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { username: "user1", name: "User One" },
        },
      ];

      prismaMock.triviaFact.findMany.mockResolvedValue(mockTrivia as any);

      const result = await getTrivia("EPISODE", 5);

      expect(prismaMock.triviaFact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            relatedEntityType: "EPISODE",
            relatedEntityId: 5,
          },
        }),
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no trivia exists", async () => {
      prismaMock.triviaFact.findMany.mockResolvedValue([]);

      const result = await getTrivia("CHARACTER", 999);

      expect(result).toHaveLength(0);
    });
  });
});
