import { Character } from "@/core/domain/entities";

/**
 * Character Repository Interface (Port)
 * Defines the contract for character data access
 * Infrastructure layer implements this interface
 */
export interface CharacterRepository {
  /**
   * Find all characters with optional limit
   */
  findAll(limit?: number): Promise<Character[]>;

  /**
   * Find a character by ID
   */
  findById(id: number): Promise<Character | null>;

  /**
   * Find featured characters (main Simpson family)
   */
  findFeatured(): Promise<Character[]>;

  /**
   * Find character names for dropdown/autocomplete
   */
  findNames(): Promise<
    Array<{ id: number; name: string; imageUrl: string | null }>
  >;

  /**
   * Check if user is following a character
   */
  isFollowing(userId: string, characterId: number): Promise<boolean>;

  /**
   * Get follower count for a character
   */
  getFollowerCount(characterId: number): Promise<number>;
}
