/**
 * Types for external API responses
 * These are used for syncing data from thesimpsonsapi.com
 */

export interface APICharacter {
  id: number;
  name: string;
  occupation: string;
  portrait_path: string;
}

export interface APIEpisode {
  id: number;
  name: string;
  season: number;
  episode_number: number;
  synopsis: string;
  image_path: string;
}

export interface APILocation {
  id: number;
  name: string;
}

/**
 * Re-export Prisma types for convenience
 * Import these from @prisma/client for full type support
 * Note: Session is excluded to avoid conflict with Better Auth Session
 */
export type {
  Character,
  Episode,
  Location,
  User,
  Account,
  Verification,
  CharacterComment,
  CharacterFollow,
  CharacterFavorite,
  DiaryEntry,
  QuoteCollection,
  CollectionQuote,
  TriviaFact,
  UserEpisodeProgress,
} from "@prisma/client";
