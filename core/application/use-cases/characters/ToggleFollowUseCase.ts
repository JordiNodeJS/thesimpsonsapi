import { CharacterFollow } from "@/core/domain/entities";
import {
  CharacterRepository,
  FollowRepository,
} from "@/core/application/ports/repositories";
import { NotFoundException } from "@/core/domain/exceptions";

/**
 * Output DTO for ToggleFollowUseCase
 */
export interface ToggleFollowOutput {
  success: boolean;
  isFollowing: boolean;
  characterId: number;
}

/**
 * Use Case: Toggle Follow Character
 * Allows authenticated users to follow/unfollow characters
 */
export class ToggleFollowUseCase {
  constructor(
    private characterRepository: CharacterRepository,
    private followRepository: FollowRepository,
  ) {}

  async execute(
    characterId: number,
    userId: string,
  ): Promise<ToggleFollowOutput> {
    // 1. Validate character exists
    const character = await this.characterRepository.findById(characterId);
    if (!character) {
      throw new NotFoundException("Character", characterId);
    }

    // 2. Check current follow status
    const isCurrentlyFollowing = await this.followRepository.isFollowing(
      userId,
      characterId,
    );

    // 3. Toggle follow status
    if (isCurrentlyFollowing) {
      await this.followRepository.delete(userId, characterId);
    } else {
      const follow = CharacterFollow.createNew(userId, characterId);
      await this.followRepository.create(follow);
    }

    // 4. Return result
    return {
      success: true,
      isFollowing: !isCurrentlyFollowing,
      characterId,
    };
  }
}
