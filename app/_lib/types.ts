export interface Character {
  id: number;
  name: string;
  description: string;
  image: string;
  occupation: string;
}

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

export interface Episode {
  id: number;
  name: string;
  description: string;
  image: string;
  season: number;
  episode: number;
}

export interface Location {
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface Comment {
  id: number;
  character_id: number;
  username: string;
  content: string;
  created_at: Date;
}

export interface TriviaFact {
  id: number;
  entity_type: "CHARACTER" | "EPISODE";
  entity_id: number;
  username: string;
  content: string;
  created_at: Date;
}

export interface EpisodeProgress {
  id: number;
  episode_id: number;
  rating: number;
  notes: string;
  watched_at: Date;
}

export interface DiaryEntry {
  id: number;
  character_id: number;
  location_id: number;
  description: string;
  entry_date: Date;
  character_name?: string;
  location_name?: string;
}
