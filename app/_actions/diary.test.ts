/**
 * Tests for Diary Server Actions
 * @module diary.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/__mocks__/prisma";
import { mockGetCurrentUser } from "@/__mocks__/auth";
import {
  createMockUser,
  createMockDiaryEntry,
  createMockLocation,
} from "@/__tests__/factories";

// Import after mocks are setup
import { createDiaryEntry, getDiaryEntries, deleteDiaryEntry } from "./diary";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Diary Server Actions", () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDiaryEntry", () => {
    it("should create a diary entry when authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.diaryEntry.create.mockResolvedValue(
        createMockDiaryEntry({ userId: mockUser.id }),
      );

      const result = await createDiaryEntry(1, 1, "Had a great time at Moe's");

      expect(prismaMock.diaryEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          characterId: 1,
          locationId: 1,
          activityDescription: "Had a great time at Moe's",
        }),
      });
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
      // getCurrentUser throws when not authenticated
      mockGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

      await expect(createDiaryEntry(1, 1, "Test entry")).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("should validate required fields with Zod", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      // Empty description should fail
      await expect(createDiaryEntry(1, 1, "")).rejects.toThrow();

      // Invalid characterId should fail
      await expect(createDiaryEntry(-1, 1, "Test")).rejects.toThrow();

      // Invalid locationId should fail
      await expect(createDiaryEntry(1, 0, "Test")).rejects.toThrow();
    });

    it("should handle database errors gracefully", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.diaryEntry.create.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(createDiaryEntry(1, 1, "Test entry")).rejects.toThrow(
        "Failed to create diary entry",
      );
    });
  });

  describe("getDiaryEntries", () => {
    it("should return diary entries for authenticated user", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockEntries = [
        createMockDiaryEntry({ id: 1, userId: mockUser.id }),
        createMockDiaryEntry({ id: 2, userId: mockUser.id }),
      ];

      prismaMock.diaryEntry.findMany.mockResolvedValue(
        mockEntries.map((e) => ({
          ...e,
          character: { name: "Homer Simpson" },
          location: { name: "Moe's Tavern" },
        })) as any,
      );

      const result = await getDiaryEntries();

      expect(prismaMock.diaryEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it("should throw error when not authenticated", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

      await expect(getDiaryEntries()).rejects.toThrow("Unauthorized");
    });
  });

  describe("deleteDiaryEntry", () => {
    it("should delete user's own diary entry", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.diaryEntry.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteDiaryEntry(1);

      expect(prismaMock.diaryEntry.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("should throw error when entry not found", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.diaryEntry.deleteMany.mockResolvedValue({ count: 0 });

      await expect(deleteDiaryEntry(999)).rejects.toThrow(
        "Entry not found or you don't have permission to delete it",
      );
    });

    it("should prevent deletion of other user's entries", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      prismaMock.diaryEntry.deleteMany.mockResolvedValue({ count: 0 });

      await expect(deleteDiaryEntry(1)).rejects.toThrow();
    });

    it("should validate entry ID with Zod", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await expect(deleteDiaryEntry(-1)).rejects.toThrow();
      await expect(deleteDiaryEntry(0)).rejects.toThrow();
    });
  });
});
