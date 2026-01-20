# Ejemplo de Migración DDD - The Simpsons API

Este documento muestra un ejemplo práctico de cómo migrar el proyecto actual hacia arquitectura DDD usando la skill `nextjs-ddd-architect`.

## Estado Actual (Estructura Mixta)

```
app/
  _actions/
    episodes.ts          # ❌ Server actions mezcladas
    diary.ts
    social.ts
    collections.ts
    trivia.ts
  _components/
    EpisodeTracker.tsx   # ❌ Componentes sin dominio claro
    CommentSection.tsx
    FollowButton.tsx
    DiaryForm.tsx
  _lib/
    repositories.ts      # ❌ Queries de múltiples dominios mezcladas
    auth.ts
    prisma.ts
    hooks.ts
```

## Estado Propuesto (DDD)

```
domains/
  episodes/
    components/
      EpisodeCard.tsx
      EpisodeTracker.tsx
      EpisodeList.tsx
      EpisodeFilters.tsx
    services/
      getEpisodes.ts
      getEpisodeById.ts
      trackEpisode.ts
      rateEpisode.ts
    actions/
      trackEpisodeAction.ts
      rateEpisodeAction.ts
    store/
      useEpisodesStore.ts
    types.ts
    schemas.ts
    index.ts

  diary/
    components/
      DiaryForm.tsx
      DiaryEntryCard.tsx
      DiaryEntryList.tsx
    services/
      getDiaryEntries.ts
      createDiaryEntry.ts
      updateDiaryEntry.ts
      deleteDiaryEntry.ts
    actions/
      createDiaryEntryAction.ts
      updateDiaryEntryAction.ts
      deleteDiaryEntryAction.ts
    types.ts
    schemas.ts
    index.ts

  social/
    components/
      CommentSection.tsx
      FollowButton.tsx
      CommentForm.tsx
    services/
      getComments.ts
      addComment.ts
      toggleFollow.ts
    actions/
      addCommentAction.ts
      toggleFollowAction.ts
    types.ts
    schemas.ts
    index.ts

  characters/
    components/
      CharacterCard.tsx
      CharacterList.tsx
      CharacterImage.tsx
    services/
      getCharacters.ts
      getCharacterById.ts
    types.ts
    index.ts

  collections/
    components/
      CreateCollectionForm.tsx
      CollectionCard.tsx
    services/
      getCollections.ts
      createCollection.ts
    actions/
      createCollectionAction.ts
    types.ts
    schemas.ts
    index.ts

  trivia/
    components/
      TriviaSection.tsx
      TriviaQuestion.tsx
    services/
      getTriviaQuestions.ts
    actions/
      submitTriviaAnswerAction.ts
    types.ts
    schemas.ts
    index.ts

app/
  episodes/
    page.tsx           # ✅ Solo orquestación
    [id]/page.tsx
  diary/
    page.tsx
  characters/
    page.tsx
    [id]/page.tsx
  collections/
    page.tsx
  _lib/
    prisma.ts          # ✅ Solo infraestructura
    auth.ts
    utils.ts
```

---

## Paso a Paso: Migración del Dominio "Episodes"

### 1. Crear Estructura de Dominio

```bash
mkdir -p domains/episodes/{components,services,actions,store}
touch domains/episodes/index.ts
touch domains/episodes/types.ts
touch domains/episodes/schemas.ts
```

### 2. Mover Tipos y Schemas

**Antes:** `app/_lib/types.ts` (mixto)

```typescript
export interface Episode {
  id: number;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
}
```

**Después:** `domains/episodes/types.ts`

```typescript
export interface Episode {
  id: number;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  airDate: Date | null;
  description: string | null;
}

export interface EpisodeWithProgress extends Episode {
  userProgress?: {
    watched: boolean;
    rating: number | null;
  };
}

export interface TrackEpisodeInput {
  episodeId: number;
  rating: number;
}
```

**Schemas:** `domains/episodes/schemas.ts`

```typescript
import { z } from "zod";

export const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

export type TrackEpisodeInput = z.infer<typeof TrackEpisodeSchema>;
```

### 3. Mover Services (desde repositories.ts)

**Antes:** `app/_lib/repositories.ts`

```typescript
export async function findAllEpisodes() {
  return await prisma.episode.findMany({
    orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
  });
}

export async function findEpisodeById(id: number) {
  return await prisma.episode.findUnique({
    where: { id },
  });
}
```

**Después:** `domains/episodes/services/getEpisodes.ts`

```typescript
import { prisma } from "@/app/_lib/prisma";
import type { Episode } from "../types";

export async function getEpisodes(): Promise<Episode[]> {
  return await prisma.episode.findMany({
    orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
  });
}
```

**Después:** `domains/episodes/services/getEpisodeById.ts`

```typescript
import { prisma } from "@/app/_lib/prisma";
import type { Episode } from "../types";

export async function getEpisodeById(id: number): Promise<Episode | null> {
  return await prisma.episode.findUnique({
    where: { id },
  });
}
```

**Nuevo:** `domains/episodes/services/trackEpisode.ts`

```typescript
import { prisma } from "@/app/_lib/prisma";
import { TrackEpisodeSchema, type TrackEpisodeInput } from "../schemas";

export async function trackEpisode(userId: string, input: TrackEpisodeInput) {
  const validated = TrackEpisodeSchema.parse(input);

  return await prisma.userEpisodeProgress.upsert({
    where: {
      userId_episodeId: {
        userId,
        episodeId: validated.episodeId,
      },
    },
    update: {
      rating: validated.rating,
      watchedAt: new Date(),
    },
    create: {
      userId,
      episodeId: validated.episodeId,
      rating: validated.rating,
      watchedAt: new Date(),
    },
  });
}
```

### 4. Mover Server Actions

**Antes:** `app/_actions/episodes.ts`

```typescript
"use server";

import { getCurrentUserOptional } from "@/app/_lib/auth";
import { prisma } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

export async function trackEpisode(episodeId: number, rating: number) {
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in to track episodes");

  await prisma.userEpisodeProgress.upsert({
    where: { userId_episodeId: { userId: user.id, episodeId } },
    update: { rating, watchedAt: new Date() },
    create: { userId: user.id, episodeId, rating, watchedAt: new Date() },
  });

  revalidatePath(`/episodes/${episodeId}`);
  return { success: true };
}
```

**Después:** `domains/episodes/actions/trackEpisodeAction.ts`

```typescript
"use server";

import { getCurrentUserOptional } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { trackEpisode } from "../services/trackEpisode";
import type { TrackEpisodeInput } from "../schemas";

export async function trackEpisodeAction(input: TrackEpisodeInput) {
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in to track episodes");

  const result = await trackEpisode(user.id, input);

  revalidatePath(`/episodes/${input.episodeId}`);
  revalidatePath("/diary");

  return { success: true, data: result };
}
```

### 5. Mover Componentes

**Antes:** `app/_components/EpisodeTracker.tsx` (con lógica mezclada)

**Después:** `domains/episodes/components/EpisodeTracker.tsx`

```typescript
"use client";

import { useState } from "react";
import { useFormAction } from "@/app/_lib/hooks";
import { Button } from "@/components/ui/button";
import { trackEpisodeAction } from "../actions/trackEpisodeAction";
import { toast } from "sonner";

interface EpisodeTrackerProps {
  episodeId: number;
  initialRating?: number | null;
}

export function EpisodeTracker({ episodeId, initialRating }: EpisodeTrackerProps) {
  const [rating, setRating] = useState(initialRating ?? 0);

  const { execute, isPending } = useFormAction(
    async () => await trackEpisodeAction({ episodeId, rating }),
    {
      onSuccess: () => toast.success("Episode tracked!"),
      onError: (err) => toast.error(err.message),
    }
  );

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </button>
        ))}
      </div>
      <Button onClick={() => execute()} disabled={isPending || rating === 0}>
        {isPending ? "Tracking..." : "Track"}
      </Button>
    </div>
  );
}
```

### 6. Definir API Pública

**`domains/episodes/index.ts`**

```typescript
// Services
export { getEpisodes } from "./services/getEpisodes";
export { getEpisodeById } from "./services/getEpisodeById";

// Actions
export { trackEpisodeAction } from "./actions/trackEpisodeAction";
export { rateEpisodeAction } from "./actions/rateEpisodeAction";

// Components
export { EpisodeTracker } from "./components/EpisodeTracker";
export { EpisodeCard } from "./components/EpisodeCard";
export { EpisodeList } from "./components/EpisodeList";

// Types (públicos)
export type { Episode, EpisodeWithProgress, TrackEpisodeInput } from "./types";
```

### 7. Actualizar Imports en App Router

**Antes:** `app/episodes/[id]/page.tsx`

```typescript
import { findEpisodeById } from "@/app/_lib/repositories";
import { EpisodeTracker } from "@/app/_components/EpisodeTracker";
import { CommentSection } from "@/app/_components/CommentSection";

export default async function EpisodePage({ params }: Props) {
  const episode = await findEpisodeById(params.id);

  return (
    <div>
      <h1>{episode.title}</h1>
      <EpisodeTracker episodeId={episode.id} />
      <CommentSection episodeId={episode.id} />
    </div>
  );
}
```

**Después:** `app/episodes/[id]/page.tsx`

```typescript
import { getEpisodeById, EpisodeTracker } from "@/domains/episodes";
import { CommentSection } from "@/domains/social";

export default async function EpisodePage({ params }: Props) {
  const episode = await getEpisodeById(params.id);

  if (!episode) notFound();

  return (
    <div>
      <h1>{episode.title}</h1>
      <EpisodeTracker episodeId={episode.id} />
      <CommentSection targetId={episode.id} targetType="episode" />
    </div>
  );
}
```

---

## Store por Dominio (Opcional)

Si necesitas estado del cliente específico del dominio:

**`domains/episodes/store/useEpisodesStore.ts`**

```typescript
"use client";

import { create } from "zustand";
import type { Episode } from "../types";

interface EpisodesState {
  selectedSeason: number | null;
  searchQuery: string;
  filterWatched: boolean;

  setSelectedSeason: (season: number | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterWatched: (watched: boolean) => void;
  resetFilters: () => void;
}

export const useEpisodesStore = create<EpisodesState>((set) => ({
  selectedSeason: null,
  searchQuery: "",
  filterWatched: false,

  setSelectedSeason: (season) => set({ selectedSeason: season }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterWatched: (watched) => set({ filterWatched: watched }),
  resetFilters: () =>
    set({ selectedSeason: null, searchQuery: "", filterWatched: false }),
}));
```

**Uso:** `domains/episodes/components/EpisodeFilters.tsx`

```typescript
"use client";

import { useEpisodesStore } from "../store/useEpisodesStore";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function EpisodeFilters() {
  const { searchQuery, selectedSeason, setSearchQuery, setSelectedSeason } =
    useEpisodesStore();

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search episodes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Select
        value={selectedSeason?.toString() ?? "all"}
        onValueChange={(v) => setSelectedSeason(v === "all" ? null : Number(v))}
      >
        <option value="all">All Seasons</option>
        {[1, 2, 3, 4, 5].map((s) => (
          <option key={s} value={s}>
            Season {s}
          </option>
        ))}
      </Select>
    </div>
  );
}
```

---

## Testing por Dominio

**`domains/episodes/services/getEpisodes.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getEpisodes } from "./getEpisodes";
import { prisma } from "@/app/_lib/prisma";

vi.mock("@/app/_lib/prisma", () => ({
  prisma: {
    episode: {
      findMany: vi.fn(),
    },
  },
}));

describe("getEpisodes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all episodes ordered by season and episode number", async () => {
    const mockEpisodes = [
      {
        id: 1,
        seasonNumber: 1,
        episodeNumber: 1,
        title: "Simpsons Roasting on an Open Fire",
      },
      { id: 2, seasonNumber: 1, episodeNumber: 2, title: "Bart the Genius" },
    ];

    vi.mocked(prisma.episode.findMany).mockResolvedValue(mockEpisodes);

    const result = await getEpisodes();

    expect(result).toEqual(mockEpisodes);
    expect(prisma.episode.findMany).toHaveBeenCalledWith({
      orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
    });
  });
});
```

---

## Ventajas de esta Migración

✅ **Modularidad:** Dominio "episodes" completamente independiente  
✅ **Testabilidad:** Services puras sin dependencias de Next.js  
✅ **Escalabilidad:** Fácil agregar nuevos dominios sin afectar existentes  
✅ **Mantenibilidad:** Estructura clara y predecible  
✅ **Reusabilidad:** Services usables en API routes, cron jobs, tests  
✅ **Separation of Concerns:** Lógica de negocio separada del framework

---

## Próximos Pasos

1. **Migrar dominio "diary"** (siguiente prioridad)
2. **Migrar dominio "social"** (comments, follows)
3. **Migrar dominio "characters"**
4. **Migrar dominio "collections"**
5. **Migrar dominio "trivia"**
6. **Crear dominio "auth"** (extraer de `_lib/auth.ts`)
7. **Actualizar tests** para usar dominios
8. **Documentar decisiones** en `docs/ARCHITECTURE.md`
