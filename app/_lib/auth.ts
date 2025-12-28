import { queryOne } from "@/app/_lib/db-utils";
import type { DBUser } from "@/app/_lib/db-types";

/**
 * Obtiene el usuario actual o lo crea si no existe.
 * En una app real, esto vendría de una sesión/cookie.
 */
export async function getCurrentUser(): Promise<DBUser> {
  const username = "SimpsonsFan";

  const user = await queryOne<DBUser>(
    `INSERT INTO users (username) VALUES ($1) 
     ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username 
     RETURNING id, username`,
    [username]
  );

  if (!user) {
    throw new Error("Failed to get or create user");
  }

  return user;
}
