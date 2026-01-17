#!/usr/bin/env node
/**
 * Script to fix orphan records before applying schema changes
 * Finds and removes records that reference non-existent users
 */

import { prisma } from "../app/_lib/prisma";

async function fixOrphanRecords() {
  console.log("🔍 Checking for orphan records...\n");

  try {
    // Get all user IDs
    const users = await prisma.user.findMany({ select: { id: true } });
    const userIds = new Set(users.map((u) => u.id));
    console.log(`Found ${userIds.size} users in database`);

    // Check character_comments for orphans
    const comments = await prisma.characterComment.findMany({
      select: { id: true, userId: true },
    });
    const orphanComments = comments.filter(
      (c) => c.userId && !userIds.has(c.userId)
    );

    if (orphanComments.length > 0) {
      console.log(`\n⚠️  Found ${orphanComments.length} orphan comments`);
      console.log("   Deleting orphan comments...");
      await prisma.characterComment.deleteMany({
        where: {
          id: { in: orphanComments.map((c) => c.id) },
        },
      });
      console.log("   ✅ Orphan comments deleted");
    } else {
      console.log("\n✅ No orphan comments found");
    }

    // Check character_follows for orphans
    const follows = await prisma.characterFollow.findMany({
      select: { userId: true, characterId: true },
    });
    const orphanFollows = follows.filter((f) => !userIds.has(f.userId));

    if (orphanFollows.length > 0) {
      console.log(`\n⚠️  Found ${orphanFollows.length} orphan follows`);
      for (const f of orphanFollows) {
        await prisma.characterFollow.delete({
          where: {
            userId_characterId: {
              userId: f.userId,
              characterId: f.characterId,
            },
          },
        });
      }
      console.log("   ✅ Orphan follows deleted");
    } else {
      console.log("✅ No orphan follows found");
    }

    // Check diary_entries for orphans
    const diaries = await prisma.diaryEntry.findMany({
      select: { id: true, userId: true },
    });
    const orphanDiaries = diaries.filter(
      (d) => d.userId && !userIds.has(d.userId)
    );

    if (orphanDiaries.length > 0) {
      console.log(`\n⚠️  Found ${orphanDiaries.length} orphan diary entries`);
      await prisma.diaryEntry.deleteMany({
        where: {
          id: { in: orphanDiaries.map((d) => d.id) },
        },
      });
      console.log("   ✅ Orphan diary entries deleted");
    } else {
      console.log("✅ No orphan diary entries found");
    }

    // Check trivia_facts for orphans
    const trivia = await prisma.triviaFact.findMany({
      select: { id: true, submittedByUserId: true },
    });
    const orphanTrivia = trivia.filter(
      (t) => t.submittedByUserId && !userIds.has(t.submittedByUserId)
    );

    if (orphanTrivia.length > 0) {
      console.log(`\n⚠️  Found ${orphanTrivia.length} orphan trivia facts`);
      await prisma.triviaFact.deleteMany({
        where: {
          id: { in: orphanTrivia.map((t) => t.id) },
        },
      });
      console.log("   ✅ Orphan trivia facts deleted");
    } else {
      console.log("✅ No orphan trivia facts found");
    }

    // Check quote_collections for orphans
    const collections = await prisma.quoteCollection.findMany({
      select: { id: true, userId: true },
    });
    const orphanCollections = collections.filter(
      (c) => c.userId && !userIds.has(c.userId)
    );

    if (orphanCollections.length > 0) {
      console.log(
        `\n⚠️  Found ${orphanCollections.length} orphan quote collections`
      );
      await prisma.quoteCollection.deleteMany({
        where: {
          id: { in: orphanCollections.map((c) => c.id) },
        },
      });
      console.log("   ✅ Orphan quote collections deleted");
    } else {
      console.log("✅ No orphan quote collections found");
    }

    // Check user_episode_progress for orphans
    const progress = await prisma.userEpisodeProgress.findMany({
      select: { userId: true, episodeId: true },
    });
    const orphanProgress = progress.filter((p) => !userIds.has(p.userId));

    if (orphanProgress.length > 0) {
      console.log(
        `\n⚠️  Found ${orphanProgress.length} orphan episode progress`
      );
      for (const p of orphanProgress) {
        await prisma.userEpisodeProgress.delete({
          where: {
            userId_episodeId: {
              userId: p.userId,
              episodeId: p.episodeId,
            },
          },
        });
      }
      console.log("   ✅ Orphan episode progress deleted");
    } else {
      console.log("✅ No orphan episode progress found");
    }

    console.log("\n✨ Orphan record cleanup complete!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrphanRecords();
