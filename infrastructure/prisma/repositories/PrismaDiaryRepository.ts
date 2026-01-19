import {
  DiaryRepository,
  LocationRepository,
} from "@/core/application/ports/repositories";
import { DiaryEntry, Location } from "@/core/domain/entities";
import { prisma } from "@/app/_lib/prisma";
import { DiaryEntryMapper, LocationMapper } from "../mappers";

/**
 * Prisma implementation of DiaryRepository
 */
export class PrismaDiaryRepository implements DiaryRepository {
  async findByUser(userId: string): Promise<DiaryEntry[]> {
    const records = await prisma.diaryEntry.findMany({
      where: { userId },
      include: {
        character: {
          select: { name: true },
        },
        location: {
          select: { name: true },
        },
      },
      orderBy: { entryDate: "desc" },
    });

    return records.map(DiaryEntryMapper.toDomain);
  }

  async findById(id: number): Promise<DiaryEntry | null> {
    const record = await prisma.diaryEntry.findUnique({
      where: { id },
      include: {
        character: {
          select: { name: true },
        },
        location: {
          select: { name: true },
        },
      },
    });

    return record ? DiaryEntryMapper.toDomain(record) : null;
  }

  async create(entry: DiaryEntry): Promise<DiaryEntry> {
    const data = DiaryEntryMapper.toCreateData(entry);

    const record = await prisma.diaryEntry.create({
      data,
      include: {
        character: {
          select: { name: true },
        },
        location: {
          select: { name: true },
        },
      },
    });

    return DiaryEntryMapper.toDomain(record);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const result = await prisma.diaryEntry.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return result.count > 0;
  }
}

/**
 * Prisma implementation of LocationRepository
 */
export class PrismaLocationRepository implements LocationRepository {
  async findAll(): Promise<Location[]> {
    const records = await prisma.location.findMany({
      orderBy: { name: "asc" },
    });

    return records.map(LocationMapper.toDomain);
  }

  async findById(id: number): Promise<Location | null> {
    const record = await prisma.location.findUnique({
      where: { id },
    });

    return record ? LocationMapper.toDomain(record) : null;
  }
}
