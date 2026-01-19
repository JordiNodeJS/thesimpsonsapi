import { Content } from "../value-objects";

/**
 * Comment Entity
 * Represents a user's comment on a character
 */
export interface CommentData {
  id: number;
  userId: string | null;
  characterId: number | null;
  content: string;
  createdAt: Date | null;
  username?: string;
}

export class Comment {
  private constructor(
    public readonly id: number,
    public readonly userId: string | null,
    public readonly characterId: number | null,
    private readonly _content: Content,
    public readonly createdAt: Date | null,
    public readonly username: string
  ) {}

  /**
   * Creates a Comment entity from raw data
   */
  static create(data: CommentData): Comment {
    return new Comment(
      data.id,
      data.userId,
      data.characterId,
      Content.comment(data.content),
      data.createdAt,
      data.username ?? "Anonymous"
    );
  }

  /**
   * Creates a new comment for submission
   */
  static createNew(userId: string, characterId: number, content: string, username: string): Comment {
    return new Comment(
      0, // ID will be assigned by database
      userId,
      characterId,
      Content.comment(content),
      new Date(),
      username
    );
  }

  /**
   * Gets the comment content as string
   */
  get content(): string {
    return this._content.getValue();
  }

  /**
   * Checks if comment was made by a specific user
   */
  isAuthoredBy(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Checks if comment is anonymous
   */
  isAnonymous(): boolean {
    return this.userId === null;
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
  equals(other: Comment): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): CommentData & { username: string } {
    return {
      id: this.id,
      userId: this.userId,
      characterId: this.characterId,
      content: this.content,
      createdAt: this.createdAt,
      username: this.username,
    };
  }
}

/**
 * Character Follow Entity
 * Represents a user following a character
 */
export interface CharacterFollowData {
  userId: string;
  characterId: number;
  createdAt?: Date | null;
}

export class CharacterFollow {
  private constructor(
    public readonly userId: string,
    public readonly characterId: number,
    public readonly createdAt: Date | null
  ) {}

  /**
   * Creates a CharacterFollow entity
   */
  static create(data: CharacterFollowData): CharacterFollow {
    return new CharacterFollow(
      data.userId,
      data.characterId,
      data.createdAt ?? null
    );
  }

  /**
   * Creates a new follow relationship
   */
  static createNew(userId: string, characterId: number): CharacterFollow {
    return new CharacterFollow(userId, characterId, new Date());
  }

  /**
   * Checks if follow belongs to a specific user
   */
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): CharacterFollowData {
    return {
      userId: this.userId,
      characterId: this.characterId,
      createdAt: this.createdAt,
    };
  }
}
