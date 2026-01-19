import { Content, EntityType } from "../value-objects";

/**
 * Trivia Fact Entity
 * Represents a fan-submitted trivia fact
 * This is an Aggregate Root for the Trivia bounded context
 */
export interface TriviaFactData {
  id: number;
  relatedEntityType: string | null;
  relatedEntityId: number;
  content: string;
  submittedByUserId: string | null;
  createdAt: Date | null;
  username?: string;
}

export class TriviaFact {
  private constructor(
    public readonly id: number,
    private readonly _entityType: EntityType | null,
    public readonly relatedEntityId: number,
    private readonly _content: Content,
    public readonly submittedByUserId: string | null,
    public readonly createdAt: Date | null,
    public readonly username: string
  ) {}

  /**
   * Creates a TriviaFact entity from raw data
   */
  static create(data: TriviaFactData): TriviaFact {
    const entityType = data.relatedEntityType
      ? EntityType.fromString(data.relatedEntityType)
      : null;

    return new TriviaFact(
      data.id,
      entityType,
      data.relatedEntityId,
      Content.trivia(data.content),
      data.submittedByUserId,
      data.createdAt,
      data.username ?? "Anonymous"
    );
  }

  /**
   * Creates a new trivia fact for submission
   */
  static createNew(
    entityType: "CHARACTER" | "EPISODE",
    entityId: number,
    content: string,
    userId: string,
    username: string
  ): TriviaFact {
    return new TriviaFact(
      0, // ID will be assigned by database
      EntityType.fromString(entityType),
      entityId,
      Content.trivia(content),
      userId,
      new Date(),
      username
    );
  }

  /**
   * Gets the content as string
   */
  get content(): string {
    return this._content.getValue();
  }

  /**
   * Gets the entity type as string (or null)
   */
  get relatedEntityType(): string | null {
    return this._entityType?.getValue() ?? null;
  }

  /**
   * Checks if trivia is for a character
   */
  isForCharacter(): boolean {
    return this._entityType?.isCharacter() ?? false;
  }

  /**
   * Checks if trivia is for an episode
   */
  isForEpisode(): boolean {
    return this._entityType?.isEpisode() ?? false;
  }

  /**
   * Checks if trivia was submitted by a specific user
   */
  isSubmittedBy(userId: string): boolean {
    return this.submittedByUserId === userId;
  }

  /**
   * Gets a formatted creation date
   */
  getFormattedDate(): string {
    if (!this.createdAt) return "Unknown date";
    return this.createdAt.toLocaleDateString();
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: TriviaFact): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): TriviaFactData & { username: string } {
    return {
      id: this.id,
      relatedEntityType: this.relatedEntityType,
      relatedEntityId: this.relatedEntityId,
      content: this.content,
      submittedByUserId: this.submittedByUserId,
      createdAt: this.createdAt,
      username: this.username,
    };
  }
}
