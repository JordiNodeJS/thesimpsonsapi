/**
 * Tests for Diary Server Actions (Clean Architecture)
 * @module diary.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockGetCurrentUser } from "@/__mocks__/auth";
import { createMockUser } from "@/__tests__/factories";
import {
  mockCreateDiaryEntryExecute,
  mockDeleteDiaryEntryExecute,
  mockListDiaryEntriesExecute,
  resetAllMocks,
} from "@/__mocks__/infrastructure/factories/UseCaseFactory";
import {
  AuthorizationException,
  NotFoundException,
} from "@/core/domain/exceptions";

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
    resetAllMocks();
  });

  describe("createDiaryEntry", () => {
    it("should create a diary entry when authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockCreateDiaryEntryExecute.mockResolvedValue({ success: true });

      const result = await createDiaryEntry(1, 1, "Had a great time at Moe's");

      expect(mockCreateDiaryEntryExecute).toHaveBeenCalledWith(
        {
          characterId: 1,
          locationId: 1,
          description: "Had a great time at Moe's",
        },
        mockUser.id,
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw error when not authenticated", async () => {
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
      mockCreateDiaryEntryExecute.mockRejectedValue(
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
      mockListDiaryEntriesExecute.mockResolvedValue({
        entries: [
          {
            id: 1,
            activityDescription: "Entry 1",
            characterName: "Homer",
            locationName: "Moe's",
            entryDate: null,
          },
          {
            id: 2,
            activityDescription: "Entry 2",
            characterName: "Bart",
            locationName: "School",
            entryDate: null,
          },
        ],
        total: 2,
      });

      const result = await getDiaryEntries();

      expect(mockListDiaryEntriesExecute).toHaveBeenCalledWith(mockUser.id);
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
      mockDeleteDiaryEntryExecute.mockResolvedValue({ success: true });

      const result = await deleteDiaryEntry(1);

      expect(mockDeleteDiaryEntryExecute).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual({ success: true });
    });

    it("should throw error when entry not found", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockDeleteDiaryEntryExecute.mockRejectedValue(
        new NotFoundException("DiaryEntry", 999),
      );

      await expect(deleteDiaryEntry(999)).rejects.toThrow("Entry not found");
    });

    it("should prevent deletion of other user's entries", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockDeleteDiaryEntryExecute.mockRejectedValue(
        new AuthorizationException("Not authorized"),
      );

      await expect(deleteDiaryEntry(1)).rejects.toThrow(
        "You don't have permission to delete this entry",
      );
    });

    it("should validate entry ID with Zod", async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await expect(deleteDiaryEntry(-1)).rejects.toThrow();
      await expect(deleteDiaryEntry(0)).rejects.toThrow();
    });
  });
});
