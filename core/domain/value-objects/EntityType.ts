/**
 * Entity Type Value Object
 * Represents the type of entity a trivia fact relates to
 */
export class EntityType {
  private readonly value: "CHARACTER" | "EPISODE";

  private constructor(value: "CHARACTER" | "EPISODE") {
    this.value = value;
  }

  static CHARACTER = new EntityType("CHARACTER");
  static EPISODE = new EntityType("EPISODE");

  /**
   * Creates an EntityType from string
   * @throws Error if invalid type
   */
  static fromString(value: string): EntityType {
    if (value === "CHARACTER") return EntityType.CHARACTER;
    if (value === "EPISODE") return EntityType.EPISODE;
    throw new Error(`Invalid entity type: ${value}`);
  }

  /**
   * Alias for fromString - creates an EntityType from string
   */
  static create(value: "CHARACTER" | "EPISODE"): EntityType {
    return EntityType.fromString(value);
  }

  /**
   * Gets the string value
   */
  getValue(): "CHARACTER" | "EPISODE" {
    return this.value;
  }

  /**
   * Checks if this is a character type
   */
  isCharacter(): boolean {
    return this.value === "CHARACTER";
  }

  /**
   * Checks if this is an episode type
   */
  isEpisode(): boolean {
    return this.value === "EPISODE";
  }

  /**
   * Compares equality
   */
  equals(other: EntityType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
