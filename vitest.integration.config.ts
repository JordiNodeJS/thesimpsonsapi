/**
 * Vitest Integration Test Configuration
 *
 * This configuration is specifically for integration tests that require:
 * - Node.js environment (not jsdom)
 * - Real database connection (Neon PostgreSQL)
 * - Environment variables from .env.local
 *
 * Usage: pnpm vitest run -c vitest.integration.config.ts
 * Or add to package.json: "test:integration": "vitest run -c vitest.integration.config.ts"
 */

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node", // Use Node.js environment for database access
    globals: true,
    setupFiles: ["./vitest.setup.integration.ts"],
    include: ["**/*.integration.test.ts", "**/*-integration.test.ts"],
    exclude: ["node_modules", ".next", "e2e/**", ".traces/**", "scripts/**"],
    testTimeout: 30000, // Increase timeout for database operations
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types.ts",
        ".traces/**",
        "scripts/**",
        "prisma/**",
        "public/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
