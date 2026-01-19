/**
 * User Entity
 * Represents an authenticated user (managed by Better Auth)
 * This is part of the Shared Kernel
 */
export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  username: string | null;
  image: string | null;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string | null,
    public readonly name: string | null,
    public readonly username: string | null,
    public readonly image: string | null
  ) {}

  /**
   * Creates a User entity from raw data
   */
  static create(data: UserData): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.username,
      data.image
    );
  }

  /**
   * Gets the display name (username > name > email prefix > "User")
   */
  getDisplayName(): string {
    if (this.username) return this.username;
    if (this.name) return this.name;
    if (this.email) return this.email.split("@")[0];
    return "User";
  }

  /**
   * Checks if user has a profile image
   */
  hasImage(): boolean {
    return this.image !== null && this.image.length > 0;
  }

  /**
   * Checks if user has verified email
   */
  hasEmail(): boolean {
    return this.email !== null && this.email.length > 0;
  }

  /**
   * Entity equality is based on ID
   */
  equals(other: User): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a plain object representation
   */
  toJSON(): UserData {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      username: this.username,
      image: this.image,
    };
  }
}
