/**
 * Server Actions - Centralized Exports
 *
 * All Server Actions organized by domain following Frame-centric pattern.
 */

// Episodes
export {
  trackEpisode,
  getEpisodeProgress,
  getUserWatchedEpisodes,
} from "./episodes";

// Diary
export {
  createDiaryEntry,
  getDiaryEntries,
  getLocations,
  deleteDiaryEntry,
} from "./diary";

// Collections
export {
  createCollection,
  getCollections,
  addQuote,
  getCollectionQuotes,
  deleteCollection,
  deleteQuote,
} from "./collections";

// Social
export {
  toggleFollow,
  isFollowing,
  postComment,
  getComments,
  getFollowedCharacters,
  getFollowerCount,
} from "./social";

// Trivia
export { submitTrivia, getTrivia, getUserTrivia } from "./trivia";

// Sync (admin)
export { syncExternalData, type SyncResult } from "./sync";
