/**
 * Prisma Client Configuration for Neon Serverless PostgreSQL
 *
 * This configuration uses the Neon serverless driver adapter for optimal
 * performance in serverless environments like Vercel.
 *
 * Key features:
 * - Uses @prisma/adapter-neon for HTTP-based connections
 * - Singleton pattern to prevent multiple instances in development
 * - Optimized for serverless cold starts
 */

import { PrismaClient } from "@prisma/client";
import { neonConfig, type PoolConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Enable HTTP connection mode for better serverless compatibility
neonConfig.poolQueryViaFetch = true;

// Type for global Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a new Prisma client with Neon adapter
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  // Create Neon pool configuration (not an instance)
  const poolConfig: PoolConfig = { connectionString };

  // Create Neon adapter for Prisma
  const adapter = new PrismaNeon(poolConfig);

  // Create Prisma client with adapter
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/**
 * Singleton Prisma client instance
 * Prevents creating multiple connections in development with hot reload
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
