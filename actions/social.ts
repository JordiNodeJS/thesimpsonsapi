/**
 * Social Server Actions - Frame-centric Pattern
 *
 * Handles social features: following characters, posting comments.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma, withAuthenticatedRLS, withOptionalRLS } from "@/lib/db";
import { PostCommentSchema, FollowCharacterSchema } from "@/lib/validators";

/**
 * Toggle follow status for a character
 */
export async function toggleFollow(characterId: number) {
  const validated = FollowCharacterSchema.parse({ characterId });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    // Check if already following
    const existing = await tx.characterFollow.findUnique({
      where: {
        userId_characterId: {
          userId: user.id,
          characterId: validated.characterId,
        },
      },
    });

    let isFollowing: boolean;

    if (existing) {
      // Unfollow
      await tx.characterFollow.delete({
        where: {
          userId_characterId: {
            userId: user.id,
            characterId: validated.characterId,
          },
        },
      });
      isFollowing = false;
    } else {
      // Verify character exists
      const character = await tx.character.findUnique({
        where: { id: validated.characterId },
      });

      if (!character) {
        throw new Error(`Character with ID ${validated.characterId} not found`);
      }

      // Follow
      await tx.characterFollow.create({
        data: {
          userId: user.id,
          characterId: validated.characterId,
        },
      });
      isFollowing = true;
    }

    revalidatePath(`/characters/${validated.characterId}`);
    return { success: true, isFollowing };
  }).catch((error: Error) => {
    if (error.message === "Unauthorized: No active session") {
      return { success: false, error: "Please log in to follow characters" };
    }
    return { success: false, error: error.message };
  });
}

/**
 * Check if user is following a character
 */
export async function isFollowing(characterId: number) {
  return withOptionalRLS(prisma, async (tx, user) => {
    if (!user) return false;

    const follow = await tx.characterFollow.findUnique({
      where: {
        userId_characterId: {
          userId: user.id,
          characterId,
        },
      },
    });

    return !!follow;
  });
}

/**
 * Post a comment on a character
 */
export async function postComment(characterId: number, content: string) {
  const validated = PostCommentSchema.parse({ characterId, content });

  return withAuthenticatedRLS(prisma, async (tx, user) => {
    // Verify character exists
    const character = await tx.character.findUnique({
      where: { id: validated.characterId },
    });

    if (!character) {
      throw new Error(`Character with ID ${validated.characterId} not found`);
    }

    const comment = await tx.characterComment.create({
      data: {
        userId: user.id,
        characterId: validated.characterId,
        content: validated.content,
      },
    });

    // Get username for the response
    const username =
      user.username || user.name || user.email?.split("@")[0] || "User";

    revalidatePath(`/characters/${validated.characterId}`);
    return {
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        username,
        createdAt: comment.createdAt,
      },
    };
  }).catch((error: Error) => {
    if (error.message === "Unauthorized: No active session") {
      return { success: false, error: "Please log in to post comments" };
    }
    return { success: false, error: error.message };
  });
}

/**
 * Get user's followed characters
 */
export async function getFollowedCharacters() {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const follows = await tx.characterFollow.findMany({
      where: { userId: user.id },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return follows.map((f) => f.character).filter(Boolean);
  });
}

/**
 * Get follower count for a character
 */
export async function getFollowerCount(characterId: number) {
  const count = await prisma.characterFollow.count({
    where: { characterId },
  });

  return count;
}

/**
 * Get comments for a character (public)
 */
export async function getComments(characterId: number) {
  const comments = await prisma.characterComment.findMany({
    where: { characterId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { username: true, name: true, email: true },
      },
    },
  });

  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    username:
      c.user?.username ||
      c.user?.name ||
      c.user?.email?.split("@")[0] ||
      "Anonymous",
    userId: c.userId,
    characterId: c.characterId,
    createdAt: c.createdAt?.toISOString() || null,
  }));
}
