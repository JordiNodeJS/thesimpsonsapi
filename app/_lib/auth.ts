import { pool } from "@/app/_lib/db";

export async function getCurrentUser() {
  const client = await pool.connect();
  try {
    // For this demo, we'll always use a default user "SimpsonsFan"
    // In a real app, this would come from a session/cookie
    const username = "SimpsonsFan";

    const res = await client.query(
      `INSERT INTO users (username) VALUES ($1) 
       ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username 
       RETURNING id, username`,
      [username]
    );

    return res.rows[0];
  } finally {
    client.release();
  }
}
