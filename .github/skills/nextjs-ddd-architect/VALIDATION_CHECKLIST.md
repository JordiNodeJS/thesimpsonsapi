# Checklist de Validación DDD

Usa este checklist para validar que un dominio sigue los principios de DDD correctamente.

## ✅ Estructura de Carpetas

- [ ] Carpeta `domains/{domain-name}/` creada
- [ ] Subcarpetas: `components/`, `services/`, `actions/`, `store/`
- [ ] Archivo `index.ts` con exports públicos
- [ ] Archivo `types.ts` con tipos del dominio
- [ ] Archivo `schemas.ts` con validaciones Zod
- [ ] (Opcional) Archivo `constants.ts` si hay constantes del dominio

## ✅ Services (Lógica de Negocio)

- [ ] **Framework-agnostic:** No dependen de Next.js
- [ ] **Pure functions:** Entrada → salida, sin side effects ocultos
- [ ] **Single responsibility:** Cada service hace una cosa
- [ ] **Return types:** Todas las funciones tienen tipo de retorno explícito
- [ ] **Error handling:** Usan try/catch o dejan que errores propaguen
- [ ] **Testing:** Todos los services tienen unit tests

### Ejemplo Correcto

```typescript
// ✅ Service puro, testable, framework-agnostic
export async function getEpisodeById(id: number): Promise<Episode | null> {
  return await prisma.episode.findUnique({ where: { id } });
}
```

### Ejemplo Incorrecto

```typescript
// ❌ Service con dependencias de Next.js
import { cookies } from "next/headers";
export async function getEpisodeById(id: number) {
  const token = cookies().get("token"); // ❌ Dependencia de Next.js
  return await prisma.episode.findUnique({ where: { id } });
}
```

---

## ✅ Actions (Server Actions)

- [ ] **Separadas de services:** Actions orquestan, services ejecutan
- [ ] **Revalidation:** Llaman `revalidatePath()` cuando corresponde
- [ ] **Authentication:** Verifican sesión con `getCurrentUser()`
- [ ] **Validation:** Usan schemas de Zod para validar input
- [ ] **Error messages:** Devuelven mensajes user-friendly
- [ ] **Return type:** Siempre devuelven `{ success: boolean, data?: T, error?: string }`

### Ejemplo Correcto

```typescript
// ✅ Action con validación, auth y revalidation
"use server";

export async function trackEpisodeAction(input: TrackEpisodeInput) {
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in");

  const result = await trackEpisode(user.id, input);
  revalidatePath(`/episodes/${input.episodeId}`);

  return { success: true, data: result };
}
```

### Ejemplo Incorrecto

```typescript
// ❌ Action con lógica de negocio mezclada
"use server";

export async function trackEpisodeAction(episodeId: number, rating: number) {
  const user = await getCurrentUserOptional();

  // ❌ Lógica de negocio directamente en action
  await prisma.userEpisodeProgress.upsert({
    where: { userId_episodeId: { userId: user.id, episodeId } },
    update: { rating },
    create: { userId: user.id, episodeId, rating },
  });

  revalidatePath(`/episodes/${episodeId}`);
}
```

---

## ✅ Components

- [ ] **Domain-specific:** Componentes específicos del dominio
- [ ] **Composition:** Usan primitives de Shadcn UI
- [ ] **Props types:** Todas las props tienen tipos explícitos
- [ ] **Client directive:** Solo si usan hooks/eventos (`"use client"`)
- [ ] **Imports:** Solo importan de `@/components/ui` o mismo dominio
- [ ] **Testing:** Componentes interactivos tienen tests

### Ejemplo Correcto

```typescript
// ✅ Componente específico del dominio
interface EpisodeCardProps {
  episode: Episode;
  showTracker?: boolean;
}

export function EpisodeCard({ episode, showTracker = false }: EpisodeCardProps) {
  return (
    <Card>
      <CardHeader>{episode.title}</CardHeader>
      {showTracker && <EpisodeTracker episodeId={episode.id} />}
    </Card>
  );
}
```

### Ejemplo Incorrecto

```typescript
// ❌ Componente genérico sin tipado
export function Card({ data, type }) {
  // ❌ Sin tipos
  if (type === "episode") {
    /* ... */
  } // ❌ Lógica condicional por tipo
  if (type === "character") {
    /* ... */
  }
}
```

---

## ✅ Store (Client State)

- [ ] **Client-only:** Marcado con `"use client"`
- [ ] **Domain-scoped:** Estado solo del dominio actual
- [ ] **Zustand/Jotai:** Usa bibliotecas estándar
- [ ] **Type-safe:** Toda la interfaz tiene tipos
- [ ] **Minimal:** Solo estado que no viene del servidor
- [ ] **Exported via index.ts:** Accesible desde fuera del dominio

### Ejemplo Correcto

```typescript
// ✅ Store con tipos y estado mínimo
"use client";

interface EpisodesState {
  selectedSeason: number | null;
  setSelectedSeason: (season: number | null) => void;
}

export const useEpisodesStore = create<EpisodesState>((set) => ({
  selectedSeason: null,
  setSelectedSeason: (season) => set({ selectedSeason: season }),
}));
```

### Ejemplo Incorrecto

```typescript
// ❌ Store duplicando estado del servidor
export const useEpisodesStore = create((set) => ({
  episodes: [], // ❌ Duplica data del servidor
  fetchEpisodes: async () => {
    // ❌ Fetching en store
    const data = await fetch("/api/episodes");
    set({ episodes: data });
  },
}));
```

---

## ✅ Types y Schemas

- [ ] **Exported:** Todos los tipos públicos en `index.ts`
- [ ] **Zod schemas:** Para validación de inputs
- [ ] **Inferred types:** Tipos derivados de schemas (`z.infer<typeof Schema>`)
- [ ] **Domain entities:** Tipos core del dominio (Episode, User, etc.)
- [ ] **Input/Output types:** Tipos para actions y services

### Ejemplo Correcto

```typescript
// ✅ Schema con tipo inferido
export const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

export type TrackEpisodeInput = z.infer<typeof TrackEpisodeSchema>;
```

---

## ✅ Public API (index.ts)

- [ ] **Controlled exports:** Solo exports intencionales
- [ ] **Grouped by category:** Services, components, actions, types
- [ ] **No internal exports:** Helpers internos no exportados
- [ ] **Documented:** Comentarios para exports complejos

### Ejemplo Correcto

```typescript
// ✅ Public API bien organizada
// Services
export { getEpisodes } from "./services/getEpisodes";
export { getEpisodeById } from "./services/getEpisodeById";

// Actions
export { trackEpisodeAction } from "./actions/trackEpisodeAction";

// Components
export { EpisodeCard } from "./components/EpisodeCard";
export { EpisodeList } from "./components/EpisodeList";

// Types
export type { Episode, TrackEpisodeInput } from "./types";
```

### Ejemplo Incorrecto

```typescript
// ❌ Exports desorganizados
export * from "./services"; // ❌ Wildcard exports
export * from "./components";
export { internalHelper } from "./utils/helpers"; // ❌ Export interno
```

---

## ✅ Independence & Coupling

- [ ] **No cross-domain imports:** Dominios no se importan directamente
- [ ] **Dependency injection:** Dependencias inyectadas en boundaries
- [ ] **Shared types:** Tipos compartidos en `/shared/types.ts`
- [ ] **Event-driven:** Comunicación entre dominios via eventos

### Ejemplo Correcto

```typescript
// ✅ Dependency injection en boundary
// domains/orders/services/createOrder.ts
export async function createOrder(
  userId: string,
  getUserFn: (id: string) => Promise<User>, // Inyectado
) {
  const user = await getUserFn(userId);
  // ...
}

// app/orders/actions.ts
import { createOrder } from "@/domains/orders";
import { getUserById } from "@/domains/users";

export async function createOrderAction(userId: string) {
  return createOrder(userId, getUserById); // Inyección
}
```

### Ejemplo Incorrecto

```typescript
// ❌ Tight coupling entre dominios
import { getUserById } from "@/domains/users"; // ❌ Import directo

export async function createOrder(userId: string) {
  const user = await getUserById(userId); // ❌ Dependencia directa
  // ...
}
```

---

## ✅ Testing

- [ ] **Unit tests:** Services tienen tests unitarios
- [ ] **Integration tests:** Actions tienen tests de integración
- [ ] **Component tests:** Componentes interactivos tienen tests
- [ ] **Mocks:** Dependencias externas mockeadas
- [ ] **Coverage:** >80% coverage en services críticos

### Ejemplo Test Correcto

```typescript
// ✅ Test aislado con mocks
import { describe, it, expect, vi } from "vitest";
import { getEpisodeById } from "./getEpisodeById";
import { prisma } from "@/app/_lib/prisma";

vi.mock("@/app/_lib/prisma");

describe("getEpisodeById", () => {
  it("returns episode when found", async () => {
    const mockEpisode = { id: 1, title: "Test" };
    vi.mocked(prisma.episode.findUnique).mockResolvedValue(mockEpisode);

    const result = await getEpisodeById(1);
    expect(result).toEqual(mockEpisode);
  });
});
```

---

## ✅ Delivery Layer (App Router)

- [ ] **Minimal logic:** Pages solo orquestan
- [ ] **Import from domains:** Solo imports desde `@/domains/*`
- [ ] **No business logic:** Lógica en dominios, no en pages
- [ ] **Server components:** Default server, solo "use client" si necesario

### Ejemplo Correcto

```typescript
// ✅ Page solo orquesta
import { getEpisodes, EpisodeList } from "@/domains/episodes";

export default async function EpisodesPage() {
  const episodes = await getEpisodes();
  return <EpisodeList episodes={episodes} />;
}
```

### Ejemplo Incorrecto

```typescript
// ❌ Lógica de negocio en page
export default async function EpisodesPage() {
  // ❌ Query directa en page
  const episodes = await prisma.episode.findMany({
    where: { seasonNumber: { gte: 1 } },
    orderBy: { episodeNumber: "asc" },
  });

  // ❌ Transformación de datos en page
  const grouped = episodes.reduce((acc, ep) => {
    if (!acc[ep.seasonNumber]) acc[ep.seasonNumber] = [];
    acc[ep.seasonNumber].push(ep);
    return acc;
  }, {});

  return <div>{/* render */}</div>;
}
```

---

## 📊 Scorecard Final

Cuenta cuántos ✅ tienes en cada sección:

- **Estructura:** \_\_\_ / 6
- **Services:** \_\_\_ / 6
- **Actions:** \_\_\_ / 6
- **Components:** \_\_\_ / 6
- **Store:** \_\_\_ / 6
- **Types:** \_\_\_ / 5
- **Public API:** \_\_\_ / 4
- **Independence:** \_\_\_ / 4
- **Testing:** \_\_\_ / 5
- **Delivery Layer:** \_\_\_ / 4

**Total:** \_\_\_ / 52

### Interpretación

- **48-52:** Excelente implementación DDD ✅
- **40-47:** Buena implementación, pequeñas mejoras necesarias 🟡
- **30-39:** Implementación básica, varias mejoras requeridas 🟠
- **< 30:** Requiere refactoring significativo ❌

---

## 🚀 Quick Wins (Mejoras Rápidas)

Si tu score es < 40, empieza con estos fixes rápidos:

1. **Agregar tipos explícitos** a todas las funciones
2. **Mover lógica de negocio** de actions a services
3. **Crear `index.ts`** con exports controlados
4. **Agregar validación Zod** en todas las actions
5. **Separar store del servidor** (no duplicar data)
6. **Agregar tests unitarios** a services críticos
