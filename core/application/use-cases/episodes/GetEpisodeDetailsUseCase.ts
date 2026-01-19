import { Episode, EpisodeProgress } from "@/core/domain/entities";
import { EpisodeRepository } from "@/core/application/ports/repositories";
import { NotFoundException } from "@/core/domain/exceptions";

/**
 * Output DTO for GetEpisodeDetailsUseCase
 * Progress includes episodeId and userId for component compatibility
 */
export interface EpisodeDetailsOutput {
  episode: {
    id: number;
    title: string;
    season: number;
    episodeNumber: number;
    episodeCode: string;
    synopsis: string | null;
    imageUrl: string | null;
    isGoldenEra: boolean;
  };
  userProgress: {
    episodeId: number;
    userId: string;
    rating: number | null;
    notes: string | null;
    watchedAt: Date | null;
  } | null;
}

/**
 * Use Case: Get Episode Details
 * Retrieves episode information with optional user progress
 */
export class GetEpisodeDetailsUseCase {
  constructor(private episodeRepository: EpisodeRepository) {}

  async execute(
    episodeId: number,
    userId?: string,
  ): Promise<EpisodeDetailsOutput> {
    // 1. Get episode
    const episode = await this.episodeRepository.findById(episodeId);
    if (!episode) {
      throw new NotFoundException("Episode", episodeId);
    }

    // 2. Get user progress if authenticated
    let userProgress = null;
    if (userId) {
      const progress = await this.episodeRepository.getProgress(
        userId,
        episodeId,
      );
      if (progress) {
        userProgress = {
          episodeId: progress.episodeId,
          userId: progress.userId,
          rating: progress.rating,
          notes: progress.notes,
          watchedAt: progress.watchedAt,
        };
      }
    }

    // 3. Return enriched data
    return {
      episode: {
        id: episode.id,
        title: episode.title,
        season: episode.season,
        episodeNumber: episode.episodeNumber,
        episodeCode: episode.getEpisodeCode(),
        synopsis: episode.synopsis,
        imageUrl: episode.imageUrl,
        isGoldenEra: episode.isGoldenEra(),
      },
      userProgress,
    };
  }
}
