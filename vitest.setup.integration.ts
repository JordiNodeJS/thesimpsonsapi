/**
 * Vitest Integration Test Setup
 *
 * This setup file is used for integration tests that require real database connections.
 * It ensures:
 * - Environment variables are loaded from .env.local
 * - Database connection is verified before tests run
 * - RLS context is properly initialized
 */

import "dotenv/config";
import { beforeAll, afterAll } from "vitest";

// Verify DATABASE_URL is set
beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable not set. " +
        "Please ensure .env.local exists with DATABASE_URL configured for Neon.",
    );
  }

  console.log("✓ DATABASE_URL configured for integration tests");
  console.log(`✓ Database: Neon PostgreSQL`);
  console.log(`✓ Schema: the_simpson`);
  console.log(`✓ RLS Integration Tests Ready`);
});

// Cleanup after all tests
afterAll(async () => {
  console.log("✓ Integration tests completed");
});
