import { Pool, neonConfig } from "@neondatabase/serverless";

// Disable HTTP connection to ensure search_path from connection string is respected
// poolQueryViaFetch ignores session-level parameters like search_path
neonConfig.poolQueryViaFetch = false;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Add search_path to connection string if not present
let connectionString = process.env.DATABASE_URL;
if (!connectionString.includes("search_path")) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString += `${separator}options=-c%20search_path%3Dthe_simpson,public`;
}

export const pool = new Pool({
  connectionString,
});

export default pool;
