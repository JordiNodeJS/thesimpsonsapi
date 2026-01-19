import { Content } from "../value-objects";

/**
 * Location Entity
 * Represents a location in Springfield (synced from external API)
 */
export interface LocationData {
  id: number;
  externalId: number;
  name: string;
}

export class Location {
  private constructor(
    public readonly id: number,
    public readonly externalId: number,
    public readonly name: string,
  ) {}

  /**
   * Creates a Location entity
   */
  static create(data: LocationData): Location {
    return new Location(data.id, data.externalId, data.name);
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: Location): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): LocationData {
    return {
      id: this.id,
      externalId: this.externalId,
      name: this.name,
    };
  }
}

/**
 * Diary Entry Entity
 * Represents a user's diary entry about a character at a location
 * This is an Aggregate Root for the Diary bounded context
 */
export interface DiaryEntryData {
  id: number;
  userId: string | null;
  characterId: number | null;
  locationId: number | null;
  activityDescription: string;
  entryDate: Date | null;
  characterName?: string | null;
  locationName?: string | null;
}

export class DiaryEntry {
  private constructor(
    public readonly id: number,
    public readonly userId: string | null,
    public readonly characterId: number | null,
    public readonly locationId: number | null,
    private readonly _description: Content,
    public readonly entryDate: Date | null,
    public readonly characterName: string | null,
    public readonly locationName: string | null,
  ) {}

  /**
   * Creates a DiaryEntry entity from raw data
   */
  static create(data: DiaryEntryData): DiaryEntry {
    return new DiaryEntry(
      data.id,
      data.userId,
      data.characterId,
      data.locationId,
      Content.description(data.activityDescription),
      data.entryDate,
      data.characterName ?? null,
      data.locationName ?? null,
    );
  }

  /**
   * Creates a new diary entry for submission
   */
  static createNew(
    userId: string,
    characterId: number,
    locationId: number,
    description: string,
  ): DiaryEntry {
    return new DiaryEntry(
      0, // ID will be assigned by database
      userId,
      characterId,
      locationId,
      Content.description(description),
      new Date(),
      null,
      null,
    );
  }

  /**
   * Gets the activity description as string
   */
  get description(): string {
    return this._description.getValue();
  }

  /**
   * Checks if entry belongs to a specific user
   */
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Checks if entry has character info
   */
  hasCharacter(): boolean {
    return this.characterId !== null;
  }

  /**
   * Checks if entry has location info
   */
  hasLocation(): boolean {
    return this.locationId !== null;
  }

  /**
   * Gets a formatted entry date
   */
  getFormattedDate(): string {
    if (!this.entryDate) return "Unknown date";
    return this.entryDate.toLocaleDateString();
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: DiaryEntry): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): DiaryEntryData {
    return {
      id: this.id,
      userId: this.userId,
      characterId: this.characterId,
      locationId: this.locationId,
      activityDescription: this.description,
      entryDate: this.entryDate,
      characterName: this.characterName,
      locationName: this.locationName,
    };
  }
}
