import { Pool, neonConfig } from "@neondatabase/serverless";

// Enable HTTP connection for better compatibility with serverless environments
neonConfig.fetchConnection = true;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing from environment variables!");
  throw new Error("DATABASE_URL is not defined");
}

console.log("Database connection initialized with search_path: the_simpson");

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
