import { Pool, neonConfig } from "@neondatabase/serverless";

// Enable HTTP connection for better compatibility with serverless environments
neonConfig.poolQueryViaFetch = true;

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
