import { Episode } from "@/core/domain/entities";
import { EpisodeRepository } from "@/core/application/ports/repositories";

/**
 * Output DTO for ListEpisodesUseCase
 */
export interface EpisodeListOutput {
  episodes: Array<{
    id: number;
    title: string;
    season: number;
    episodeNumber: number;
    episodeCode: string;
    synopsis: string | null;
    imageUrl: string | null;
  }>;
  total: number;
}

/**
 * Use Case: List Episodes
 * Retrieves a list of episodes
 */
export class ListEpisodesUseCase {
  constructor(private episodeRepository: EpisodeRepository) {}

  async execute(limit?: number): Promise<EpisodeListOutput> {
    const episodes = await this.episodeRepository.findAll(limit);

    return {
      episodes: episodes.map((ep) => ({
        id: ep.id,
        title: ep.title,
        season: ep.season,
        episodeNumber: ep.episodeNumber,
        episodeCode: ep.getEpisodeCode(),
        synopsis: ep.synopsis,
        imageUrl: ep.imageUrl,
      })),
      total: episodes.length,
    };
  }
}
