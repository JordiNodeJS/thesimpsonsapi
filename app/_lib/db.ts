import { Pool, PoolClient } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Set search path for all connections in the pool
pool.on("connect", (client: PoolClient) => {
  client.query("SET search_path TO the_simpson, public");
});

export default pool;
