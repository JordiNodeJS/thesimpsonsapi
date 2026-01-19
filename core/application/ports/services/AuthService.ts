import { User } from "@/core/domain/entities";

/**
 * Auth Service Interface (Port)
 * Defines the contract for authentication operations
 * Infrastructure layer implements this with Better Auth
 */
export interface AuthService {
  /**
   * Get the currently authenticated user (throws if not authenticated)
   */
  getCurrentUser(): Promise<User>;

  /**
   * Get the currently authenticated user (returns null if not authenticated)
   */
  getCurrentUserOptional(): Promise<User | null>;

  /**
   * Check if current session is authenticated
   */
  isAuthenticated(): Promise<boolean>;
}
