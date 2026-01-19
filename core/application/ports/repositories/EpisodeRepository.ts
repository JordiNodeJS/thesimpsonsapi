import { Episode, EpisodeProgress } from "@/core/domain/entities";

/**
 * Episode Repository Interface (Port)
 * Defines the contract for episode data access
 * Infrastructure layer implements this interface
 */
export interface EpisodeRepository {
  /**
   * Find all episodes with optional limit
   */
  findAll(limit?: number): Promise<Episode[]>;

  /**
   * Find an episode by ID
   */
  findById(id: number): Promise<Episode | null>;

  /**
   * Find episodes by season
   */
  findBySeason(season: number): Promise<Episode[]>;

  /**
   * Get user's progress for an episode
   */
  getProgress(
    userId: string,
    episodeId: number,
  ): Promise<EpisodeProgress | null>;

  /**
   * Save user's progress for an episode (upsert)
   */
  saveProgress(progress: EpisodeProgress): Promise<void>;

  /**
   * Get all progress for a user
   */
  getAllProgress(userId: string): Promise<EpisodeProgress[]>;
}
