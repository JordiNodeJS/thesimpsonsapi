import { Content } from "../value-objects";

/**
 * Quote Collection Entity
 * Represents a user's collection of quotes
 * This is an Aggregate Root for the Collections bounded context
 */
export interface QuoteCollectionData {
  id: number;
  userId: string | null;
  name: string;
  description: string | null;
}

export class QuoteCollection {
  private constructor(
    public readonly id: number,
    public readonly userId: string | null,
    private readonly _name: Content,
    public readonly description: string | null,
  ) {}

  /**
   * Creates a QuoteCollection entity from raw data
   */
  static create(data: QuoteCollectionData): QuoteCollection {
    return new QuoteCollection(
      data.id,
      data.userId,
      Content.createName(data.name),
      data.description,
    );
  }

  /**
   * Creates a new collection for submission
   */
  static createNew(
    userId: string,
    name: string,
    description?: string,
  ): QuoteCollection {
    return new QuoteCollection(
      0, // ID will be assigned by database
      userId,
      Content.createName(name),
      description ?? null,
    );
  }

  /**
   * Gets the collection name as string
   */
  get name(): string {
    return this._name.getValue();
  }

  /**
   * Checks if collection belongs to a specific user
   */
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Checks if collection has a description
   */
  hasDescription(): boolean {
    return this.description !== null && this.description.length > 0;
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: QuoteCollection): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): QuoteCollectionData {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      description: this.description,
    };
  }
}

/**
 * Collection Quote Entity
 * Represents a quote within a collection
 */
export interface CollectionQuoteData {
  id: number;
  collectionId: number | null;
  quoteText: string;
  characterName: string | null;
  sourceEpisode: string | null;
}

export class CollectionQuote {
  private constructor(
    public readonly id: number,
    public readonly collectionId: number | null,
    private readonly _quoteText: Content,
    public readonly characterName: string | null,
    public readonly sourceEpisode: string | null,
  ) {}

  /**
   * Creates a CollectionQuote entity from raw data
   */
  static create(data: CollectionQuoteData): CollectionQuote {
    return new CollectionQuote(
      data.id,
      data.collectionId,
      Content.quote(data.quoteText),
      data.characterName,
      data.sourceEpisode,
    );
  }

  /**
   * Creates a new quote for submission
   */
  static createNew(
    collectionId: number,
    quoteText: string,
    characterName: string,
    sourceEpisode?: string,
  ): CollectionQuote {
    return new CollectionQuote(
      0, // ID will be assigned by database
      collectionId,
      Content.quote(quoteText),
      characterName,
      sourceEpisode ?? null,
    );
  }

  /**
   * Gets the quote text as string
   */
  get quoteText(): string {
    return this._quoteText.getValue();
  }

  /**
   * Checks if quote has character attribution
   */
  hasCharacter(): boolean {
    return this.characterName !== null && this.characterName.length > 0;
  }

  /**
   * Checks if quote has episode source
   */
  hasSource(): boolean {
    return this.sourceEpisode !== null && this.sourceEpisode.length > 0;
  }

  /**
   * Gets formatted attribution
   */
  getAttribution(): string {
    if (this.hasCharacter() && this.hasSource()) {
      return `— ${this.characterName}, ${this.sourceEpisode}`;
    }
    if (this.hasCharacter()) {
      return `— ${this.characterName}`;
    }
    return "";
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: CollectionQuote): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): CollectionQuoteData {
    return {
      id: this.id,
      collectionId: this.collectionId,
      quoteText: this.quoteText,
      characterName: this.characterName,
      sourceEpisode: this.sourceEpisode,
    };
  }
}
