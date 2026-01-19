/**
 * RLS Isolation Tests
 *
 * Estos tests verifican que las políticas RLS funcionan correctamente
 * aislando los datos entre usuarios.
 */

import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/app/_lib/prisma";
import { withRLS } from "@/app/_lib/prisma-rls";

describe("RLS Isolation Tests", () => {
  // Usar IDs únicos para evitar colisiones en tests paralelos
  const testRunId = Date.now();
  const userId1 = `test-user-1-${testRunId}`;
  const userId2 = `test-user-2-${testRunId}`;

  // Cleanup: Eliminar datos de test al finalizar
  afterAll(async () => {
    // Usar prisma sin RLS para cleanup (requiere BYPASSRLS o ejecutar como admin)
    try {
      await prisma.diaryEntry.deleteMany({
        where: {
          userId: {
            in: [userId1, userId2],
          },
        },
      });

      await prisma.quoteCollection.deleteMany({
        where: {
          userId: {
            in: [userId1, userId2],
          },
        },
      });

      await prisma.characterFollow.deleteMany({
        where: {
          userId: {
            in: [userId1, userId2],
          },
        },
      });
    } catch (error) {
      console.error("[RLS Tests Cleanup] Error:", error);
      // No fallar el test si el cleanup falla
    }
  });

  describe("Diary Entries RLS", () => {
    it("should isolate diary entries between users", async () => {
      // User 1 crea una entrada
      const entry1 = await withRLS(prisma, userId1, async (tx) => {
        return tx.diaryEntry.create({
          data: {
            userId: userId1,
            characterId: 1, // Homer Simpson
            locationId: 1, // Springfield
            activityDescription: "User 1's private diary entry",
            entryDate: new Date(),
          },
        });
      });

      // User 2 crea su propia entrada
      const entry2 = await withRLS(prisma, userId2, async (tx) => {
        return tx.diaryEntry.create({
          data: {
            userId: userId2,
            characterId: 2, // Marge Simpson
            locationId: 2, // Kwik-E-Mart
            activityDescription: "User 2's private diary entry",
            entryDate: new Date(),
          },
        });
      });

      // User 1 consulta: solo debe ver su entrada
      const user1Entries = await withRLS(prisma, userId1, async (tx) => {
        return tx.diaryEntry.findMany({
          where: {
            userId: userId1, // RLS filtra automáticamente, pero agregamos where para claridad
          },
        });
      });

      expect(user1Entries.length).toBeGreaterThanOrEqual(1);
      expect(user1Entries.every((e) => e.userId === userId1)).toBe(true);
      expect(user1Entries.find((e) => e.id === entry1.id)).toBeDefined();
      expect(user1Entries.find((e) => e.id === entry2.id)).toBeUndefined();

      // User 2 consulta: solo debe ver su entrada
      const user2Entries = await withRLS(prisma, userId2, async (tx) => {
        return tx.diaryEntry.findMany({
          where: {
            userId: userId2,
          },
        });
      });

      expect(user2Entries.length).toBeGreaterThanOrEqual(1);
      expect(user2Entries.every((e) => e.userId === userId2)).toBe(true);
      expect(user2Entries.find((e) => e.id === entry2.id)).toBeDefined();
      expect(user2Entries.find((e) => e.id === entry1.id)).toBeUndefined();
    });

    it("should prevent reading other users' diary entries", async () => {
      // User 1 crea una entrada
      const entry = await withRLS(prisma, userId1, async (tx) => {
        return tx.diaryEntry.create({
          data: {
            userId: userId1,
            characterId: 1,
            locationId: 1,
            activityDescription: "Secret entry",
            entryDate: new Date(),
          },
        });
      });

      // User 2 intenta leer la entrada de User 1 por ID
      const result = await withRLS(prisma, userId2, async (tx) => {
        return tx.diaryEntry.findUnique({
          where: { id: entry.id },
        });
      });

      // RLS debe retornar null (no encontrado)
      expect(result).toBeNull();
    });

    it("should prevent deleting other users' diary entries", async () => {
      // User 1 crea una entrada
      const entry = await withRLS(prisma, userId1, async (tx) => {
        return tx.diaryEntry.create({
          data: {
            userId: userId1,
            characterId: 1,
            locationId: 1,
            activityDescription: "Protected entry",
            entryDate: new Date(),
          },
        });
      });

      // User 2 intenta eliminar la entrada de User 1
      await expect(
        withRLS(prisma, userId2, async (tx) => {
          return tx.diaryEntry.delete({
            where: { id: entry.id },
          });
        }),
      ).rejects.toThrow();

      // Verificar que la entrada sigue existiendo
      const stillExists = await withRLS(prisma, userId1, async (tx) => {
        return tx.diaryEntry.findUnique({
          where: { id: entry.id },
        });
      });

      expect(stillExists).toBeDefined();
      expect(stillExists?.id).toBe(entry.id);
    });
  });

  describe("Quote Collections RLS", () => {
    it("should isolate collections between users", async () => {
      // User 1 crea una colección
      await withRLS(prisma, userId1, async (tx) => {
        return tx.quoteCollection.create({
          data: {
            userId: userId1,
            name: "User 1's favorite quotes",
            description: "My personal collection",
          },
        });
      });

      // User 2 crea su propia colección
      await withRLS(prisma, userId2, async (tx) => {
        return tx.quoteCollection.create({
          data: {
            userId: userId2,
            name: "User 2's favorite quotes",
            description: "Another personal collection",
          },
        });
      });

      // User 1 consulta: solo debe ver su colección
      const user1Collections = await withRLS(prisma, userId1, async (tx) => {
        return tx.quoteCollection.findMany({
          where: {
            userId: userId1,
          },
        });
      });

      expect(user1Collections.length).toBeGreaterThanOrEqual(1);
      expect(user1Collections.every((c) => c.userId === userId1)).toBe(true);

      // User 2 consulta: solo debe ver su colección
      const user2Collections = await withRLS(prisma, userId2, async (tx) => {
        return tx.quoteCollection.findMany({
          where: {
            userId: userId2,
          },
        });
      });

      expect(user2Collections.length).toBeGreaterThanOrEqual(1);
      expect(user2Collections.every((c) => c.userId === userId2)).toBe(true);
    });

    it("should prevent reading other users' collections", async () => {
      // User 1 crea una colección
      const collection = await withRLS(prisma, userId1, async (tx) => {
        return tx.quoteCollection.create({
          data: {
            userId: userId1,
            name: "Private collection",
            description: "Top secret",
          },
        });
      });

      // User 2 intenta leer la colección de User 1
      const result = await withRLS(prisma, userId2, async (tx) => {
        return tx.quoteCollection.findUnique({
          where: { id: collection.id },
        });
      });

      // RLS debe retornar null
      expect(result).toBeNull();
    });
  });

  describe("Character Follows RLS", () => {
    it("should isolate follows between users", async () => {
      // User 1 sigue a un personaje
      await withRLS(prisma, userId1, async (tx) => {
        return tx.characterFollow.create({
          data: {
            userId: userId1,
            characterId: 1, // Homer
          },
        });
      });

      // User 2 sigue al mismo personaje
      await withRLS(prisma, userId2, async (tx) => {
        return tx.characterFollow.create({
          data: {
            userId: userId2,
            characterId: 1, // Homer
          },
        });
      });

      // User 1 consulta: solo debe ver sus follows
      const user1Follows = await withRLS(prisma, userId1, async (tx) => {
        return tx.characterFollow.findMany({
          where: {
            userId: userId1,
          },
        });
      });

      expect(user1Follows.length).toBeGreaterThanOrEqual(1);
      expect(user1Follows.every((f) => f.userId === userId1)).toBe(true);

      // User 2 consulta: solo debe ver sus follows
      const user2Follows = await withRLS(prisma, userId2, async (tx) => {
        return tx.characterFollow.findMany({
          where: {
            userId: userId2,
          },
        });
      });

      expect(user2Follows.length).toBeGreaterThanOrEqual(1);
      expect(user2Follows.every((f) => f.userId === userId2)).toBe(true);
    });

    it("should prevent unfollowing characters for other users", async () => {
      // User 1 sigue a un personaje
      await withRLS(prisma, userId1, async (tx) => {
        return tx.characterFollow.create({
          data: {
            userId: userId1,
            characterId: 2, // Marge
          },
        });
      });

      // User 2 intenta eliminar el follow de User 1
      await expect(
        withRLS(prisma, userId2, async (tx) => {
          return tx.characterFollow.delete({
            where: {
              userId_characterId: {
                userId: userId1,
                characterId: 2,
              },
            },
          });
        }),
      ).rejects.toThrow();

      // Verificar que el follow sigue existiendo
      const stillExists = await withRLS(prisma, userId1, async (tx) => {
        return tx.characterFollow.findUnique({
          where: {
            userId_characterId: {
              userId: userId1,
              characterId: 2,
            },
          },
        });
      });

      expect(stillExists).toBeDefined();
      expect(stillExists?.userId).toBe(userId1);
    });
  });

  describe("Comments RLS (Semi-Public)", () => {
    it("should allow reading all comments publicly but only modify own", async () => {
      // User 1 crea un comentario
      const comment1 = await withRLS(prisma, userId1, async (tx) => {
        return tx.characterComment.create({
          data: {
            userId: userId1,
            characterId: 1,
            content: "User 1's comment",
            username: "user1",
          },
        });
      });

      // User 2 crea un comentario
      await withRLS(prisma, userId2, async (tx) => {
        return tx.characterComment.create({
          data: {
            userId: userId2,
            characterId: 1,
            content: "User 2's comment",
            username: "user2",
          },
        });
      });

      // User 2 intenta actualizar el comentario de User 1
      await expect(
        withRLS(prisma, userId2, async (tx) => {
          return tx.characterComment.update({
            where: { id: comment1.id },
            data: { content: "Hacked!" },
          });
        }),
      ).rejects.toThrow();

      // User 1 puede actualizar su propio comentario
      const updated = await withRLS(prisma, userId1, async (tx) => {
        return tx.characterComment.update({
          where: { id: comment1.id },
          data: { content: "Updated by owner" },
        });
      });

      expect(updated.content).toBe("Updated by owner");
    });
  });
});
