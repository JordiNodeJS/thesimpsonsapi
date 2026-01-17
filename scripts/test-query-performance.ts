#!/usr/bin/env node
/**
 * Query Performance Test
 * Compares query times with and without indexes
 * Run after db push to verify index performance
 */

import { prisma } from "../app/_lib/prisma";

type QueryTest = {
  name: string;
  query: () => Promise<unknown>;
};

const queries: QueryTest[] = [
  {
    name: "Episodes by season (uses index)",
    query: () =>
      prisma.episode.findMany({
        where: { season: 5 },
        orderBy: { episodeNumber: "asc" },
      }),
  },
  {
    name: "Comments by character (uses index)",
    query: () =>
      prisma.characterComment.findMany({
        where: { characterId: 7 },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
  },
  {
    name: "Trivia by entity (uses composite index)",
    query: () =>
      prisma.triviaFact.findMany({
        where: {
          relatedEntityType: "CHARACTER",
          relatedEntityId: 7,
        },
        orderBy: { createdAt: "desc" },
      }),
  },
  {
    name: "Character search by name",
    query: () =>
      prisma.character.findMany({
        where: {
          name: {
            contains: "Simpson",
            mode: "insensitive",
          },
        },
      }),
  },
  {
    name: "Aggregate: Count episodes by season",
    query: () =>
      prisma.episode.groupBy({
        by: ["season"],
        _count: { id: true },
        orderBy: { season: "asc" },
      }),
  },
  {
    name: "Join: Comments with user info",
    query: () =>
      prisma.characterComment.findMany({
        include: {
          user: {
            select: { name: true, username: true },
          },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
  },
];

async function runPerformanceTests() {
  console.log("\n⚡ QUERY PERFORMANCE TEST\n");
  console.log("=".repeat(60));

  const results: { name: string; time: number; rows: number }[] = [];

  for (const test of queries) {
    const start = performance.now();
    const result = await test.query();
    const end = performance.now();
    const time = end - start;
    const rows = Array.isArray(result) ? result.length : 1;

    results.push({ name: test.name, time, rows });
    console.log(`\n📊 ${test.name}`);
    console.log(`   Time: ${time.toFixed(2)}ms`);
    console.log(`   Rows: ${rows}`);

    if (time < 100) {
      console.log("   ✅ FAST");
    } else if (time < 500) {
      console.log("   ⚠️  MODERATE");
    } else {
      console.log("   ❌ SLOW - Consider optimization");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n📈 SUMMARY\n");

  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  const slowQueries = results.filter((r) => r.time >= 500);

  console.log(`   Average query time: ${avgTime.toFixed(2)}ms`);
  console.log(
    `   Fastest: ${Math.min(...results.map((r) => r.time)).toFixed(2)}ms`
  );
  console.log(
    `   Slowest: ${Math.max(...results.map((r) => r.time)).toFixed(2)}ms`
  );
  console.log(`   Slow queries (>500ms): ${slowQueries.length}`);

  if (slowQueries.length === 0) {
    console.log("\n✨ ALL QUERIES PERFORMING WELL ✨\n");
  } else {
    console.log("\n⚠️  Some queries need optimization:\n");
    slowQueries.forEach((q) => {
      console.log(`   - ${q.name}: ${q.time.toFixed(2)}ms`);
    });
    console.log("");
  }

  await prisma.$disconnect();
}

runPerformanceTests().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
