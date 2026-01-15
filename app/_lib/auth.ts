import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { DBUser } from "@/app/_lib/db-types";

/**
 * Obtiene el usuario autenticado actual desde la sesión de Better Auth.
 *
 * @throws Error si no hay sesión activa
 * @returns DBUser - El usuario autenticado
 */
export async function getCurrentUser(): Promise<DBUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized: No active session");
  }

  // Retornar el usuario desde la sesión de Better Auth
  // La sesión contiene toda la información necesaria del usuario
  return {
    id: session.user.id,
    username: session.user.name || session.user.email?.split("@")[0] || "User",
    email: session.user.email || null,
    email_verified: session.user.emailVerified || null,
    image: session.user.image || null,
    name: session.user.name || null,
    password: null, // No incluir la contraseña en memoria
  };
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
