import { DiaryEntry, Location } from "@/core/domain/entities";

/**
 * Diary Repository Interface (Port)
 * Defines the contract for diary entry data access
 */
export interface DiaryRepository {
  /**
   * Find diary entries by user
   */
  findByUser(userId: string): Promise<DiaryEntry[]>;

  /**
   * Find a diary entry by ID
   */
  findById(id: number): Promise<DiaryEntry | null>;

  /**
   * Create a new diary entry
   */
  create(entry: DiaryEntry): Promise<DiaryEntry>;

  /**
   * Delete a diary entry (only if owned by user)
   */
  delete(id: number, userId: string): Promise<boolean>;
}

/**
 * Location Repository Interface (Port)
 * Defines the contract for location data access
 */
export interface LocationRepository {
  /**
   * Find all locations
   */
  findAll(): Promise<Location[]>;

  /**
   * Find a location by ID
   */
  findById(id: number): Promise<Location | null>;
}
