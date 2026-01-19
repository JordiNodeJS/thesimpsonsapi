import { Comment, CharacterFollow } from "@/core/domain/entities";

/**
 * Comment Repository Interface (Port)
 * Defines the contract for comment and follow data access
 */
export interface CommentRepository {
  /**
   * Find comments for a character
   */
  findByCharacter(characterId: number): Promise<Comment[]>;

  /**
   * Create a new comment
   */
  create(comment: Comment): Promise<Comment>;

  /**
   * Delete a comment by ID and user
   */
  delete(id: number, userId: string): Promise<boolean>;
}

/**
 * Follow Repository Interface (Port)
 * Defines the contract for character follow data access
 */
export interface FollowRepository {
  /**
   * Check if a user is following a character
   */
  isFollowing(userId: string, characterId: number): Promise<boolean>;

  /**
   * Create a follow relationship
   */
  create(follow: CharacterFollow): Promise<void>;

  /**
   * Delete a follow relationship
   */
  delete(userId: string, characterId: number): Promise<void>;

  /**
   * Get all characters followed by a user
   */
  findByUser(userId: string): Promise<CharacterFollow[]>;
}
