/**
 * Test Data Factories
 *
 * Centralized mock data generation for consistent testing across the test suite.
 * Use these factories instead of creating inline mock data to ensure consistency.
 */

import type {
  Character,
  Episode,
  Location,
  TriviaFact,
  DiaryEntry,
  User,
  QuoteCollection,
  CollectionQuote,
  CharacterComment,
  CharacterFollow,
  UserEpisodeProgress,
} from "@prisma/client";

// Character Factory
export const createMockCharacter = (
  overrides?: Partial<Character>,
): Character => ({
  id: 1,
  externalId: 100,
  name: "Homer Simpson",
  occupation: "Safety Inspector at Springfield Nuclear Power Plant",
  imageUrl: "https://example.com/homer.jpg",
  ...overrides,
});

// Episode Factory
export const createMockEpisode = (overrides?: Partial<Episode>): Episode => ({
  id: 1,
  externalId: 1,
  title: "Simpsons Roasting on an Open Fire",
  season: 1,
  episodeNumber: 1,
  synopsis:
    "Homer is forced to become a department store Santa when Marge has to spend the family's Christmas savings to remove Bart's tattoo.",
  imageUrl: "https://example.com/episode1.jpg",
  ...overrides,
});

// Location Factory
export const createMockLocation = (
  overrides?: Partial<Location>,
): Location => ({
  id: 1,
  externalId: 1,
  name: "Moe's Tavern",
  ...overrides,
});

// Trivia Fact Factory
export const createMockTriviaFact = (
  overrides?: Partial<TriviaFact>,
): TriviaFact => ({
  id: 1,
  relatedEntityType: "CHARACTER",
  relatedEntityId: 1,
  content: "Homer's middle name is Jay, revealed in Season 2.",
  submittedByUserId: "test-user-id",
  createdAt: new Date("2026-01-01"),
  ...overrides,
});

// Diary Entry Factory
export const createMockDiaryEntry = (
  overrides?: Partial<DiaryEntry>,
): DiaryEntry => ({
  id: 1,
  userId: "test-user-id",
  characterId: 1,
  locationId: 1,
  activityDescription: "Went to Moe's Tavern with Homer and had a Duff beer",
  entryDate: new Date("2026-01-15"),
  ...overrides,
});

// User Factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: "test-user-id-123",
  username: "testuser",
  email: "test@example.com",
  emailVerified: false,
  password: null,
  image: null,
  name: "Test User",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

// Quote Collection Factory
export const createMockQuoteCollection = (
  overrides?: Partial<QuoteCollection>,
): QuoteCollection => ({
  id: 1,
  userId: "test-user-id-123",
  name: "Best Quotes",
  description: "My favorite quotes from The Simpsons",
  ...overrides,
});

// Collection Quote Factory
export const createMockCollectionQuote = (
  overrides?: Partial<CollectionQuote>,
): CollectionQuote => ({
  id: 1,
  collectionId: 1,
  quoteText: "D'oh!",
  characterName: "Homer Simpson",
  sourceEpisode: "S01E01 - Simpsons Roasting on an Open Fire",
  ...overrides,
});

// Character Comment Factory
export const createMockCharacterComment = (
  overrides?: Partial<CharacterComment>,
): CharacterComment => ({
  id: 1,
  userId: "test-user-id-123",
  characterId: 1,
  content: "This is a great character!",
  createdAt: new Date("2026-01-15"),
  ...overrides,
});

// Character Follow Factory
export const createMockCharacterFollow = (
  overrides?: Partial<CharacterFollow>,
): CharacterFollow => ({
  userId: "test-user-id-123",
  characterId: 1,
  createdAt: new Date("2026-01-01"),
  ...overrides,
});

// User Episode Progress Factory
export const createMockEpisodeProgress = (
  overrides?: Partial<UserEpisodeProgress>,
): UserEpisodeProgress => ({
  userId: "test-user-id-123",
  episodeId: 1,
  rating: 5,
  notes: "Great episode!",
  watchedAt: new Date("2026-01-15"),
  ...overrides,
});

// Comment Factory (with user join) - for repository results
export const createMockCommentWithUser = (overrides?: Record<string, unknown>) => ({
  id: 1,
  userId: "test-user-id",
  characterId: 1,
  content: "This is a great character!",
  createdAt: new Date("2026-01-15"),
  user: {
    username: "testuser",
    name: "Test User",
  },
  ...overrides,
});

// Trivia with User Factory - for repository results
export const createMockTriviaWithUser = (overrides?: Record<string, unknown>) => ({
  id: 1,
  relatedEntityType: "CHARACTER",
  relatedEntityId: 1,
  content: "Homer's middle name is Jay.",
  submittedByUserId: "test-user-id",
  createdAt: new Date("2026-01-15"),
  user: {
    username: "testuser",
    name: "Test User",
  },
  ...overrides,
});

// Diary Entry with Relations Factory - for repository results
export const createMockDiaryEntryWithRelations = (
  overrides?: Record<string, unknown>,
) => ({
  id: 1,
  userId: "test-user-id",
  characterId: 1,
  locationId: 1,
  activityDescription: "Went to Moe's Tavern",
  entryDate: new Date("2026-01-15"),
  character: { name: "Homer Simpson" },
  location: { name: "Moe's Tavern" },
  ...overrides,
});

// Batch factory helpers
export const createMockCharacters = (count: number): Character[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCharacter({
      id: i + 1,
      name: `Character ${i + 1}`,
    }),
  );
};

export const createMockEpisodes = (count: number): Episode[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockEpisode({
      id: i + 1,
      externalId: i + 1,
      title: `Episode ${i + 1}`,
      season: Math.floor(i / 22) + 1,
      episodeNumber: (i % 22) + 1,
    }),
  );
};
