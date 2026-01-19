import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

// Create deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Mock the prisma module
vi.mock("@/app/_lib/prisma", () => ({
  prisma: prismaMock,
}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});
