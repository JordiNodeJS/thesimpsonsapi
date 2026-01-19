/**
 * Prisma RLS (Row Level Security) Integration
 *
 * Este módulo proporciona utilidades para integrar PostgreSQL RLS
 * con Prisma ORM y Better Auth.
 *
 * IMPORTANTE:
 * - RLS requiere establecer `app.current_user_id` en cada transacción
 * - Prisma no hace esto automáticamente, por lo que usamos middleware
 * - La función `withRLS()` garantiza que el userId se establezca correctamente
 */

import { PrismaClient } from "@prisma/client";
import { getCurrentUserOptional, type AuthenticatedUser } from "./auth";

/**
 * Tipo para el cliente Prisma dentro de una transacción
 */
export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Ejecuta una operación de base de datos con RLS habilitado.
 *
 * Esta función garantiza que:
 * 1. El userId se establece en la sesión PostgreSQL
 * 2. Todas las políticas RLS se evalúan correctamente
 * 3. La operación se ejecuta dentro de una transacción
 *
 * @param prisma - Cliente Prisma
 * @param userId - ID del usuario autenticado
 * @param callback - Función que ejecuta operaciones con Prisma
 * @returns Resultado de la callback
 *
 * @example
 * ```typescript
 * import { prisma } from "@/app/_lib/prisma";
 * import { getCurrentUser } from "@/app/_lib/auth";
 * import { withRLS } from "@/app/_lib/prisma-rls";
 *
 * export async function getDiaryEntries() {
 *   const user = await getCurrentUser();
 *
 *   return withRLS(prisma, user.id, async (tx) => {
 *     // RLS automáticamente filtra solo entradas del usuario
 *     return tx.diaryEntry.findMany({
 *       orderBy: { entryDate: "desc" },
 *     });
 *   });
 * }
 * ```
 */
export async function withRLS<T>(
  prisma: PrismaClient,
  userId: string,
  callback: (tx: PrismaTransaction) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Establecer el userId en la sesión PostgreSQL
    // Usa parámetros para prevenir SQL injection
    await tx.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;

    // Ejecutar la callback con el contexto RLS establecido
    return callback(tx);
  });
}

/**
 * Versión sin autenticación de withRLS (para operaciones públicas)
 *
 * Esta función NO establece `app.current_user_id`, lo que significa:
 * - Solo funciona con tablas que tienen políticas `USING (true)`
 * - No puede insertar/actualizar en tablas con RLS que requieren userId
 *
 * @param prisma - Cliente Prisma
 * @param callback - Función que ejecuta operaciones con Prisma
 * @returns Resultado de la callback
 *
 * @example
 * ```typescript
 * // Lectura pública de comentarios (permitido por política SELECT)
 * export async function getPublicComments(characterId: number) {
 *   return withoutRLS(prisma, async (tx) => {
 *     return tx.characterComment.findMany({
 *       where: { characterId },
 *       orderBy: { createdAt: "desc" },
 *     });
 *   });
 * }
 * ```
 */
export async function withoutRLS<T>(
  prisma: PrismaClient,
  callback: (tx: PrismaTransaction) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // No establecer app.current_user_id
    // Las políticas RLS con USING (true) permitirán lectura
    return callback(tx);
  });
}

/**
 * Wrapper automático que obtiene el usuario actual y ejecuta con RLS
 *
 * Esta es una versión de conveniencia que combina `getCurrentUser()` + `withRLS()`.
 *
 * @param prisma - Cliente Prisma
 * @param callback - Función que ejecuta operaciones con Prisma
 * @returns Resultado de la callback
 * @throws Error si no hay usuario autenticado
 *
 * @example
 * ```typescript
 * export async function createDiaryEntry(data: CreateDiaryEntryInput) {
 *   return withAuthenticatedRLS(prisma, async (tx, user) => {
 *     return tx.diaryEntry.create({
 *       data: {
 *         userId: user.id,
 *         activityDescription: data.activityDescription,
 *         characterId: data.characterId,
 *         entryDate: new Date(),
 *       },
 *     });
 *   });
 * }
 * ```
 */
export async function withAuthenticatedRLS<T>(
  prisma: PrismaClient,
  callback: (tx: PrismaTransaction, user: AuthenticatedUser) => Promise<T>,
): Promise<T> {
  // Obtener usuario autenticado (lanza error si no hay sesión)
  const user = await getCurrentUserOptional();

  if (!user) {
    throw new Error("Unauthorized: No active session");
  }

  return withRLS(prisma, user.id, (tx) => callback(tx, user));
}

/**
 * Wrapper opcional que ejecuta con RLS si hay usuario, sin RLS si no hay
 *
 * Útil para endpoints que funcionan con/sin autenticación.
 *
 * @param prisma - Cliente Prisma
 * @param callback - Función que ejecuta operaciones con Prisma
 * @returns Resultado de la callback
 *
 * @example
 * ```typescript
 * export async function getCharacterComments(characterId: number) {
 *   return withOptionalRLS(prisma, async (tx, user) => {
 *     // Si hay usuario, RLS filtra automáticamente
 *     // Si no hay usuario, políticas PUBLIC permiten lectura
 *     return tx.characterComment.findMany({
 *       where: { characterId },
 *       include: {
 *         user: {
 *           select: { id: true, username: true, image: true },
 *         },
 *       },
 *       orderBy: { createdAt: "desc" },
 *     });
 *   });
 * }
 * ```
 */
export async function withOptionalRLS<T>(
  prisma: PrismaClient,
  callback: (
    tx: PrismaTransaction,
    user: AuthenticatedUser | null,
  ) => Promise<T>,
): Promise<T> {
  const user = await getCurrentUserOptional();

  if (user) {
    // Usuario autenticado: usar RLS
    return withRLS(prisma, user.id, (tx) => callback(tx, user));
  } else {
    // Sin autenticación: ejecutar sin RLS
    return withoutRLS(prisma, (tx) => callback(tx, null));
  }
}

/**
 * Helper para verificar si un usuario es owner de un recurso
 *
 * Esta función NO depende de RLS, es una verificación explícita.
 * Útil para lógica de negocio fuera de queries.
 *
 * @param resourceUserId - El userId del recurso a verificar
 * @param currentUserId - El userId del usuario actual
 * @returns true si el usuario es owner
 *
 * @example
 * ```typescript
 * export async function deleteDiaryEntry(entryId: number) {
 *   const user = await getCurrentUser();
 *
 *   const entry = await prisma.diaryEntry.findUnique({
 *     where: { id: entryId },
 *   });
 *
 *   if (!entry || !isOwner(entry.userId, user.id)) {
 *     throw new Error("Not authorized to delete this entry");
 *   }
 *
 *   // RLS también bloqueará esto, pero es buena práctica verificar explícitamente
 *   return prisma.diaryEntry.delete({ where: { id: entryId } });
 * }
 * ```
 */
export function isOwner(
  resourceUserId: string | null | undefined,
  currentUserId: string,
): boolean {
  return resourceUserId === currentUserId;
}
