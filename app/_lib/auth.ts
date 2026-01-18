import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { User } from "@prisma/client";

/**
 * Tipo para el usuario autenticado (subset of Prisma User)
 * Excluye campos sensibles como password
 */
export type AuthenticatedUser = Pick<
  User,
  "id" | "username" | "email" | "emailVerified" | "image" | "name"
>;

/**
 * Obtiene el usuario autenticado actual desde la sesión de Better Auth.
 *
 * @throws Error si no hay sesión activa
 * @returns AuthenticatedUser - El usuario autenticado
 */
export async function getCurrentUser(): Promise<AuthenticatedUser> {
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
    emailVerified: session.user.emailVerified || null,
    image: session.user.image || null,
    name: session.user.name || null,
  };
}

/**
 * Verifica si hay un usuario autenticado sin lanzar error.
 * Útil para componentes que funcionan con/sin autenticación.
 *
 * @returns AuthenticatedUser | null
 */
export async function getCurrentUserOptional(): Promise<AuthenticatedUser | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}
