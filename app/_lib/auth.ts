import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { queryOne } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
import type { DBUser } from "@/app/_lib/db-types";

/**
 * Obtiene el usuario autenticado actual desde la sesión de Better Auth.
 * 
 * @throws Error si no hay sesión activa o el usuario no existe en la BD
 * @returns DBUser - El usuario autenticado
 */
export async function getCurrentUser(): Promise<DBUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized: No active session");
  }

  // Obtener el usuario completo desde nuestra tabla de usuarios
  const user = await queryOne<DBUser>(
    `SELECT id, username, email, email_verified, image, name, password 
     FROM ${TABLES.users} 
     WHERE id = $1`,
    [session.user.id]
  );

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

/**
 * Verifica si hay un usuario autenticado sin lanzar error.
 * Útil para componentes que funcionan con/sin autenticación.
 * 
 * @returns DBUser | null
 */
export async function getCurrentUserOptional(): Promise<DBUser | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}
