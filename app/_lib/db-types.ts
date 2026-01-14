import type { QueryResultRow } from "@neondatabase/serverless";

// ============================================
// Database Row Types (what comes from the DB)
// ============================================

export interface DBCharacter extends QueryResultRow {
  id: number;
  external_id: number;
  name: string;
  occupation: string | null;
  image_url: string | null;
}

export interface DBEpisode extends QueryResultRow {
  id: number;
  external_id: number;
  title: string;
  season: number;
  episode_number: number;
  synopsis: string | null;
  image_url: string | null;
}

export interface DBLocation extends QueryResultRow {
  id: number;
  external_id: number;
  name: string;
}

export interface DBUser extends QueryResultRow {
  id: string; // TEXT UUID from Better Auth
  username: string;
  email: string | null;
  email_verified: boolean | null;
  image: string | null;
  name: string | null;
  password: string | null;
}

export interface DBComment extends QueryResultRow {
  id: number;
  user_id: string;
  character_id: number;
  content: string;
  created_at: Date;
  username: string;
}

export interface DBTriviaFact extends QueryResultRow {
  id: number;
  related_entity_type: "CHARACTER" | "EPISODE";
  related_entity_id: number;
  content: string;
  submitted_by_user_id: string;
  created_at: Date;
  username: string;
}

export interface DBDiaryEntry extends QueryResultRow {
  id: number;
  user_id: string;
  character_id: number;
  location_id: number;
  activity_description: string;
  entry_date: Date;
  character_name?: string;
  location_name?: string;
}

export interface DBEpisodeProgress extends QueryResultRow {
  id: number;
  user_id: string;
  episode_id: number;
  rating: number;
  notes: string;
  watched_at: Date;
}

export interface DBQuoteCollection extends QueryResultRow {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
}

export interface DBCollectionQuote extends QueryResultRow {
  id: number;
  collection_id: number;
  quote_text: string;
  character_name: string;
  source_episode: string;
}
