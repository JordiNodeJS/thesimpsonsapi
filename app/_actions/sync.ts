"use server";

import { pool } from "@/app/_lib/db";

const API_BASE = "https://thesimpsonsapi.com/api";

async function fetchAll(endpoint: string) {
  let allData: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}?page=${page}&limit=20`);
      if (!res.ok) break;

      const data = await res.json();
      // The API returns { results: [...] } or { data: [...] } depending on endpoint version?
      // Based on curl, it is 'results' for characters. Let's check both.
      const items = data.results || data.data || [];

      if (items && Array.isArray(items) && items.length > 0) {
        allData = [...allData, ...items];

        if (data.next) {
          page++;
        } else {
          hasMore = false;
        }
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

export async function syncExternalData() {
  const client = await pool.connect();
  try {
    console.log("Starting sync...");

    // 1. Characters
    // Note: The API endpoint is /characters
    const characters = await fetchAll("characters");
    console.log(`Fetched ${characters.length} characters`);

    for (const char of characters) {
      await client.query(
        `
        INSERT INTO characters (external_id, name, occupation, image_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (external_id) DO UPDATE 
        SET name = EXCLUDED.name, 
            occupation = EXCLUDED.occupation, 
            image_url = EXCLUDED.image_url
      `,
        [
          char.id,
          char.name,
          char.occupation,
          char.portrait_path
            ? `https://cdn.thesimpsonsapi.com/500${char.portrait_path}`
            : null,
        ]
      );
    }

    // 2. Episodes
    const episodes = await fetchAll("episodes");
    console.log(`Fetched ${episodes.length} episodes`);

    for (const ep of episodes) {
      await client.query(
        `
        INSERT INTO episodes (external_id, title, season, episode_number, synopsis, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (external_id) DO UPDATE 
        SET title = EXCLUDED.title, 
            season = EXCLUDED.season, 
            episode_number = EXCLUDED.episode_number, 
            synopsis = EXCLUDED.synopsis, 
            image_url = EXCLUDED.image_url
      `,
        [
          ep.id,
          ep.name,
          ep.season,
          ep.episode_number,
          ep.synopsis,
          ep.image_path
            ? `https://cdn.thesimpsonsapi.com/500${ep.image_path}`
            : null,
        ]
      );
    }

    // 3. Locations
    const locations = await fetchAll("locations");
    console.log(`Fetched ${locations.length} locations`);

    for (const loc of locations) {
      await client.query(
        `
        INSERT INTO locations (external_id, name)
        VALUES ($1, $2)
        ON CONFLICT (external_id) DO UPDATE 
        SET name = EXCLUDED.name
      `,
        [loc.id, loc.name]
      );
    }

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
  } finally {
    client.release();
  }
}
