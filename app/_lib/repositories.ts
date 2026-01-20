/**
 * Repository Functions - Simple Data Access Pattern
 *
 * 🎓 EDUCATIONAL NOTE: Why Simple Pattern Here?
 * ============================================
 * These functions use DIRECT Prisma queries without Use Case abstraction.
 * This is intentional and follows the YAGNI (You Ain't Gonna Need It) principle.
 *
 * When to use this SIMPLE pattern:
 * ✅ Read-only operations (no business rules to enforce)
 * ✅ Public data (no RLS/authorization needed)
 * ✅ Simple transformations (or none at all)
 * ✅ Static reference data (characters, episodes, locations)
 *
 * When to use FULL DDD pattern instead:
 * ❌ Mutations with business rules → Use UseCaseFactory
 * ❌ User-owned data with RLS → Use withAuthenticatedRLS + UseCase
 * ❌ Complex validation → Use Domain Entities
 *
 * See docs/ARCHITECTURE_DECISION_MATRIX.md for the full decision guide.
 */

import { prisma } from "@/app/_lib/prisma";

// ============================================
// Types for query results with joins
// ============================================

export type CommentWithUser = {
  id: number;
  userId: string | null;
  characterId: number | null;
  content: string;
  createdAt: string | null;
  username: string;
};

export type TriviaWithUser = {
  id: number;
  relatedEntityType: string | null;
  relatedEntityId: number;
  content: string;
  submittedByUserId: string | null;
  createdAt: string | null;
  username: string;
};

export type DiaryEntryWithRelations = {
  id: number;
  userId: string | null;
  characterId: number | null;
  locationId: number | null;
  activityDescription: string;
  entryDate: string | null;
  characterName: string | null;
  locationName: string | null;
};

// ============================================
// Characters - SIMPLE PATTERN
// ============================================
// 🎓 WHY SIMPLE: Characters are public reference data.
// No business rules, no user ownership, just data retrieval.
// A ListCharactersUseCase would just be a pass-through wrapper.

export async function findAllCharacters(limit = 50) {
  return prisma.character.findMany({
    take: limit,
    orderBy: { id: "asc" },
  });
}

export async function findCharacterById(id: number) {
  return prisma.character.findUnique({
    where: { id },
  });
}

export async function findFeaturedCharacters() {
  return prisma.character.findMany({
    where: {
      name: {
        in: [
          "Homer Simpson",
          "Marge Simpson",
          "Bart Simpson",
          "Lisa Simpson",
          "Maggie Simpson",
        ],
      },
    },
    take: 5,
  });
}

export async function findCharacterNames() {
  return prisma.character.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  });
}

// ============================================
// Episodes - SIMPLE PATTERN (Read Operations)
// ============================================
// 🎓 WHY SIMPLE: Episode listing is public catalog data.
// No business rules for reading episodes.
//
// ⚠️ NOTE: Writing to user_episode_progress uses FULL DDD pattern!
// See app/_actions/episodes.ts → TrackEpisodeUseCase
// The UseCase validates ratings (1-5), checks episode exists, manages state.

export async function findAllEpisodes(limit = 50) {
  return prisma.episode.findMany({
    take: limit,
    orderBy: [{ season: "asc" }, { episodeNumber: "asc" }],
  });
}

export async function findEpisodeById(id: number) {
  return prisma.episode.findUnique({
    where: { id },
  });
}

// ============================================
// Locations - SIMPLE PATTERN
// ============================================
// 🎓 WHY SIMPLE: Static reference data with no business rules.

export async function findAllLocations() {
  return prisma.location.findMany({
    orderBy: { name: "asc" },
  });
}

// ============================================
// Comments - HYBRID PATTERN
// ============================================
// 🎓 READ (SIMPLE): Anyone can view comments on characters.
// 🎓 WRITE (DDD): Posting comments requires auth + validation.
// See app/_actions/social.ts → PostCommentUseCase

export async function findCommentsByCharacter(
  characterId: number,
): Promise<CommentWithUser[]> {
  const comments = await prisma.characterComment.findMany({
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

  return comments.map((c) => ({
    id: c.id,
    userId: c.userId,
    characterId: c.characterId,
    content: c.content,
    createdAt: c.createdAt ? c.createdAt.toISOString() : null,
    username: c.user?.username || c.user?.name || "Anonymous",
  }));
}

// ============================================
// Trivia - HYBRID PATTERN
// ============================================
// 🎓 READ (SIMPLE): Anyone can view trivia facts.
// 🎓 WRITE (DDD): Submitting trivia requires validation + auth.
// See app/_actions/trivia.ts → SubmitTriviaUseCase

export async function findTriviaByEntity(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number,
): Promise<TriviaWithUser[]> {
  const trivia = await prisma.triviaFact.findMany({
    where: {
      relatedEntityType: entityType,
      relatedEntityId: entityId,
    },
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

  return trivia.map((t) => ({
    id: t.id,
    relatedEntityType: t.relatedEntityType,
    relatedEntityId: t.relatedEntityId,
    content: t.content,
    submittedByUserId: t.submittedByUserId,
    createdAt: t.createdAt ? t.createdAt.toISOString() : null,
    username: t.user?.username || t.user?.name || "Anonymous",
  }));
}

export async function findLatestTrivia(limit = 3): Promise<TriviaWithUser[]> {
  const trivia = await prisma.triviaFact.findMany({
    take: limit,
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

  return trivia.map((t) => ({
    id: t.id,
    relatedEntityType: t.relatedEntityType,
    relatedEntityId: t.relatedEntityId,
    content: t.content,
    submittedByUserId: t.submittedByUserId,
    createdAt: t.createdAt ? t.createdAt.toISOString() : null,
    username: t.user?.username || t.user?.name || "Anonymous",
  }));
}

// ============================================
// Diary Entries
// ============================================

export async function findDiaryEntriesByUser(
  userId: string,
): Promise<DiaryEntryWithRelations[]> {
  const entries = await prisma.diaryEntry.findMany({
    where: { userId },
    include: {
      character: {
        select: { name: true },
      },
      location: {
        select: { name: true },
      },
    },
    orderBy: [{ entryDate: "desc" }, { id: "desc" }],
  });

  return entries.map((e) => ({
    id: e.id,
    userId: e.userId,
    characterId: e.characterId,
    locationId: e.locationId,
    activityDescription: e.activityDescription,
    entryDate: e.entryDate ? new Date(e.entryDate).toISOString() : null,
    characterName: e.character?.name ?? null,
    locationName: e.location?.name ?? null,
  }));
}

// ============================================
// Episode Progress
// ============================================

export async function findEpisodeProgressByUser(
  userId: string,
  episodeId: number,
) {
  return prisma.userEpisodeProgress.findUnique({
    where: {
      userId_episodeId: {
        userId,
        episodeId,
      },
    },
  });
}

// ============================================
// Collections
// ============================================

export async function findCollectionsByUser(userId: string) {
  return prisma.quoteCollection.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
}

export async function findQuotesByCollection(collectionId: number) {
  return prisma.collectionQuote.findMany({
    where: { collectionId },
    orderBy: { id: "desc" },
  });
}

// ============================================
// Social / Follows
// ============================================

export async function isUserFollowingCharacter(
  userId: string,
  characterId: number,
): Promise<boolean> {
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

// ============================================
// Stats
// ============================================

export async function getStats(): Promise<{
  characters: number;
  episodes: number;
  trivia: number;
}> {
  const [characters, episodes, trivia] = await Promise.all([
    prisma.character.count(),
    prisma.episode.count(),
    prisma.triviaFact.count(),
  ]);

  return {
    characters,
    episodes,
    trivia,
  };
}
