#!/usr/bin/env node
/**
 * Test Zod validations in Server Actions
 * Verifies that invalid data is rejected correctly
 */

import { z } from "zod";

// Define the same schemas used in Server Actions
const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

const AddQuoteSchema = z.object({
  collectionId: z.number().int().positive(),
  text: z.string().min(1, "Quote text is required").max(1000),
  character: z.string().min(1).max(100),
  episode: z.string().max(200),
});

const CreateDiaryEntrySchema = z.object({
  characterId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  description: z.string().min(1, "Description is required").max(1000),
});

const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

const PostCommentSchema = z.object({
  characterId: z.number().int().positive(),
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

const SubmitTriviaSchema = z.object({
  entityType: z.enum(["CHARACTER", "EPISODE"]),
  entityId: z.number().int().positive(),
  content: z
    .string()
    .min(10, "Trivia must be at least 10 characters")
    .max(1000),
});

// Test cases
type TestCase = {
  name: string;
  schema: z.ZodSchema;
  validData: unknown;
  invalidData: unknown[];
};

const testCases: TestCase[] = [
  {
    name: "CreateCollectionSchema",
    schema: CreateCollectionSchema,
    validData: { name: "My Collection", description: "A test collection" },
    invalidData: [
      { name: "", description: "Empty name" }, // name too short
      { name: "A".repeat(101), description: "Name too long" }, // name too long
      { description: "Missing name" }, // missing required field
    ],
  },
  {
    name: "AddQuoteSchema",
    schema: AddQuoteSchema,
    validData: {
      collectionId: 1,
      text: "D'oh!",
      character: "Homer Simpson",
      episode: "S01E01",
    },
    invalidData: [
      { collectionId: -1, text: "Test", character: "Homer", episode: "S01E01" }, // negative id
      { collectionId: 1, text: "", character: "Homer", episode: "S01E01" }, // empty text
      {
        collectionId: 1.5,
        text: "Test",
        character: "Homer",
        episode: "S01E01",
      }, // non-integer id
    ],
  },
  {
    name: "CreateDiaryEntrySchema",
    schema: CreateDiaryEntrySchema,
    validData: {
      characterId: 1,
      locationId: 2,
      description: "Met Homer today",
    },
    invalidData: [
      { characterId: 0, locationId: 2, description: "Invalid character" }, // zero id
      { characterId: 1, locationId: 2, description: "" }, // empty description
      { characterId: 1, locationId: -5, description: "Negative location" }, // negative
    ],
  },
  {
    name: "TrackEpisodeSchema",
    schema: TrackEpisodeSchema,
    validData: { episodeId: 1, rating: 5, notes: "Great episode!" },
    invalidData: [
      { episodeId: 1, rating: 0, notes: "Rating too low" }, // rating < 1
      { episodeId: 1, rating: 6, notes: "Rating too high" }, // rating > 5
      { episodeId: -1, rating: 3, notes: "Negative episode" }, // negative id
    ],
  },
  {
    name: "PostCommentSchema",
    schema: PostCommentSchema,
    validData: { characterId: 1, content: "This is a valid comment" },
    invalidData: [
      { characterId: 1, content: "" }, // empty content
      { characterId: 0, content: "Zero character ID" }, // zero id
      { characterId: 1, content: "A".repeat(1001) }, // content too long
    ],
  },
  {
    name: "SubmitTriviaSchema",
    schema: SubmitTriviaSchema,
    validData: {
      entityType: "CHARACTER",
      entityId: 1,
      content: "Homer's favorite donut is the pink frosted sprinkled donut.",
    },
    invalidData: [
      { entityType: "INVALID", entityId: 1, content: "Invalid entity type" }, // wrong enum
      { entityType: "CHARACTER", entityId: 1, content: "Too short" }, // < 10 chars
      {
        entityType: "EPISODE",
        entityId: -1,
        content: "This is a valid length trivia",
      }, // negative
    ],
  },
];

// Run tests
console.log("\n🧪 TESTING ZOD VALIDATIONS\n");
console.log("=".repeat(60));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n📋 ${testCase.name}`);

  // Test valid data
  const validResult = testCase.schema.safeParse(testCase.validData);
  if (validResult.success) {
    console.log("   ✅ Valid data accepted");
    passed++;
  } else {
    console.log("   ❌ Valid data rejected (UNEXPECTED)");
    console.log("      ", validResult.error.issues);
    failed++;
  }

  // Test invalid data
  for (let i = 0; i < testCase.invalidData.length; i++) {
    const invalidResult = testCase.schema.safeParse(testCase.invalidData[i]);
    if (!invalidResult.success) {
      console.log(`   ✅ Invalid data #${i + 1} rejected correctly`);
      console.log(`      Reason: ${invalidResult.error.issues[0]?.message}`);
      passed++;
    } else {
      console.log(`   ❌ Invalid data #${i + 1} accepted (UNEXPECTED)`);
      console.log("      ", testCase.invalidData[i]);
      failed++;
    }
  }
}

console.log("\n" + "=".repeat(60));
console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log("✨ ALL ZOD VALIDATION TESTS PASSED ✨\n");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED\n");
  process.exit(1);
}
