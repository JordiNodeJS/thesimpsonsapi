import { Character } from "@/core/domain/entities";
import {
  CharacterRepository,
  CommentRepository,
  FollowRepository,
} from "@/core/application/ports/repositories";
import { NotFoundException } from "@/core/domain/exceptions";

/**
 * Output DTO for GetCharacterDetailsUseCase
 * Comments include all fields needed by CommentWithUser type
 */
export interface CharacterDetailsOutput {
  character: {
    id: number;
    name: string;
    occupation: string | null;
    imageUrl: string | null;
    isMainCharacter: boolean;
  };
  comments: Array<{
    id: number;
    userId: string | null;
    characterId: number | null;
    content: string;
    username: string;
    createdAt: string | null;
  }>;
  social: {
    isFollowing: boolean;
    followerCount: number;
  };
}

/**
 * Use Case: Get Character Details
 * Retrieves character information with comments and follow status
 */
export class GetCharacterDetailsUseCase {
  constructor(
    private characterRepository: CharacterRepository,
    private commentRepository: CommentRepository,
    private followRepository: FollowRepository,
  ) {}

  async execute(
    characterId: number,
    userId?: string,
  ): Promise<CharacterDetailsOutput> {
    // 1. Get character
    const character = await this.characterRepository.findById(characterId);
    if (!character) {
      throw new NotFoundException("Character", characterId);
    }

    // 2. Get comments
    const comments = await this.commentRepository.findByCharacter(characterId);

    // 3. Get follow status and count
    let isFollowing = false;
    if (userId) {
      isFollowing = await this.followRepository.isFollowing(
        userId,
        characterId,
      );
    }
    const followerCount =
      await this.characterRepository.getFollowerCount(characterId);

    // 4. Return enriched data (comments include userId/characterId for CommentWithUser compatibility)
    return {
      character: {
        id: character.id,
        name: character.name,
        occupation: character.occupation,
        imageUrl: character.imageUrl,
        isMainCharacter: character.isMainCharacter(),
      },
      comments: comments.map((c) => ({
        id: c.id,
        userId: c.userId,
        characterId: c.characterId,
        content: c.content,
        username: c.username,
        createdAt: c.createdAt?.toISOString() ?? null,
      })),
      social: {
        isFollowing,
        followerCount,
      },
    };
  }
}
