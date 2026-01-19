"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserOptional } from "@/app/_lib/auth";
import { UseCaseFactory } from "@/infrastructure/factories";
import { NotFoundException, ValidationException } from "@/core/domain/exceptions";

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
 * Thin controller that delegates to use case
 */
export async function toggleFollow(characterId: number) {
  const validated = ToggleFollowSchema.parse({ characterId });
  const user = await getCurrentUserOptional();
  
  if (!user) {
    return { success: false, error: "Please log in to follow characters" };
  }

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
      error: error instanceof Error ? error.message : "Failed to update follow status",
    };
  }
}

/**
 * Server Action: Check if Following
 */
export async function isFollowing(characterId: number) {
  const user = await getCurrentUserOptional();
  if (!user) return false;
  
  const characterRepo = UseCaseFactory.getCharacterRepository();
  return characterRepo.isFollowing(user.id, characterId);
}

/**
 * Server Action: Post Comment on Character
 * Thin controller that delegates to use case
 */
export async function postComment(characterId: number, content: string) {
  const validated = PostCommentSchema.parse({ characterId, content });
  const user = await getCurrentUserOptional();
  
  if (!user) {
    return { success: false, error: "Please log in to post comments" };
  }

  try {
    const useCase = UseCaseFactory.createPostCommentUseCase();
    const username = user.username || user.name || user.email?.split("@")[0] || "User";
    
    await useCase.execute(
      { characterId: validated.characterId, content: validated.content },
      user.id,
      username
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
      error: error instanceof Error ? error.message : "Failed to post comment",
    };
  }
}

/**
 * Server Action: Get Comments for Character
 */
export async function getComments(characterId: number) {
  const useCase = UseCaseFactory.createGetCharacterDetailsUseCase();
  const result = await useCase.execute(characterId);
  return result.comments;
}
