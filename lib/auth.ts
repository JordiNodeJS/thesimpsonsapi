import { betterAuth } from "better-auth";
import { Pool, neonConfig } from "@neondatabase/serverless";

// Enable HTTP connection for Better Auth (same as main db config)
neonConfig.poolQueryViaFetch = true;

/**
 * Better Auth configuration for The Simpsons API
 *
 * Uses Neon PostgreSQL for session storage and user authentication.
 * Configured with email/password authentication initially.
 *
 * CRITICAL: Uses fully qualified table names (the_simpson.users)
 * because poolQueryViaFetch ignores search_path
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  user: {
    modelName: "the_simpson.users", // Fully qualified table name
  },
  session: {
    modelName: "the_simpson.session", // Fully qualified table name
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  account: {
    modelName: "the_simpson.account", // Fully qualified table name
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start simple, can enable later
    verificationTableName: "the_simpson.verification", // Fully qualified table name
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://thesimpson.webcode.es",
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),
});

/**
 * Type-safe session helper for server components and actions
 */
export type Session = typeof auth.$Infer.Session;
