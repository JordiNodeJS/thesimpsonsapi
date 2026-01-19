import { Comment, CommentData, CharacterFollow, CharacterFollowData } from "@/core/domain/entities";

type PrismaComment = {
  id: number;
  userId: string | null;
  characterId: number | null;
  content: string;
  createdAt: Date | null;
  user?: {
    username: string | null;
    name: string | null;
  } | null;
};

type PrismaCharacterFollow = {
  userId: string;
  characterId: number;
  createdAt: Date | null;
};

/**
 * Comment Mapper
 * Converts between Prisma models and Domain entities
 */
export class CommentMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaComment): Comment {
    return Comment.create({
      id: record.id,
      userId: record.userId,
      characterId: record.characterId,
      content: record.content,
      createdAt: record.createdAt,
      username: record.user?.username || record.user?.name || "Anonymous",
    });
  }

  /**
   * Maps Domain entity to persistence data (for creation)
   */
  static toCreateData(comment: Comment): {
    userId: string | null;
    characterId: number | null;
    content: string;
  } {
    return {
      userId: comment.userId,
      characterId: comment.characterId,
      content: comment.content,
    };
  }
}

/**
 * Character Follow Mapper
 * Converts between Prisma models and Domain entities
 */
export class FollowMapper {
  /**
   * Maps Prisma model to Domain entity
   */
  static toDomain(record: PrismaCharacterFollow): CharacterFollow {
    return CharacterFollow.create({
      userId: record.userId,
      characterId: record.characterId,
      createdAt: record.createdAt,
    });
  }

  /**
   * Maps Domain entity to persistence data
   */
  static toPersistence(follow: CharacterFollow): PrismaCharacterFollow {
    return {
      userId: follow.userId,
      characterId: follow.characterId,
      createdAt: follow.createdAt,
    };
  }
}
