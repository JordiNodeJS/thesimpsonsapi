import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

// Create deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Mock $transaction to support RLS helpers
// This allows withRLS and other RLS helpers to work in tests
prismaMock.$transaction.mockImplementation(async (callback: any) => {
  // Create a mock transaction context that delegates to prismaMock
  const txMock = {
    ...prismaMock,
    $executeRaw: vi.fn().mockResolvedValue(1), // Mock SET LOCAL app.current_user_id
    $executeRawUnsafe: vi.fn().mockResolvedValue(1), // Mock raw SQL execution
    $queryRaw: vi.fn().mockResolvedValue([]), // Mock raw queries
    $queryRawUnsafe: vi.fn().mockResolvedValue([]), // Mock unsafe raw queries
  };

  // Execute callback with the transaction mock
  return callback(txMock);
});

// Add support for $executeRawUnsafe at the top level
(prismaMock as any).$executeRawUnsafe = vi.fn().mockResolvedValue(1);
(prismaMock as any).$queryRawUnsafe = vi.fn().mockResolvedValue([]);

// Mock the prisma module
vi.mock("@/app/_lib/prisma", () => ({
  prisma: prismaMock,
}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);

  // Re-setup $transaction mock after reset
  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    const txMock = {
      ...prismaMock,
      $executeRaw: vi.fn().mockResolvedValue(1),
      $executeRawUnsafe: vi.fn().mockResolvedValue(1),
      $queryRaw: vi.fn().mockResolvedValue([]),
      $queryRawUnsafe: vi.fn().mockResolvedValue([]),
    };
    return callback(txMock);
  });

  // Re-setup raw query mocks
  (prismaMock as any).$executeRawUnsafe = vi.fn().mockResolvedValue(1);
  (prismaMock as any).$queryRawUnsafe = vi.fn().mockResolvedValue([]);
});
