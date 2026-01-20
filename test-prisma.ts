#!/usr/bin/env node

/**
 * Simple Prisma test to verify connection and queries
 */

import { prisma } from "./lib/db/prisma";

async function test() {
  try {
    console.log("\n🔍 Testing Prisma Connection...\n");

    // Test 1: Count characters
    console.log("1️⃣  Querying characters count...");
    const charCount = await prisma.character.count();
    console.log(`   ✅ Characters: ${charCount}`);

    // Test 2: Get first character
    console.log("\n2️⃣  Fetching first character...");
    const firstChar = await prisma.character.findFirst();
    if (firstChar) {
      console.log(`   ✅ Found: ${firstChar.name} (ID: ${firstChar.id})`);
      console.log(`      Occupation: ${firstChar.occupation}`);
      console.log(`      Image URL: ${firstChar.imageUrl}`);
    } else {
      console.log("   ⚠️  No characters found");
    }

    // Test 3: Count episodes
    console.log("\n3️⃣  Querying episodes count...");
    const epCount = await prisma.episode.count();
    console.log(`   ✅ Episodes: ${epCount}`);

    // Test 4: Get featured characters
    console.log("\n4️⃣  Fetching featured characters...");
    const featured = await prisma.character.findMany({
      where: {
        name: {
          in: ["Homer Simpson", "Marge Simpson", "Bart Simpson"],
        },
      },
    });
    console.log(`   ✅ Featured characters: ${featured.length}`);
    featured.forEach((char) => {
      console.log(`      - ${char.name}`);
    });

    console.log("\n✨ PRISMA TEST PASSED ✨\n");
  } catch (error) {
    console.error("\n❌ PRISMA TEST FAILED ❌\n");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

await test();
