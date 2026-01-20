import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

// Create deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();
export const prisma = prismaMock;

// Mock $transaction to support RLS helpers
// This allows withRLS and other RLS helpers to work in tests
prismaMock.$transaction.mockImplementation(
  async (callback: (client: typeof prismaMock) => Promise<unknown>) => {
    // Create a mock transaction context that delegates to prismaMock
    const txMock = {
      ...prismaMock,
      $executeRaw: vi.fn().mockResolvedValue(1), // Mock SET LOCAL app.current_user_id
      $executeRawUnsafe: vi.fn().mockResolvedValue(1), // Mock raw SQL execution
      $queryRaw: vi.fn().mockResolvedValue([]), // Mock raw queries
      $queryRawUnsafe: vi.fn().mockResolvedValue([]), // Mock unsafe raw queries
    };

    // Execute callback with the transaction mock
    return callback(txMock as typeof prismaMock);
  },
);

// Add support for $executeRawUnsafe at the top level
// Note: These are set via Object.defineProperty to avoid type conflicts with Prisma's strict typing
Object.defineProperty(prismaMock, "$executeRawUnsafe", {
  value: vi.fn().mockResolvedValue(1),
  configurable: true,
});
Object.defineProperty(prismaMock, "$queryRawUnsafe", {
  value: vi.fn().mockResolvedValue([]),
  configurable: true,
});

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);

  // Re-setup $transaction mock after reset
  prismaMock.$transaction.mockImplementation(
    async (callback: (client: typeof prismaMock) => Promise<unknown>) => {
      const txMock = {
        ...prismaMock,
        $executeRaw: vi.fn().mockResolvedValue(1),
        $executeRawUnsafe: vi.fn().mockResolvedValue(1),
        $queryRaw: vi.fn().mockResolvedValue([]),
        $queryRawUnsafe: vi.fn().mockResolvedValue([]),
      };
      return callback(txMock as typeof prismaMock);
    },
  );

  // Re-setup raw query mocks
  Object.defineProperty(prismaMock, "$executeRawUnsafe", {
    value: vi.fn().mockResolvedValue(1),
    configurable: true,
  });
  Object.defineProperty(prismaMock, "$queryRawUnsafe", {
    value: vi.fn().mockResolvedValue([]),
    configurable: true,
  });
});
