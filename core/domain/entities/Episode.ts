import { Rating } from "../value-objects";

/**
 * Episode Entity
 * Represents a Simpsons episode (synced from external API)
 * This is an Aggregate Root for the Episode bounded context
 */
export interface EpisodeData {
  id: number;
  externalId: number;
  title: string;
  season: number;
  episodeNumber: number;
  synopsis?: string | null;
  imageUrl?: string | null;
}

export class Episode {
  private constructor(
    public readonly id: number,
    public readonly externalId: number,
    public readonly title: string,
    public readonly season: number,
    public readonly episodeNumber: number,
    public readonly synopsis: string | null,
    public readonly imageUrl: string | null,
  ) {}

  /**
   * Creates an Episode entity from raw data
   */
  static create(data: EpisodeData): Episode {
    return new Episode(
      data.id,
      data.externalId,
      data.title,
      data.season,
      data.episodeNumber,
      data.synopsis ?? null,
      data.imageUrl ?? null,
    );
  }

  /**
   * Gets the episode code (e.g., "S01E01")
   */
  getEpisodeCode(): string {
    const seasonStr = this.season.toString().padStart(2, "0");
    const episodeStr = this.episodeNumber.toString().padStart(2, "0");
    return `S${seasonStr}E${episodeStr}`;
  }

  /**
   * Checks if this is from the golden era (seasons 1-10)
   */
  isGoldenEra(): boolean {
    return this.season >= 1 && this.season <= 10;
  }

  /**
   * Checks if episode has a synopsis
   */
  hasSynopsis(): boolean {
    return this.synopsis !== null && this.synopsis.length > 0;
  }

  /**
   * Checks if episode has an image
   */
  hasImage(): boolean {
    return this.imageUrl !== null && this.imageUrl.length > 0;
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: Episode): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): EpisodeData {
    return {
      id: this.id,
      externalId: this.externalId,
      title: this.title,
      season: this.season,
      episodeNumber: this.episodeNumber,
      synopsis: this.synopsis,
      imageUrl: this.imageUrl,
    };
  }
}

/**
 * Episode Progress Entity
 * Represents a user's progress/rating for an episode
 */
export interface EpisodeProgressData {
  userId: string;
  episodeId: number;
  rating: number | null;
  notes: string | null;
  watchedAt: Date | null;
}

export class EpisodeProgress {
  private constructor(
    public readonly userId: string,
    public readonly episodeId: number,
    private _rating: Rating | null,
    public readonly notes: string | null,
    public readonly watchedAt: Date | null,
  ) {}

  /**
   * Creates an EpisodeProgress entity
   */
  static create(data: EpisodeProgressData): EpisodeProgress {
    const rating = data.rating !== null ? Rating.create(data.rating) : null;
    return new EpisodeProgress(
      data.userId,
      data.episodeId,
      rating,
      data.notes,
      data.watchedAt,
    );
  }

  /**
   * Gets the rating as a number (or null)
   */
  get rating(): number | null {
    return this._rating?.getValue() ?? null;
  }

  /**
   * Gets the Rating value object (or null)
   */
  getRating(): Rating | null {
    return this._rating;
  }

  /**
   * Checks if user has watched this episode
   */
  hasWatched(): boolean {
    return this.watchedAt !== null;
  }

  /**
   * Checks if user has rated this episode
   */
  hasRated(): boolean {
    return this._rating !== null;
  }

  /**
   * Checks if highly rated (4-5 stars)
   */
  isHighlyRated(): boolean {
    return this._rating?.isHighRating() ?? false;
  }

  /**
   * Updates the rating (returns new instance - immutable)
   */
  updateRating(newRating: number): EpisodeProgress {
    return new EpisodeProgress(
      this.userId,
      this.episodeId,
      Rating.create(newRating),
      this.notes,
      new Date(),
    );
  }

  /**
   * Updates notes (returns new instance - immutable)
   */
  updateNotes(newNotes: string): EpisodeProgress {
    return new EpisodeProgress(
      this.userId,
      this.episodeId,
      this._rating,
      newNotes,
      this.watchedAt,
    );
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): EpisodeProgressData {
    return {
      userId: this.userId,
      episodeId: this.episodeId,
      rating: this.rating,
      notes: this.notes,
      watchedAt: this.watchedAt,
    };
  }
}
