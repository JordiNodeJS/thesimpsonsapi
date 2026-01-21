import { auth } from "@/lib/auth/server";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth API route handler
 *
 * Handles all authentication endpoints:
 * - POST /api/auth/sign-up
 * - POST /api/auth/sign-in
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * And more...
 */
export const { POST, GET } = toNextJsHandler(auth);
