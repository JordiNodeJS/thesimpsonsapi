/**
 * Mock UseCaseFactory for testing
 * Provides mock implementations of all use cases
 */
import { vi } from "vitest";

// Mock use case responses
export const mockTrackEpisodeExecute = vi.fn();
export const mockGetEpisodeDetailsExecute = vi.fn();
export const mockListEpisodesExecute = vi.fn();
export const mockToggleFollowExecute = vi.fn();
export const mockPostCommentExecute = vi.fn();
export const mockGetCharacterDetailsExecute = vi.fn();
export const mockListCharactersExecute = vi.fn();
export const mockCreateDiaryEntryExecute = vi.fn();
export const mockDeleteDiaryEntryExecute = vi.fn();
export const mockListDiaryEntriesExecute = vi.fn();
export const mockCreateCollectionExecute = vi.fn();
export const mockAddQuoteExecute = vi.fn();
export const mockListCollectionsExecute = vi.fn();
export const mockGetCollectionQuotesExecute = vi.fn();
export const mockSubmitTriviaExecute = vi.fn();
export const mockListTriviaExecute = vi.fn();

// Mock repository accessors
export const mockCharacterRepoFindById = vi.fn();
export const mockCharacterRepoIsFollowing = vi.fn();
export const mockLocationRepoFindAll = vi.fn();

export const UseCaseFactory = {
  // Episode Use Cases
  createTrackEpisodeUseCase: vi.fn(() => ({
    execute: mockTrackEpisodeExecute,
  })),
  createGetEpisodeDetailsUseCase: vi.fn(() => ({
    execute: mockGetEpisodeDetailsExecute,
  })),
  createListEpisodesUseCase: vi.fn(() => ({
    execute: mockListEpisodesExecute,
  })),

  // Character Use Cases
  createToggleFollowUseCase: vi.fn(() => ({
    execute: mockToggleFollowExecute,
  })),
  createPostCommentUseCase: vi.fn(() => ({
    execute: mockPostCommentExecute,
  })),
  createGetCharacterDetailsUseCase: vi.fn(() => ({
    execute: mockGetCharacterDetailsExecute,
  })),
  createListCharactersUseCase: vi.fn(() => ({
    execute: mockListCharactersExecute,
  })),

  // Diary Use Cases
  createCreateDiaryEntryUseCase: vi.fn(() => ({
    execute: mockCreateDiaryEntryExecute,
  })),
  createDeleteDiaryEntryUseCase: vi.fn(() => ({
    execute: mockDeleteDiaryEntryExecute,
  })),
  createListDiaryEntriesUseCase: vi.fn(() => ({
    execute: mockListDiaryEntriesExecute,
  })),

  // Collection Use Cases
  createCreateCollectionUseCase: vi.fn(() => ({
    execute: mockCreateCollectionExecute,
  })),
  createAddQuoteUseCase: vi.fn(() => ({
    execute: mockAddQuoteExecute,
  })),
  createListCollectionsUseCase: vi.fn(() => ({
    execute: mockListCollectionsExecute,
  })),
  createGetCollectionQuotesUseCase: vi.fn(() => ({
    execute: mockGetCollectionQuotesExecute,
  })),

  // Trivia Use Cases
  createSubmitTriviaUseCase: vi.fn(() => ({
    execute: mockSubmitTriviaExecute,
  })),
  createListTriviaUseCase: vi.fn(() => ({
    execute: mockListTriviaExecute,
  })),

  // Repository Accessors
  getCharacterRepository: vi.fn(() => ({
    findById: mockCharacterRepoFindById,
    isFollowing: mockCharacterRepoIsFollowing,
  })),
  getEpisodeRepository: vi.fn(() => ({})),
  getLocationRepository: vi.fn(() => ({
    findAll: mockLocationRepoFindAll,
  })),
};

// Reset all mocks helper
export const resetAllMocks = () => {
  mockTrackEpisodeExecute.mockReset();
  mockGetEpisodeDetailsExecute.mockReset();
  mockListEpisodesExecute.mockReset();
  mockToggleFollowExecute.mockReset();
  mockPostCommentExecute.mockReset();
  mockGetCharacterDetailsExecute.mockReset();
  mockListCharactersExecute.mockReset();
  mockCreateDiaryEntryExecute.mockReset();
  mockDeleteDiaryEntryExecute.mockReset();
  mockListDiaryEntriesExecute.mockReset();
  mockCreateCollectionExecute.mockReset();
  mockAddQuoteExecute.mockReset();
  mockListCollectionsExecute.mockReset();
  mockGetCollectionQuotesExecute.mockReset();
  mockSubmitTriviaExecute.mockReset();
  mockListTriviaExecute.mockReset();
  mockCharacterRepoFindById.mockReset();
  mockCharacterRepoIsFollowing.mockReset();
  mockLocationRepoFindAll.mockReset();
};
