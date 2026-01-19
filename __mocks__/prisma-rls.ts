/**
 * Mock for Prisma RLS helpers
 * Used in unit tests to simulate RLS behavior without database connection
 */

import { vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  mockUser,
  mockGetCurrentUser,
  mockGetCurrentUserOptional,
} from "./auth";

// Type for Prisma transaction
export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Mock implementation of withAuthenticatedRLS
 * Simulates authentication and RLS context setup
 * Throws error if user is not authenticated
 */
export const withAuthenticatedRLS = vi.fn(
  async <T>(
    prisma: PrismaClient,
    callback: (
      tx: PrismaTransaction,
      user: { id: string; email: string },
    ) => Promise<T>,
  ): Promise<T> => {
    // Try to get the mock user from auth
    // Use mockGetCurrentUserOptional to support both authenticated and unauthenticated tests
    const user = await mockGetCurrentUserOptional();

    // If no user, throw authentication error (simulates real behavior)
    if (!user) {
      throw new Error("Unauthorized - User not authenticated");
    }

    // Execute callback with mock transaction and user
    return callback(prisma as any, user);
  },
);

/**
 * Mock implementation of withOptionalRLS
 * Simulates optional authentication (user may or may not be present)
 */
export const withOptionalRLS = vi.fn(
  async <T>(
    prisma: PrismaClient,
    callback: (
      tx: PrismaTransaction,
      user: { id: string; email: string } | null,
    ) => Promise<T>,
  ): Promise<T> => {
    // Get the optional mock user from auth
    const user = await mockGetCurrentUserOptional();

    // Execute callback with mock transaction and user (or null)
    return callback(prisma as any, user);
  },
);

/**
 * Mock implementation of withoutRLS
 * Simulates public operations without authentication
 */
export const withoutRLS = vi.fn(
  async <T>(
    prisma: PrismaClient,
    callback: (tx: PrismaTransaction) => Promise<T>,
  ): Promise<T> => {
    // Execute callback with mock transaction (no user context)
    return callback(prisma as any);
  },
);

/**
 * Legacy withRLS mock (for backward compatibility)
 */
export const withRLS = vi.fn(
  async <T>(
    prisma: PrismaClient,
    userId: string,
    callback: (tx: PrismaTransaction) => Promise<T>,
  ): Promise<T> => {
    // Execute callback with mock transaction
    return callback(prisma as any);
  },
);
