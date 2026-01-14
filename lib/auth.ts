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
  user: {
    modelName: "users", // Use 'users' table instead of default 'user'
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start simple, can enable later
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
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
