import {
  Episode,
  EpisodeProgress,
  EpisodeData,
  EpisodeProgressData,
} from "@/core/domain/entities";

type PrismaEpisode = {
  id: number;
  externalId: number;
  title: string;
  season: number;
  episodeNumber: number;
  synopsis: string | null;
  imageUrl: string | null;
};

type PrismaEpisodeProgress = {
  userId: string;
  episodeId: number;
  rating: number | null;
  notes: string | null;
  watchedAt: Date | null;
};

/**
 * Episode Mapper
 * Converts between Prisma models and Domain entities
 */
export class EpisodeMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaEpisode): Episode {
    return Episode.create({
      id: record.id,
      externalId: record.externalId,
      title: record.title,
      season: record.season,
      episodeNumber: record.episodeNumber,
      synopsis: record.synopsis,
      imageUrl: record.imageUrl,
    });
  }

  /**
   * Maps Domain entity to persistence data
   */
  static toPersistence(episode: Episode): PrismaEpisode {
    return {
      id: episode.id,
      externalId: episode.externalId,
      title: episode.title,
      season: episode.season,
      episodeNumber: episode.episodeNumber,
      synopsis: episode.synopsis,
      imageUrl: episode.imageUrl,
    };
  }
}

/**
 * Episode Progress Mapper
 * Converts between Prisma models and Domain entities
 */
export class EpisodeProgressMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaEpisodeProgress): EpisodeProgress {
    return EpisodeProgress.create({
      userId: record.userId,
      episodeId: record.episodeId,
      rating: record.rating,
      notes: record.notes,
      watchedAt: record.watchedAt,
    });
  }

  /**
   * Maps Domain entity to persistence data
   */
  static toPersistence(progress: EpisodeProgress): PrismaEpisodeProgress {
    return {
      userId: progress.userId,
      episodeId: progress.episodeId,
      rating: progress.rating,
      notes: progress.notes,
      watchedAt: progress.watchedAt,
    };
  }
}
