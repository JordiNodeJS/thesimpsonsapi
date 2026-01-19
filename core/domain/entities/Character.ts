/**
 * Character Entity
 * Represents a Simpsons character (synced from external API)
 * This is an Aggregate Root for the Character bounded context
 */
export interface CharacterData {
  id: number;
  externalId: number;
  name: string;
  occupation?: string | null;
  imageUrl?: string | null;
}

export class Character {
  private constructor(
    public readonly id: number,
    public readonly externalId: number,
    public readonly name: string,
    public readonly occupation: string | null,
    public readonly imageUrl: string | null,
  ) {}

  /**
   * Creates a Character entity from raw data
   */
  static create(data: CharacterData): Character {
    return new Character(
      data.id,
      data.externalId,
      data.name,
      data.occupation ?? null,
      data.imageUrl ?? null,
    );
  }

  /**
   * Checks if character has an occupation
   */
  hasOccupation(): boolean {
    return this.occupation !== null && this.occupation.length > 0;
  }

  /**
   * Checks if character has an image
   */
  hasImage(): boolean {
    return this.imageUrl !== null && this.imageUrl.length > 0;
  }

  /**
   * Checks if this is a main character (Simpson family)
   */
  isMainCharacter(): boolean {
    const mainCharacters = [
      "Homer Simpson",
      "Marge Simpson",
      "Bart Simpson",
      "Lisa Simpson",
      "Maggie Simpson",
    ];
    return mainCharacters.includes(this.name);
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: Character): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): CharacterData {
    return {
      id: this.id,
      externalId: this.externalId,
      name: this.name,
      occupation: this.occupation,
      imageUrl: this.imageUrl,
    };
  }
}
