/**
 * Tests for Trivia Server Actions (Clean Architecture)
 * @module trivia.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mockGetCurrentUser,
  mockGetCurrentUserOptional,
} from "@/__mocks__/auth";
import { createMockUser } from "@/__tests__/factories";
import {
  mockSubmitTriviaExecute,
  mockListTriviaExecute,
  resetAllMocks,
} from "@/__mocks__/infrastructure/factories/UseCaseFactory";

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
    resetAllMocks();
  });

  describe("submitTrivia", () => {
    it("should submit character trivia", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockSubmitTriviaExecute.mockResolvedValue({
        success: true,
        trivia: {
          id: 1,
          content: "Homer's middle name is Jay",
          entityType: "CHARACTER",
          entityId: 1,
        },
      });

      const result = await submitTrivia(
        "CHARACTER",
        1,
        "Homer's middle name is Jay",
      );

      expect(mockSubmitTriviaExecute).toHaveBeenCalledWith(
        {
          entityType: "CHARACTER",
          entityId: 1,
          content: "Homer's middle name is Jay",
        },
        mockUser.id,
        expect.any(String),
      );
      expect(result).toEqual({ success: true });
    });

    it("should submit episode trivia", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockSubmitTriviaExecute.mockResolvedValue({
        success: true,
        trivia: {
          id: 1,
          content: "First episode aired December 17, 1989",
          entityType: "EPISODE",
          entityId: 1,
        },
      });

      const result = await submitTrivia(
        "EPISODE",
        1,
        "First episode aired December 17, 1989",
      );

      expect(mockSubmitTriviaExecute).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: "EPISODE" }),
        mockUser.id,
        expect.any(String),
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUserOptional.mockResolvedValue(null);

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

      // Test: Invalid entity type should be caught by Zod validation
      await expect(
        submitTrivia(
          "INVALID" as "CHARACTER" | "EPISODE",
          1,
          "Some trivia content here",
        ),
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
      mockSubmitTriviaExecute.mockRejectedValue(new Error("Database error"));

      await expect(
        submitTrivia("CHARACTER", 1, "Some trivia content here"),
      ).rejects.toThrow("Failed to submit trivia");
    });
  });

  describe("getTrivia", () => {
    it("should return trivia for a character", async () => {
      mockListTriviaExecute.mockResolvedValue({
        trivia: [
          { id: 1, content: "Fact 1", username: "user1", createdAt: null },
          { id: 2, content: "Fact 2", username: "user2", createdAt: null },
        ],
        total: 2,
      });

      const result = await getTrivia("CHARACTER", 1);

      expect(mockListTriviaExecute).toHaveBeenCalledWith("CHARACTER", 1);
      expect(result).toHaveLength(2);
    });

    it("should return trivia for an episode", async () => {
      mockListTriviaExecute.mockResolvedValue({
        trivia: [
          {
            id: 1,
            content: "Episode fact",
            username: "user1",
            createdAt: null,
          },
        ],
        total: 1,
      });

      const result = await getTrivia("EPISODE", 5);

      expect(mockListTriviaExecute).toHaveBeenCalledWith("EPISODE", 5);
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no trivia exists", async () => {
      mockListTriviaExecute.mockResolvedValue({
        trivia: [],
        total: 0,
      });

      const result = await getTrivia("CHARACTER", 999);

      expect(result).toHaveLength(0);
    });
  });
});
