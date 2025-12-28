import { Pool, neonConfig } from "@neondatabase/serverless";

// Enable HTTP connection for better compatibility with serverless environments
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
