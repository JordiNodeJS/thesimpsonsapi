import { InvalidContentException } from "../exceptions";

/**
 * Content Value Object
 * Represents text content with length validation
 * Used for comments, descriptions, notes, etc.
 */
export class Content {
  private readonly value: string;
  private readonly minLength: number;
  private readonly maxLength: number;

  private constructor(value: string, minLength: number, maxLength: number) {
    this.value = value;
    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  /**
   * Creates a new Content value object with custom length limits
   * @throws InvalidContentException if content is outside length bounds
   */
  static create(
    value: string,
    minLength: number,
    maxLength: number,
    fieldName: string = "Content",
  ): Content {
    const trimmed = value.trim();

    if (trimmed.length < minLength || trimmed.length > maxLength) {
      throw new InvalidContentException(
        fieldName,
        minLength,
        maxLength,
        trimmed.length,
      );
    }

    return new Content(trimmed, minLength, maxLength);
  }

  /**
   * Creates a Comment content (1-1000 chars)
   */
  static comment(value: string): Content {
    return Content.create(value, 1, 1000, "Comment");
  }

  /**
   * Creates a Description content (1-1000 chars)
   */
  static description(value: string): Content {
    return Content.create(value, 1, 1000, "Description");
  }

  /**
   * Creates a Trivia content (10-1000 chars)
   */
  static trivia(value: string): Content {
    return Content.create(value, 10, 1000, "Trivia");
  }

  /**
   * Creates a Quote content (1-1000 chars)
   */
  static quote(value: string): Content {
    return Content.create(value, 1, 1000, "Quote");
  }

  /**
   * Creates Notes content (0-1000 chars, optional)
   */
  static notes(value: string): Content {
    return Content.create(value, 0, 1000, "Notes");
  }

  /**
   * Creates Name content (1-100 chars)
   */
  static createName(value: string): Content {
    return Content.create(value, 1, 100, "Name");
  }

  /**
   * Gets the string value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Gets the content length
   */
  getLength(): number {
    return this.value.length;
  }

  /**
   * Checks if content is empty
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Compares equality with another Content
   */
  equals(other: Content): boolean {
    return this.value === other.value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this.value;
  }
}
