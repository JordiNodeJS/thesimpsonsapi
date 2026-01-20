/**
 * Auth Module - Better Auth Integration
 *
 * This module provides ONLY server-side exports.
 * For client-side auth hooks, import directly from "@/lib/auth/client"
 *
 * IMPORTANT: This separation is necessary because:
 * - session.ts uses `next/headers` which only works in Server Components
 * - client.ts provides browser-safe auth utilities
 *
 * Usage:
 * - Server Components/Actions: import { auth, getCurrentUser } from "@/lib/auth"
 * - Client Components: import { authClient, useSession } from "@/lib/auth/client"
 */

// Server-side Better Auth configuration
export { auth, type Session } from "./server";

// Session helpers for Server Components and Actions
export {
  getCurrentUser,
  getCurrentUserOptional,
  type AuthenticatedUser,
} from "./session";
