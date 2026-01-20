/**
 * Zod Validators - Centralized Input Validation
 *
 * All Zod schemas consolidated in one place for reuse across Server Actions.
 * This follows Next.js 16 best practices: validation at the delivery layer.
 */

import { z } from "zod";

// ============================================
// Episodes
// ============================================

export const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

export type TrackEpisodeInput = z.infer<typeof TrackEpisodeSchema>;

// ============================================
// Diary
// ============================================

export const CreateDiaryEntrySchema = z.object({
  characterId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  description: z.string().min(1, "Description is required").max(1000),
});

export const DeleteDiaryEntrySchema = z.object({
  id: z.number().int().positive(),
});

export type CreateDiaryEntryInput = z.infer<typeof CreateDiaryEntrySchema>;
export type DeleteDiaryEntryInput = z.infer<typeof DeleteDiaryEntrySchema>;

// ============================================
// Collections
// ============================================

export const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const AddQuoteToCollectionSchema = z.object({
  collectionId: z.number().int().positive(),
  quote: z.string().min(1).max(500),
  characterId: z.number().int().positive().optional(),
  episodeId: z.number().int().positive().optional(),
});

export const DeleteCollectionSchema = z.object({
  id: z.number().int().positive(),
});

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type AddQuoteInput = z.infer<typeof AddQuoteToCollectionSchema>;
export type DeleteCollectionInput = z.infer<typeof DeleteCollectionSchema>;

// ============================================
// Social (Comments)
// ============================================

export const PostCommentSchema = z.object({
  characterId: z.number().int().positive(),
  content: z.string().min(1, "Comment cannot be empty").max(500),
});

export const FollowCharacterSchema = z.object({
  characterId: z.number().int().positive(),
});

export type PostCommentInput = z.infer<typeof PostCommentSchema>;
export type FollowCharacterInput = z.infer<typeof FollowCharacterSchema>;

// ============================================
// Trivia
// ============================================

export const SubmitTriviaSchema = z.object({
  entityType: z.enum(["character", "episode", "location"]),
  entityId: z.number().int().positive(),
  content: z.string().min(10, "Trivia must be at least 10 characters").max(500),
});

export type SubmitTriviaInput = z.infer<typeof SubmitTriviaSchema>;
