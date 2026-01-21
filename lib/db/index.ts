/**
 * Database Layer - Prisma Client & Utilities
 *
 * This module exports all database-related functionality:
 * - Prisma client singleton
 * - RLS (Row Level Security) helpers
 * - Repository functions for data access
 */

export { prisma } from "./prisma";
export {
  withRLS,
  withoutRLS,
  withAuthenticatedRLS,
  withOptionalRLS,
  type PrismaTransaction,
} from "./prisma-rls";
export * from "./repositories";
