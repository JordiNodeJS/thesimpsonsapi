import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

/**
 * Better Auth configuration for The Simpsons API
 *
 * Uses Neon PostgreSQL for session storage and user authentication.
 * Configured with email/password authentication initially.
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start simple, can enable later
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  advanced: {
    // Use custom schema instead of default 'auth' schema
    databaseSchema: "the_simpson",
  },
});

/**
 * Type-safe session helper for server components and actions
 */
export type Session = typeof auth.$Infer.Session;
