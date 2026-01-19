import { EpisodeProgress } from "@/core/domain/entities";
import { EpisodeRepository } from "@/core/application/ports/repositories";
import {
  AuthorizationException,
  NotFoundException,
} from "@/core/domain/exceptions";

/**
 * Input DTO for TrackEpisodeUseCase
 */
export interface TrackEpisodeInput {
  episodeId: number;
  rating: number;
  notes?: string;
}

/**
 * Output DTO for TrackEpisodeUseCase
 */
export interface TrackEpisodeOutput {
  success: boolean;
  episodeId: number;
  rating: number;
  notes: string | null;
}

/**
 * Use Case: Track Episode
 * Allows authenticated users to track and rate episodes
 */
export class TrackEpisodeUseCase {
  constructor(private episodeRepository: EpisodeRepository) {}

  async execute(
    input: TrackEpisodeInput,
    userId: string,
  ): Promise<TrackEpisodeOutput> {
    // 1. Validate episode exists
    const episode = await this.episodeRepository.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException("Episode", input.episodeId);
    }

    // 2. Create or update progress
    const progress = EpisodeProgress.create({
      userId,
      episodeId: input.episodeId,
      rating: input.rating,
      notes: input.notes ?? null,
      watchedAt: new Date(),
    });

    // 3. Save progress
    await this.episodeRepository.saveProgress(progress);

    // 4. Return result
    return {
      success: true,
      episodeId: progress.episodeId,
      rating: progress.rating!,
      notes: progress.notes,
    };
  }
}
