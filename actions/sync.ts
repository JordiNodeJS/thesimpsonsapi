"use server";

import { prisma } from "@/lib/db";
import type { APICharacter, APIEpisode, APILocation } from "@/lib/types";

const API_BASE = "https://thesimpsonsapi.com/api";
const CDN_BASE = "https://cdn.thesimpsonsapi.com/500";

/**
 * Fetches all pages from a paginated API endpoint.
 */
async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const allData: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}?page=${page}&limit=20`);
      if (!res.ok) break;

      const data = await res.json();
      const items = (data.results || data.data || []) as T[];

      if (Array.isArray(items) && items.length > 0) {
        allData.push(...items);
        hasMore = Boolean(data.next);
        page++;
      } else {
        hasMore = false;
      }
    } catch (e) {
      console.error(`Error fetching ${endpoint} page ${page}`, e);
      hasMore = false;
    }
  }
  return allData;
}

/**
 * Builds a CDN image URL from an API path.
 */
function buildImageUrl(path: string | null | undefined): string | null {
  return path ? `${CDN_BASE}${path}` : null;
}

/**
 * Upserts a character into the database using Prisma.
 */
async function upsertCharacter(char: APICharacter): Promise<void> {
  await prisma.character.upsert({
    where: { externalId: char.id },
    update: {
      name: char.name,
      occupation: char.occupation,
      imageUrl: buildImageUrl(char.portrait_path),
    },
    create: {
      externalId: char.id,
      name: char.name,
      occupation: char.occupation,
      imageUrl: buildImageUrl(char.portrait_path),
    },
  });
}

/**
 * Upserts an episode into the database using Prisma.
 */
async function upsertEpisode(ep: APIEpisode): Promise<void> {
  await prisma.episode.upsert({
    where: { externalId: ep.id },
    update: {
      title: ep.name,
      season: ep.season,
      episodeNumber: ep.episode_number,
      synopsis: ep.synopsis,
      imageUrl: buildImageUrl(ep.image_path),
    },
    create: {
      externalId: ep.id,
      title: ep.name,
      season: ep.season,
      episodeNumber: ep.episode_number,
      synopsis: ep.synopsis,
      imageUrl: buildImageUrl(ep.image_path),
    },
  });
}

/**
 * Upserts a location into the database using Prisma.
 */
async function upsertLocation(loc: APILocation): Promise<void> {
  await prisma.location.upsert({
    where: { externalId: loc.id },
    update: {
      name: loc.name,
    },
    create: {
      externalId: loc.id,
      name: loc.name,
    },
  });
}

export interface SyncResult {
  success: boolean;
  counts?: { characters: number; episodes: number; locations: number };
  error?: unknown;
}

/**
 * Syncs all data from the external Simpsons API to the database.
 */
export async function syncExternalData(): Promise<SyncResult> {
  try {
    console.log("Starting sync...");

    // Fetch all data in parallel
    const [characters, episodes, locations] = await Promise.all([
      fetchAllPages<APICharacter>("characters"),
      fetchAllPages<APIEpisode>("episodes"),
      fetchAllPages<APILocation>("locations"),
    ]);

    console.log(
      `Fetched: ${characters.length} characters, ${episodes.length} episodes, ${locations.length} locations`,
    );

    // Upsert all records
    await Promise.all([
      ...characters.map(upsertCharacter),
      ...episodes.map(upsertEpisode),
      ...locations.map(upsertLocation),
    ]);

    console.log("Sync complete!");
    return {
      success: true,
      counts: {
        characters: characters.length,
        episodes: episodes.length,
        locations: locations.length,
      },
    };
  } catch (error) {
    console.error("Sync failed:", error);
    return { success: false, error };
  }
}
