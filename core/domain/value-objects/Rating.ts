import { InvalidRatingException } from "../exceptions";

/**
 * Rating Value Object
 * Represents a rating between 1 and 5 stars
 * Immutable - all operations return new instances
 */
export class Rating {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  /**
   * Creates a new Rating value object
   * @throws InvalidRatingException if value is not between 1 and 5
   */
  static create(value: number): Rating {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new InvalidRatingException(value);
    }
    return new Rating(value);
  }

  /**
   * Creates a Rating from a nullable number (for database values)
   */
  static fromNullable(value: number | null): Rating | null {
    if (value === null) return null;
    return Rating.create(value);
  }

  /**
   * Gets the numeric value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Checks if this is a high rating (4 or 5 stars)
   */
  isHighRating(): boolean {
    return this.value >= 4;
  }

  /**
   * Checks if this is a low rating (1 or 2 stars)
   */
  isLowRating(): boolean {
    return this.value <= 2;
  }

  /**
   * Compares equality with another Rating
   */
  equals(other: Rating): boolean {
    return this.value === other.value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return `${this.value}/5`;
  }
}
