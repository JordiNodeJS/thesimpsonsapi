import { query, queryOne } from "@/app/_lib/db-utils";
import type {
  DBCharacter,
  DBEpisode,
  DBLocation,
  DBComment,
  DBTriviaFact,
  DBDiaryEntry,
  DBEpisodeProgress,
  DBQuoteCollection,
  DBCollectionQuote,
} from "@/app/_lib/db-types";

// ============================================
// Characters
// ============================================

export async function findAllCharacters(limit = 50): Promise<DBCharacter[]> {
  return query<DBCharacter>(
    `SELECT * FROM characters ORDER BY id ASC LIMIT $1`,
    [limit]
  );
}

export async function findCharacterById(
  id: number
): Promise<DBCharacter | null> {
  return queryOne<DBCharacter>(`SELECT * FROM characters WHERE id = $1`, [id]);
}

export async function findFeaturedCharacters(): Promise<DBCharacter[]> {
  return query<DBCharacter>(
    `SELECT * FROM the_simpson.characters 
     WHERE name IN ('Homer Simpson', 'Marge Simpson', 'Bart Simpson', 'Lisa Simpson', 'Maggie Simpson')
     LIMIT 5`
  );
}

export async function findCharacterNames(): Promise<
  Pick<DBCharacter, "id" | "name">[]
> {
  return query<Pick<DBCharacter, "id" | "name">>(
    `SELECT id, name FROM characters ORDER BY name ASC`
  );
}

// ============================================
// Episodes
// ============================================

export async function findAllEpisodes(limit = 50): Promise<DBEpisode[]> {
  return query<DBEpisode>(
    `SELECT * FROM episodes ORDER BY season ASC, episode_number ASC LIMIT $1`,
    [limit]
  );
}

export async function findEpisodeById(id: number): Promise<DBEpisode | null> {
  return queryOne<DBEpisode>(`SELECT * FROM episodes WHERE id = $1`, [id]);
}

// ============================================
// Locations
// ============================================

export async function findAllLocations(): Promise<DBLocation[]> {
  return query<DBLocation>(`SELECT * FROM locations ORDER BY name ASC`);
}

// ============================================
// Comments
// ============================================

export async function findCommentsByCharacter(
  characterId: number
): Promise<DBComment[]> {
  return query<DBComment>(
    `SELECT c.*, u.username 
     FROM character_comments c 
     JOIN users u ON c.user_id = u.id 
     WHERE c.character_id = $1 
     ORDER BY c.created_at DESC`,
    [characterId]
  );
}

// ============================================
// Trivia
// ============================================

export async function findTriviaByEntity(
  entityType: "CHARACTER" | "EPISODE",
  entityId: number
): Promise<DBTriviaFact[]> {
  return query<DBTriviaFact>(
    `SELECT t.*, u.username 
     FROM trivia_facts t
     JOIN users u ON t.submitted_by_user_id = u.id
     WHERE related_entity_type = $1 AND related_entity_id = $2
     ORDER BY created_at DESC`,
    [entityType, entityId]
  );
}

export async function findLatestTrivia(limit = 3): Promise<DBTriviaFact[]> {
  return query<DBTriviaFact>(
    `SELECT t.*, u.username 
     FROM the_simpson.trivia_facts t
     JOIN the_simpson.users u ON t.submitted_by_user_id = u.id
     ORDER BY t.created_at DESC
     LIMIT $1`,
    [limit]
  );
}

// ============================================
// Diary Entries
// ============================================

export async function findDiaryEntriesByUser(
  userId: number
): Promise<DBDiaryEntry[]> {
  return query<DBDiaryEntry>(
    `SELECT d.*, c.name as character_name, l.name as location_name 
     FROM diary_entries d
     JOIN characters c ON d.character_id = c.id
     JOIN locations l ON d.location_id = l.id
     WHERE d.user_id = $1
     ORDER BY d.entry_date DESC, d.id DESC`,
    [userId]
  );
}

// ============================================
// Episode Progress
// ============================================

export async function findEpisodeProgressByUser(
  userId: number,
  episodeId: number
): Promise<DBEpisodeProgress | null> {
  return queryOne<DBEpisodeProgress>(
    `SELECT * FROM user_episode_progress WHERE user_id = $1 AND episode_id = $2`,
    [userId, episodeId]
  );
}

// ============================================
// Collections
// ============================================

export async function findCollectionsByUser(
  userId: number
): Promise<DBQuoteCollection[]> {
  return query<DBQuoteCollection>(
    `SELECT * FROM quote_collections WHERE user_id = $1 ORDER BY id DESC`,
    [userId]
  );
}

export async function findQuotesByCollection(
  collectionId: number
): Promise<DBCollectionQuote[]> {
  return query<DBCollectionQuote>(
    `SELECT * FROM collection_quotes WHERE collection_id = $1 ORDER BY id DESC`,
    [collectionId]
  );
}

// ============================================
// Social / Follows
// ============================================

export async function isUserFollowingCharacter(
  userId: number,
  characterId: number
): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM character_follows WHERE user_id = $1 AND character_id = $2) as exists`,
    [userId, characterId]
  );
  return result?.exists ?? false;
}

// ============================================
// Stats
// ============================================

export async function getStats(): Promise<{
  characters: number;
  episodes: number;
  trivia: number;
}> {
  const [charCount, epCount, triviaCount] = await Promise.all([
    queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM the_simpson.characters"
    ),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM the_simpson.episodes"
    ),
    queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM the_simpson.trivia_facts"
    ),
  ]);

  return {
    characters: parseInt(charCount?.count ?? "0"),
    episodes: parseInt(epCount?.count ?? "0"),
    trivia: parseInt(triviaCount?.count ?? "0"),
  };
}
