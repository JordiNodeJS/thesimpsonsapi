import { EpisodeRepository } from "@/core/application/ports/repositories";
import { Episode, EpisodeProgress } from "@/core/domain/entities";
import { prisma } from "@/app/_lib/prisma";
import { EpisodeMapper, EpisodeProgressMapper } from "../mappers";

/**
 * Prisma implementation of EpisodeRepository
 * Implements the port defined in the Application layer
 */
export class PrismaEpisodeRepository implements EpisodeRepository {
  async findAll(limit: number = 50): Promise<Episode[]> {
    const records = await prisma.episode.findMany({
      take: limit,
      orderBy: [{ season: "asc" }, { episodeNumber: "asc" }],
    });

    return records.map(EpisodeMapper.toDomain);
  }

  async findById(id: number): Promise<Episode | null> {
    const record = await prisma.episode.findUnique({
      where: { id },
    });

    return record ? EpisodeMapper.toDomain(record) : null;
  }

  async findBySeason(season: number): Promise<Episode[]> {
    const records = await prisma.episode.findMany({
      where: { season },
      orderBy: { episodeNumber: "asc" },
    });

    return records.map(EpisodeMapper.toDomain);
  }

  async getProgress(
    userId: string,
    episodeId: number,
  ): Promise<EpisodeProgress | null> {
    const record = await prisma.userEpisodeProgress.findUnique({
      where: {
        userId_episodeId: {
          userId,
          episodeId,
        },
      },
    });

    return record ? EpisodeProgressMapper.toDomain(record) : null;
  }

  async saveProgress(progress: EpisodeProgress): Promise<void> {
    const data = EpisodeProgressMapper.toPersistence(progress);

    await prisma.userEpisodeProgress.upsert({
      where: {
        userId_episodeId: {
          userId: data.userId,
          episodeId: data.episodeId,
        },
      },
      update: {
        rating: data.rating,
        notes: data.notes,
        watchedAt: data.watchedAt,
      },
      create: {
        userId: data.userId,
        episodeId: data.episodeId,
        rating: data.rating,
        notes: data.notes,
        watchedAt: data.watchedAt,
      },
    });
  }

  async getAllProgress(userId: string): Promise<EpisodeProgress[]> {
    const records = await prisma.userEpisodeProgress.findMany({
      where: { userId },
    });

    return records.map(EpisodeProgressMapper.toDomain);
  }
}
