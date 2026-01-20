/**
 * Social Server Actions - HYBRID PATTERN
 *
 * 🎓 EDUCATIONAL NOTE: Mixed Simple + DDD Patterns
 * =================================================
 * This file shows BOTH patterns working together:
 *
 * SIMPLE PATTERN (Read operations):
 * - isFollowing → Direct repository call
 * - getComments → Simple data retrieval (see repositories.ts)
 *
 * FULL DDD PATTERN (Write operations):
 * - toggleFollow → Uses ToggleFollowUseCase
 *   • Business rule: one follow per user-character pair
 *   • Requires authentication
 *   • RLS protection
 *
 * - postComment → Uses PostCommentUseCase
 *   • Business rules: content validation, character exists
 *   • Username resolution
 *   • Requires authentication
 *
 * WHY THIS SPLIT?
 * Reading who you follow = simple boolean lookup
 * Toggling follow status = mutation with validation + auth
 *
 * See docs/ARCHITECTURE_DECISION_MATRIX.md for the decision guide.
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/app/_lib/prisma";
import {
  withAuthenticatedRLS,
  withOptionalRLS,
  withoutRLS,
} from "@/app/_lib/prisma-rls";
import { UseCaseFactory } from "@/infrastructure/factories";
import {
  NotFoundException,
  ValidationException,
} from "@/core/domain/exceptions";

// Zod schemas for input validation
const ToggleFollowSchema = z.object({
  characterId: z.number().int().positive(),
});

const PostCommentSchema = z.object({
  characterId: z.number().int().positive(),
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

/**
 * Server Action: Toggle Follow Character
 * Thin controller that delegates to use case with RLS
 */
export async function toggleFollow(characterId: number) {
  const validated = ToggleFollowSchema.parse({ characterId });

  // This requires authentication, so we use withAuthenticatedRLS
  // which will return error if user is not logged in
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    try {
      const useCase = UseCaseFactory.createToggleFollowUseCase();
      const result = await useCase.execute(validated.characterId, user.id);

      revalidatePath(`/characters/${validated.characterId}`);
      return { success: true, isFollowing: result.isFollowing };
    } catch (error) {
      console.error("[toggleFollow] Error:", error);

      if (error instanceof NotFoundException) {
        return { success: false, error: "Character not found" };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update follow status",
      };
    }
  }).catch((authError) => {
    // Handle auth error from withAuthenticatedRLS
    return { success: false, error: "Please log in to follow characters" };
  });
}

/**
 * Server Action: Check if Following
 * Works with/without authentication using RLS
 */
export async function isFollowing(characterId: number) {
  return withOptionalRLS(prisma, async (tx, user) => {
    if (!user) return false;

    const characterRepo = UseCaseFactory.getCharacterRepository();
    return characterRepo.isFollowing(user.id, characterId);
  });
}

/**
 * Server Action: Post Comment on Character
 * Thin controller that delegates to use case with RLS
 */
export async function postComment(characterId: number, content: string) {
  const validated = PostCommentSchema.parse({ characterId, content });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    try {
      const useCase = UseCaseFactory.createPostCommentUseCase();
      const username =
        user.username || user.name || user.email?.split("@")[0] || "User";

      await useCase.execute(
        { characterId: validated.characterId, content: validated.content },
        user.id,
        username,
      );

      revalidatePath(`/characters/${validated.characterId}`);
      return { success: true };
    } catch (error) {
      console.error("[postComment] Error:", error);

      if (error instanceof NotFoundException) {
        return { success: false, error: "Character not found" };
      }
      if (error instanceof ValidationException) {
        return { success: false, error: error.message };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to post comment",
      };
    }
  }).catch((authError) => {
    return { success: false, error: "Please log in to post comments" };
  });
}

/**
 * Server Action: Get Comments for Character
 * Public read operation (RLS policy allows public SELECT)
 */
export async function getComments(characterId: number) {
  return withoutRLS(prisma, async (tx) => {
    const useCase = UseCaseFactory.createGetCharacterDetailsUseCase();
    const result = await useCase.execute(characterId);
    return result.comments;
  });
}
