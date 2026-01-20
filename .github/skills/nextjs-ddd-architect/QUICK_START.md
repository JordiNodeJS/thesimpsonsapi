# Quick Start Guide - DDD Architecture

Guía rápida para empezar a usar la arquitectura DDD en The Simpsons API.

## 🚀 Inicio Rápido

### 1. Crear un Nuevo Dominio

```bash
# Crear estructura de dominio
mkdir -p domains/episodes/{components,services,actions,store}
touch domains/episodes/{index.ts,types.ts,schemas.ts,constants.ts}

# O usar el script helper (si existe)
pnpm dlx tsx .github/skills/nextjs-ddd-architect/scripts/create-domain.ts episodes
```

### 2. Definir Tipos del Dominio

**`domains/episodes/types.ts`**

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
```

### 3. Crear Schemas de Validación

**`domains/episodes/schemas.ts`**

```typescript
import { z } from "zod";

export const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

export type TrackEpisodeInput = z.infer<typeof TrackEpisodeSchema>;
```

### 4. Implementar Services

**`domains/episodes/services/getEpisodes.ts`**

```typescript
import { prisma } from "@/app/_lib/prisma";
import type { Episode } from "../types";

export async function getEpisodes(): Promise<Episode[]> {
  return await prisma.episode.findMany({
    orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
  });
}
```

### 5. Crear Server Actions

**`domains/episodes/actions/trackEpisodeAction.ts`**

```typescript
"use server";

import { getCurrentUserOptional } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { trackEpisode } from "../services/trackEpisode";
import type { TrackEpisodeInput } from "../schemas";

export async function trackEpisodeAction(input: TrackEpisodeInput) {
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in");

  const result = await trackEpisode(user.id, input);
  revalidatePath(`/episodes/${input.episodeId}`);

  return { success: true, data: result };
}
```

### 6. Construir Componentes

**`domains/episodes/components/EpisodeCard.tsx`**

```typescript
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { Episode } from "../types";

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Card>
      <CardHeader>
        S{episode.seasonNumber}E{episode.episodeNumber} - {episode.title}
      </CardHeader>
      <CardContent>
        {episode.description}
      </CardContent>
    </Card>
  );
}
```

### 7. Definir API Pública

**`domains/episodes/index.ts`**

```typescript
// Services
export { getEpisodes } from "./services/getEpisodes";
export { getEpisodeById } from "./services/getEpisodeById";

// Actions
export { trackEpisodeAction } from "./actions/trackEpisodeAction";

// Components
export { EpisodeCard } from "./components/EpisodeCard";
export { EpisodeList } from "./components/EpisodeList";

// Types
export type { Episode, EpisodeWithProgress } from "./types";
```

### 8. Usar en App Router

**`app/episodes/page.tsx`**

```typescript
import { getEpisodes, EpisodeList } from "@/domains/episodes";

export default async function EpisodesPage() {
  const episodes = await getEpisodes();
  return <EpisodeList episodes={episodes} />;
}
```

---

## 📝 Comandos Útiles

### Crear Dominio

```bash
# Estructura completa
mkdir -p domains/{domain-name}/{components,services,actions,store}
touch domains/{domain-name}/{index.ts,types.ts,schemas.ts}
```

### Validar Dominio

```bash
# Validar que sigue principios DDD
pnpm dlx tsx .github/skills/nextjs-ddd-architect/scripts/validate-domain.ts episodes
```

### Testing

```bash
# Unit tests (services)
pnpm test domains/episodes/services

# Integration tests (actions)
pnpm test domains/episodes/actions

# Todos los tests del dominio
pnpm test domains/episodes
```

### Linting

```bash
# Verificar imports cross-domain
pnpm eslint domains/episodes --fix

# TypeScript check
pnpm tsc --noEmit
```

---

## 🗂 Template de Dominio

### Estructura Mínima

```
domains/{domain}/
├── components/
│   └── .gitkeep
├── services/
│   └── .gitkeep
├── actions/
│   └── .gitkeep
├── store/
│   └── .gitkeep
├── index.ts
├── types.ts
└── schemas.ts
```

### index.ts Template

```typescript
// Services
// export { } from "./services/";

// Actions
// export { } from "./actions/";

// Components
// export { } from "./components/";

// Types
// export type { } from "./types";
```

### types.ts Template

```typescript
// Core domain entities
export interface {Entity} {
  id: string | number;
  // ... properties
}

// Extended entities with relations
export interface {Entity}WithRelations extends {Entity} {
  // ... relations
}
```

### schemas.ts Template

```typescript
import { z } from "zod";

// Input schemas
export const Create{Entity}Schema = z.object({
  // ... fields
});

export const Update{Entity}Schema = z.object({
  // ... fields
}).partial();

// Inferred types
export type Create{Entity}Input = z.infer<typeof Create{Entity}Schema>;
export type Update{Entity}Input = z.infer<typeof Update{Entity}Schema>;
```

---

## 🎯 Checklist de Implementación

### ✅ Antes de Empezar

- [ ] Leer [SKILL.md](SKILL.md) completo
- [ ] Revisar [MIGRATION_EXAMPLE.md](MIGRATION_EXAMPLE.md)
- [ ] Identificar bounded context del dominio
- [ ] Planear dependencias con otros dominios

### ✅ Durante Implementación

- [ ] Crear estructura de carpetas
- [ ] Definir tipos core (`types.ts`)
- [ ] Crear schemas de validación (`schemas.ts`)
- [ ] Implementar services (lógica de negocio)
- [ ] Crear server actions (Next.js specific)
- [ ] Construir componentes del dominio
- [ ] Definir API pública (`index.ts`)
- [ ] Escribir tests unitarios

### ✅ Después de Implementar

- [ ] Validar con script `validate-domain.ts`
- [ ] Revisar con [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)
- [ ] Ejecutar tests (coverage > 80%)
- [ ] Actualizar imports en App Router
- [ ] Documentar decisiones arquitectónicas
- [ ] Code review con equipo

---

## 💡 Tips y Mejores Prácticas

### Services

```typescript
// ✅ GOOD - Framework-agnostic
export async function getEpisode(id: number): Promise<Episode | null> {
  return await prisma.episode.findUnique({ where: { id } });
}

// ❌ BAD - Framework-coupled
import { cookies } from "next/headers";
export async function getEpisode(id: number) {
  const token = cookies().get("token");
  // ...
}
```

### Actions

```typescript
// ✅ GOOD - Separated concerns
export async function createAction(input: CreateInput) {
  const user = await getCurrentUser();
  const result = await createService(input); // Service call
  revalidatePath("/path");
  return { success: true, data: result };
}

// ❌ BAD - Business logic in action
export async function createAction(input: CreateInput) {
  await prisma.entity.create({ data: input }); // Direct DB call
  revalidatePath("/path");
}
```

### Components

```typescript
// ✅ GOOD - Typed props
interface CardProps {
  episode: Episode;
  showTracker?: boolean;
}

export function EpisodeCard({ episode, showTracker = false }: CardProps) {
  // ...
}

// ❌ BAD - Untyped
export function Card({ data, type }) {
  // ...
}
```

### Stores

```typescript
// ✅ GOOD - Minimal state
export const useEpisodesStore = create<State>((set) => ({
  selectedSeason: null,
  setSelectedSeason: (s) => set({ selectedSeason: s }),
}));

// ❌ BAD - Duplicating server data
export const useEpisodesStore = create((set) => ({
  episodes: [],
  fetchEpisodes: async () => {
    /* ... */
  }, // Use React Query instead
}));
```

---

## 🔗 Recursos

- **Documentación:** [SKILL.md](SKILL.md)
- **Ejemplo Migración:** [MIGRATION_EXAMPLE.md](MIGRATION_EXAMPLE.md)
- **Validación:** [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md)
- **Resumen:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## 🆘 Ayuda

### "¿Dónde pongo este código?"

- **Lógica de negocio:** `services/`
- **Mutaciones con revalidation:** `actions/`
- **UI específica del dominio:** `components/`
- **Estado del cliente:** `store/`
- **Tipos:** `types.ts`
- **Validaciones:** `schemas.ts`

### "¿Cómo comunico dos dominios?"

1. **Dependency Injection** en App Router
2. **Shared Types** en `/shared/types.ts`
3. **Event Bus** para comunicación desacoplada
4. **NO importar directamente** entre dominios

### "¿Cuándo crear un nuevo dominio?"

- ✅ Tiene bounded context claro
- ✅ Reglas de negocio independientes
- ✅ Puede desarrollarse aisladamente
- ❌ Solo 1-2 componentes pequeños
- ❌ Fuertemente acoplado a otro dominio

---

**Happy coding with DDD! 🚀**
