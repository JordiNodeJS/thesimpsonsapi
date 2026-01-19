import { CommentRepository, FollowRepository } from "@/core/application/ports/repositories";
import { Comment, CharacterFollow } from "@/core/domain/entities";
import { prisma } from "@/app/_lib/prisma";
import { CommentMapper, FollowMapper } from "../mappers";

/**
 * Prisma implementation of CommentRepository
 */
export class PrismaCommentRepository implements CommentRepository {
  async findByCharacter(characterId: number): Promise<Comment[]> {
    const records = await prisma.characterComment.findMany({
      where: { characterId },
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map(CommentMapper.toDomain);
  }

  async create(comment: Comment): Promise<Comment> {
    const data = CommentMapper.toCreateData(comment);

    const record = await prisma.characterComment.create({
      data,
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    return CommentMapper.toDomain(record);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const result = await prisma.characterComment.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return result.count > 0;
  }
}

/**
 * Prisma implementation of FollowRepository
 */
export class PrismaFollowRepository implements FollowRepository {
  async isFollowing(userId: string, characterId: number): Promise<boolean> {
    const follow = await prisma.characterFollow.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId,
        },
      },
    });

    return follow !== null;
  }

  async create(follow: CharacterFollow): Promise<void> {
    await prisma.characterFollow.create({
      data: {
        userId: follow.userId,
        characterId: follow.characterId,
      },
    });
  }

  async delete(userId: string, characterId: number): Promise<void> {
    await prisma.characterFollow.delete({
      where: {
        userId_characterId: {
          userId,
          characterId,
        },
      },
    });
  }

  async findByUser(userId: string): Promise<CharacterFollow[]> {
    const records = await prisma.characterFollow.findMany({
      where: { userId },
    });

    return records.map(FollowMapper.toDomain);
  }
}
