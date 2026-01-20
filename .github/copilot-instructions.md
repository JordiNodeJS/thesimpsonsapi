- Utiliza `pnpm dlx kill-port <port>` para liberar puertos ocupados durante el desarrollo.
- Utiliza para correr tsx `pnpm tsx <file>` en lugar de `npx <file>`.

# The Simpsons API - AI Coding Instructions

You are an expert AI agent working on **The Simpsons API**, a modern web application built with Next.js 16, React 19, and Tailwind CSS 4.

## 🧠 Core Protocol: ULTRATHINK

Engage in exhaustive, deep-level reasoning for every request. Analyze through multiple lenses:

- **Psychological:** User sentiment and cognitive load.
- **Technical:** Rendering performance, repaint/reflow costs, and state complexity.
- **Accessibility:** Strict WCAG AAA compliance.
- **Scalability:** Long-term maintenance and modularity.

## 🎨 Design Philosophy: Intentional Minimalism

- **Bespoke Layouts:** Reject generic templates. Use asymmetry and distinctive typography.
- **Purposeful Elements:** Every element must have a calculated purpose. If it's redundant, delete it.
- **Visuals:** Focus on micro-interactions, perfect spacing, and "invisible" UX.

## 🛠 Tech Stack & Conventions

- **Framework:** Next.js 16 (App Router) + React 19.
- **Styling:** Tailwind CSS 4 (using `@import "tailwindcss"` in [app/globals.css](app/globals.css)).
- **Database:** Neon (PostgreSQL) with **Prisma ORM** (v7.2+).
- **UI Libraries:** Shadcn UI + Radix UI. **MUST** use these for all primitives (buttons, forms, dialogs). Do not build custom primitives.
- **Package Manager:** `pnpm` only. Use `pnpm dlx` for one-off commands (e.g., `pnpm dlx kill-port 3000`).

## 💾 Database Architecture (Prisma + Neon PostgreSQL)

### ORM Strategy (Prisma-First)

This project uses **Prisma ORM** with the `@prisma/adapter-neon` for serverless-optimized database access.

### Database Access Pattern (MANDATORY)

All database operations MUST use the Prisma client from [app/\_lib/prisma.ts](app/_lib/prisma.ts):

```typescript
// ✅ CORRECT - Use Prisma client
import { prisma } from "@/app/_lib/prisma";
const characters = await prisma.character.findMany();
const character = await prisma.character.findUnique({ where: { id } });

// ✅ CORRECT - Use Prisma for mutations
await prisma.characterComment.create({
  data: { userId, characterId, content },
});

// ❌ WRONG - Never use raw SQL queries
await pool.query(`SELECT * FROM characters WHERE id = $1`, [id]);
```

**Why this matters:** See [docs/DEPLOYMENT_LESSONS.md](docs/DEPLOYMENT_LESSONS.md#3-gestión-de-esquemas-con-search_path-y-http-fetch) for the technical explanation of how HTTP mode ignores `search_path`.

### Database Utilities

- **Prisma Client:** Import from [app/\_lib/prisma.ts](app/_lib/prisma.ts)
- **Repositories:** Centralize data access in [app/\_lib/repositories.ts](app/_lib/repositories.ts)
- **Server Actions:** Place mutations in [app/\_actions/](app/_actions/)
- **Types:** Use Prisma-generated types from `@prisma/client`

### Neon MCP Integration

- **Default Project:** `neon-indigo-kite` (`wispy-poetry-52762475`)
- **Default DB:** `neondb`
- **Default Branch:** `main`
- **Schema:** `the_simpson`
- **Safety:** Always verify state before destructive operations (DROP/DELETE) and confirm with user.

Use natural language for database operations (e.g., "List tables in neondb"). See [.github/skills/neon-database-management/SKILL.md](.github/skills/neon-database-management/SKILL.md) for complete guidance.

## 🔐 Authentication (Better Auth)

- **Provider:** Better Auth integrated into [app/\_lib/auth.ts](app/_lib/auth.ts) and [lib/auth.ts](lib/auth.ts)
- **Session Management:** Sessions stored in `the_simpson` schema (PostgreSQL)
- **Protected Routes:** Use `getCurrentUser()` to enforce authentication
- **Optional Auth:** Use `getCurrentUserOptional()` for pages that work with/without login
- **Protected Routes List:** `/diary`, `/collections` require auth (redirected via `proxy.ts`)
- **Public Routes with Auth Hooks:** `/episodes`, `/characters` are public but offer auth-dependent features (ratings, comments, follows)

### Authentication Pattern

```typescript
// ✅ Server Actions - Enforce auth
import { getCurrentUser, getCurrentUserOptional } from "@/app/_lib/auth";

export async function trackEpisode(episodeId: number, rating: number) {
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in to track episodes");
  // ... mutation logic
}

// ✅ Route Protection - Handled by proxy.ts
// Routes /diary, /collections automatically redirect to /login if not authenticated
```

## 🚀 Critical Workflows

### Development

```bash
# Kill port and start dev server
pnpm dev

# Or with Vercel env variables loaded
vercel env pull .env.local
vercel dev
```

### Server Actions & Form Handling

**Pattern:** All mutations use Zod validation + `useFormAction()` hook for consistent UX

```typescript
// ✅ Server Action (app/_actions/episodes.ts)
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

export async function trackEpisode(episodeId: number, rating: number) {
  const validated = TrackEpisodeSchema.parse({ episodeId, rating });
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in");

  await prisma.userEpisodeProgress.upsert({
    where: { userId_episodeId: { userId: user.id, episodeId: validated.episodeId } },
    update: { rating: validated.rating, watchedAt: new Date() },
    create: { userId: user.id, episodeId: validated.episodeId, rating: validated.rating, watchedAt: new Date() },
  });

  revalidatePath(`/episodes/${validated.episodeId}`);
  return { success: true };
}

// ✅ Client Component (app/_components/EpisodeTracker.tsx)
"use client";
import { useFormAction } from "@/app/_lib/hooks";

export function EpisodeTracker({ episodeId }: { episodeId: number }) {
  const { execute, isPending, error } = useFormAction(
    async () => await trackEpisode(episodeId, rating),
    {
      onSuccess: () => showToast("Episode tracked!"),
      onError: (err) => showToast(err.message, "error"),
    }
  );

  return (
    <button onClick={() => execute()} disabled={isPending}>
      {isPending ? "Tracking..." : "Track"}
    </button>
  );
}
```

### Database Operations (Prisma)

```bash
# Generate Prisma client after schema changes
pnpm prisma generate

# Push schema changes to database (dev only)
pnpm prisma db push

# Open Prisma Studio to view/edit data
pnpm prisma studio

# Verify database connection
pnpm tsx scripts/verify-db.ts
```

### Deployment

1. **Sync environment variables:**

   ```bash
   ./scripts/sync-vercel-env.sh --all-envs
   ./scripts/check-vercel-env.sh
   ```

2. **Build and deploy:**
   ```bash
   pnpm build
   vercel --prod
   ```

## 📂 Architecture Overview

### 🎯 Pattern Selection Strategy (YAGNI Principle)

> **Critical:** Not everything needs full DDD. Choose the right pattern for the job.

| Pattern Type    | Use When                                            | Examples                                                                    |
| --------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| **🟢 Simple**   | Read-only public data, no business rules            | Characters list, Episodes list, Locations                                   |
| **🟡 Hybrid**   | Read operations simple, write operations with rules | Episodes (read simple, track with DDD), Social (view simple, post with DDD) |
| **🔴 Full DDD** | Mutations with business rules, user ownership, RLS  | Diary entries, Collections, User progress                                   |

**Quick Decision:**

1. **Is it read-only?** → Use simple repository ([app/\_lib/repositories.ts](app/_lib/repositories.ts))
2. **Has business rules?** → Use DDD with UseCase ([core/application/](core/application/))
3. **Requires auth?** → Add RLS wrapper ([app/\_lib/prisma-rls.ts](app/_lib/prisma-rls.ts))

**📖 Full Guide:** See [docs/ARCHITECTURE_DECISION_MATRIX.md](docs/ARCHITECTURE_DECISION_MATRIX.md) for the complete decision matrix, flowcharts, and migration guidelines.

### Directory Structure

- [app/](app/): Next.js App Router (all routes here)
  - `_lib/`: Core utilities (DB, auth, types, hooks, utilities)
  - `_actions/`: Server Actions for all mutations
  - `_components/`: Shared UI components (forms, layouts, utilities)
  - `[route]/`: Public feature pages (episodes, characters, guide)
  - `api/auth/`: Better Auth API routes
- [components/ui/](components/ui/): Shadcn UI + Radix primitives
- [prisma/](prisma/): Prisma schema (`schema.prisma`)
- [scripts/](scripts/): Development and deployment utilities
- [docs/](docs/): Architecture decisions and lessons learned
- [.github/](../): GitHub automation, skills, and instructions

### Critical Data Flow

1. **Sync Layer** (`_actions/sync.ts`): Periodically syncs external Simpsons API data → `characters`, `episodes`, `locations` tables
2. **User Interactions** (`_actions/*.ts`): Server Actions handle all mutations → user tables (`diary_entries`, `user_episode_progress`, etc.)
3. **Data Access** (`_lib/repositories.ts`): Centralized query functions for reusable data fetching
4. **Route Protection** (`proxy.ts`): Next.js 16 proxy protects `/diary`, `/collections` routes

### Component Composition Patterns

- **Server Components (default):** Data fetching, static content, layout
  ```tsx
  // ✅ CORRECT - Server component with data
  export default async function CharacterPage({ params }: Props) {
    const character = await findCharacterById(params.id);
    return <CharacterView character={character} />;
  }
  ```
- **Client Components (`"use client"`):** Only hooks, events, browser APIs
  ```tsx
  // ✅ CORRECT - Client component with form
  "use client";
  const { execute, isPending } = useFormAction(trackEpisode);
  return <button onClick={() => execute(id)}>Track</button>;
  ```
- **Server Actions (`"use server"`):** All mutations + Zod validation
  ```tsx
  // ✅ CORRECT - Server action with validation
  export async function trackEpisode(episodeId: number, rating: number) {
    const validated = TrackEpisodeSchema.parse({ episodeId, rating });
    return prisma.userEpisodeProgress.upsert({...});
  }
  ```
- **Revalidation:** Always call `revalidatePath()` after mutations to bust cache

## �️ Route Protection & Proxy Pattern (Next.js 16)

**File:** [proxy.ts](proxy.ts) - Next.js 16 replaces `middleware.ts` with `proxy.ts` for clarity

**Protected Routes:**

- `/diary` - Requires authentication (personal diary)
- `/collections` - Requires authentication (quote collections)

**Public Routes with Auth-Dependent Features:**

- `/episodes` - Public listing, but tracking/rating requires auth
- `/characters` - Public listing, but following/commenting requires auth
- `/guide` - Public guide page

**How it Works:** Unauthenticated users accessing protected routes are redirected to `/login?callbackUrl=/target-route`

## 🔄 Data Access Patterns & Repositories

**Centralized Data Access:** Use [app/\_lib/repositories.ts](app/_lib/repositories.ts) for all queries

```typescript
// ❌ DON'T: Scattered queries throughout components
const char = await prisma.character.findUnique(...);

// ✅ DO: Use repositories for consistent, cacheable queries
import { findCharacterById } from "@/app/_lib/repositories";
const char = await findCharacterById(id);
```

**Why:** Repositories enable type-safe join results (e.g., `CommentWithUser` includes username automatically), consistent pagination, and single place to optimize queries.

## 📋 Project-Specific Conventions

### Zod Validation

All Server Actions validate input with Zod schemas (failure throws `ZodError`):

```typescript
const TrackEpisodeSchema = z.object({
  episodeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

const validated = TrackEpisodeSchema.parse({ episodeId, rating });
```

### Error Handling Pattern

- **Server Actions:** Throw standard `Error` with user-friendly messages
- **Client Components:** Catch errors from `useFormAction()` and display via toast
- **Type:** Use `Error | null` for error state, never raw strings

### Toast Notifications

Use [sonner](https://sonner.emilkowal.ski/) via `useFormAction()` callbacks:

```typescript
const { execute, isPending, error } = useFormAction(trackEpisode, {
  onSuccess: () => toast.success("Tracked!"),
  onError: (err) => toast.error(err.message),
});
```

### Shadcn UI Components

Always use Shadcn primitives from [components/ui/](components/ui/), never custom wrappers:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
```

### Client-Side State Persistence

Use custom `useLocalStorage` hook for persistent client state:

```typescript
const [theme, setTheme] = useLocalStorage("theme", "light");
// Automatically syncs to localStorage on every update
```

## �🔧 Environment Variables

**CRITICAL:** All env variables must be synced with Vercel. Use [.github/skills/vercel-env-sync/SKILL.md](.github/skills/vercel-env-sync/SKILL.md).

Required variables:

- `DATABASE_URL`: Neon connection string
- `NEXT_PUBLIC_APP_URL`: https://thesimpson.webcode.es (production)
- `BETTER_AUTH_URL`: Same as NEXT_PUBLIC_APP_URL
- `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`

## � Code Quality Standards

### Pre-Merge SonarLint Analysis (REQUIRED)

Before every PR merge, run SonarLint analysis:

```bash
# Analyze all modified files in PR
git diff --name-only main...feature-branch | grep -E "\.(ts|tsx)$"

# Use VS Code SonarLint extension to analyze each file
# Or use sonarqube_analyze_file tool for automated analysis
```

**Fix Priority:**

- 🔴 **BLOCKER**: Must fix before merge
- 🟠 **CRITICAL**: Must fix before merge
- 🟡 **MAJOR**: Should fix before merge
- 🔵 **MINOR**: Can defer with justification
- ⚪ **INFO**: Optional

### Error Handling Standards

**✅ DO: Preserve Domain Exception Types**

```typescript
// app/_actions/episodes.ts
catch (error) {
  if (error instanceof ValidationException || error instanceof DomainException) {
    throw error; // ✅ Preserves type and metadata
  }
  if (error instanceof Error) {
    throw error; // ✅ Preserve stack trace
  }
  throw new Error("Unexpected error");
}
```

**❌ DON'T: Wrap Domain Exceptions**

```typescript
catch (error) {
  if (error instanceof ValidationException) {
    throw new Error(error.message); // ❌ Loses type info, field, code
  }
}
```

**Why This Matters:**

- Client code can catch specific exception types
- Error metadata (field, code, entityType) is preserved
- Better debugging with full stack traces
- Type-safe error handling throughout the app

### Type Safety Rules

**Production Code:**

- ✅ Zero `any` types allowed
- ✅ Use `unknown` for truly dynamic data, then narrow
- ✅ Use `Partial<T>` for optional fields
- ✅ Use generics `<T>` for reusable types
- ❌ No implicit `any` from missing types

**Test Code:**

- ✅ Prefer `Partial<Interface>` for mocks
- ✅ Use `@ts-expect-error` only when necessary
- ✅ Document WHY `any` is used
- ❌ Don't use `any` without comment

**Examples:**

```typescript
// ✅ Production - Use Partial<T>
function updateUser(id: string, updates: Partial<User>) {
  // ...
}

// ✅ Production - Use unknown
function parseJson(input: unknown): ParsedData {
  if (typeof input !== "string") {
    throw new TypeError("Expected string");
  }
  return JSON.parse(input);
}

// ✅ Test - Document any usage
// @ts-expect-error - Test mock intentionally uses any for flexibility
const mockUseCase: any = {
  execute: vi.fn().mockResolvedValue({ success: true }),
};

// ✅ Test - Better with Partial
const mockUseCase: Partial<TrackEpisodeUseCase> = {
  execute: vi.fn().mockResolvedValue({ success: true }),
};
```

### Quality Checklist (Pre-PR)

Before creating a PR:

- [ ] Run `pnpm test` (all tests pass)
- [ ] Run `pnpm build` (no errors)
- [ ] Run `pnpm tsc --noEmit` (type check)
- [ ] Run SonarLint analysis (zero blockers/critical)
- [ ] Check no `any` types in production code
- [ ] Verify domain exceptions preserved
- [ ] Update documentation if patterns changed

**Lessons Learned:** See [.traces/05-sonarlint-pr14-cleanup.md](.traces/05-sonarlint-pr14-cleanup.md) for SonarLint best practices from PR #14.

## �📚 Advanced Resources

- [docs/ARCHITECTURE_DECISION_MATRIX.md](docs/ARCHITECTURE_DECISION_MATRIX.md): **START HERE** - Pragmatic guide for choosing between Simple and DDD patterns (YAGNI principle)
- [.github/agents/gemini-3-f-think.agent.md](.github/agents/gemini-3-f-think.agent.md): Full ULTRATHINK protocol
- [docs/DEPLOYMENT_LESSONS.md](docs/DEPLOYMENT_LESSONS.md): Critical serverless patterns
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): System design decisions
- [.github/skills/nextjs-ddd-architect/SKILL.md](.github/skills/nextjs-ddd-architect/SKILL.md): DDD architecture patterns
- [.github/skills/clean-architecture-frontend/SKILL.md](.github/skills/clean-architecture-frontend/SKILL.md): Clean Architecture layer separation patterns
