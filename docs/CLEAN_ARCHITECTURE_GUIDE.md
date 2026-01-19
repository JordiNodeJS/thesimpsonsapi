# Clean Architecture & DDD Guide

## 🎯 Overview

This project follows **Clean Architecture** principles with **Domain-Driven Design (DDD)** patterns. This guide helps developers understand the architecture, add new features, and maintain code quality.

---

## 📐 Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    DELIVERY LAYER (app/)                        │
│  Next.js pages, Server Actions, UI Components                   │
│  Depends on: Application Layer                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│               INFRASTRUCTURE LAYER (infrastructure/)            │
│  Prisma Repositories, Mappers, External Services                │
│  Depends on: Application Layer (implements ports)               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                APPLICATION LAYER (core/application/)            │
│  Use Cases, Ports (interfaces), DTOs                            │
│  Depends on: Domain Layer                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   DOMAIN LAYER (core/domain/)                   │
│  Entities, Value Objects, Domain Services, Exceptions           │
│  Depends on: NOTHING (pure business logic)                      │
└─────────────────────────────────────────────────────────────────┘
```

### The Dependency Rule

Dependencies flow **inward only**. Inner layers never depend on outer layers.

- ✅ `app/` → `infrastructure/` → `core/application/` → `core/domain/`
- ❌ `core/domain/` cannot import from `app/` or `prisma`

---

## 📁 Directory Structure

```
thesimpsonsapi/
├── core/                           # Business Logic (Framework-agnostic)
│   ├── domain/                     # Inner Layer - Pure Business Rules
│   │   ├── entities/               # Business objects with identity
│   │   ├── value-objects/          # Immutable objects without identity
│   │   ├── services/               # Domain-specific operations
│   │   └── exceptions/             # Domain error types
│   │
│   └── application/                # Use Cases Layer
│       ├── use-cases/              # Application business rules
│       │   ├── characters/
│       │   ├── episodes/
│       │   ├── diary/
│       │   ├── collections/
│       │   └── trivia/
│       └── ports/                  # Interfaces (contracts)
│           ├── repositories/       # Data access contracts
│           └── services/           # External service contracts
│
├── infrastructure/                 # Outer Layer - Adapters
│   ├── prisma/
│   │   ├── mappers/                # DB ↔ Domain conversion
│   │   └── repositories/           # Port implementations
│   └── factories/
│       └── UseCaseFactory.ts       # Composition Root
│
└── app/                            # Next.js Delivery Layer
    ├── _actions/                   # Thin Server Action controllers
    ├── _components/                # UI components
    ├── _lib/                       # Utilities
    └── [routes]/                   # Pages
```

---

## 🏗️ Layer Details

### 1. Domain Layer (`core/domain/`)

The innermost layer containing pure business logic. **NO framework dependencies**.

#### Entities
Objects with unique identity that persist over time.

```typescript
// core/domain/entities/Episode.ts
export class Episode {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly season: Season,
    public readonly episodeNumber: number,
    public readonly airDate: Date | null,
    public readonly description: string | null,
    public readonly imageUrl: string | null
  ) {}

  // Business logic methods
  isInSeason(seasonNumber: number): boolean {
    return this.season.value === seasonNumber;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      season: this.season.value,
      // ...
    };
  }
}
```

#### Value Objects
Immutable objects defined by their attributes, not identity.

```typescript
// core/domain/value-objects/Rating.ts
export class Rating {
  private constructor(public readonly value: number) {}

  static create(value: number): Rating {
    if (value < 1 || value > 5) {
      throw new InvalidRatingException(value);
    }
    return new Rating(value);
  }

  equals(other: Rating): boolean {
    return this.value === other.value;
  }
}
```

#### Domain Exceptions
Business rule violations.

```typescript
// core/domain/exceptions/DomainException.ts
export class NotFoundException extends DomainException {
  constructor(entityType: string, entityId: string | number) {
    super(`${entityType} with id ${entityId} not found`, "NOT_FOUND");
  }
}
```

---

### 2. Application Layer (`core/application/`)

Contains use cases (application-specific business rules) and port definitions.

#### Use Cases
Each use case represents one application action.

```typescript
// core/application/use-cases/episodes/TrackEpisodeUseCase.ts
export class TrackEpisodeUseCase {
  constructor(
    private readonly episodeRepo: IEpisodeRepository,
    private readonly progressRepo: IUserEpisodeProgressRepository
  ) {}

  async execute(userId: string, input: TrackEpisodeInput): Promise<TrackEpisodeOutput> {
    // 1. Validate domain rules
    const rating = Rating.create(input.rating);
    
    // 2. Check episode exists
    const episode = await this.episodeRepo.findById(input.episodeId);
    if (!episode) {
      throw new NotFoundException("Episode", input.episodeId);
    }
    
    // 3. Execute business logic
    await this.progressRepo.upsert(userId, input.episodeId, {
      rating: rating.value,
      notes: input.notes,
      watchedAt: new Date(),
    });
    
    return { success: true };
  }
}
```

#### Ports (Interfaces)
Contracts that infrastructure must implement.

```typescript
// core/application/ports/repositories/IEpisodeRepository.ts
export interface IEpisodeRepository {
  findById(id: number): Promise<Episode | null>;
  findAll(options?: { season?: number; limit?: number }): Promise<Episode[]>;
  findBySeasonAndNumber(season: number, number: number): Promise<Episode | null>;
}
```

---

### 3. Infrastructure Layer (`infrastructure/`)

Implements ports using concrete technologies (Prisma, external APIs, etc.).

#### Mappers
Convert between Prisma models and domain entities.

```typescript
// infrastructure/prisma/mappers/EpisodeMapper.ts
export class EpisodeMapper {
  static toDomain(prismaEpisode: PrismaEpisode): Episode {
    return new Episode(
      prismaEpisode.id,
      prismaEpisode.title,
      Season.create(prismaEpisode.season),
      prismaEpisode.episode_number,
      prismaEpisode.air_date,
      prismaEpisode.description,
      prismaEpisode.image_url
    );
  }
}
```

#### Repository Implementations
Implement ports using Prisma.

```typescript
// infrastructure/prisma/repositories/PrismaEpisodeRepository.ts
export class PrismaEpisodeRepository implements IEpisodeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Episode | null> {
    const episode = await this.prisma.episode.findUnique({ where: { id } });
    return episode ? EpisodeMapper.toDomain(episode) : null;
  }
}
```

#### UseCaseFactory (Composition Root)
Creates use cases with all dependencies wired up.

```typescript
// infrastructure/factories/UseCaseFactory.ts
export class UseCaseFactory {
  private static prisma = prismaClient;

  static createTrackEpisodeUseCase(): TrackEpisodeUseCase {
    const episodeRepo = new PrismaEpisodeRepository(this.prisma);
    const progressRepo = new PrismaUserEpisodeProgressRepository(this.prisma);
    return new TrackEpisodeUseCase(episodeRepo, progressRepo);
  }
}
```

---

### 4. Delivery Layer (`app/`)

Next.js-specific code. Server Actions are thin controllers.

```typescript
// app/_actions/episodes.ts
"use server";

export async function trackEpisode(episodeId: number, rating: number, notes?: string) {
  // 1. Validate input (Zod)
  const validated = TrackEpisodeSchema.parse({ episodeId, rating, notes });
  
  // 2. Get authenticated user
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in");
  
  // 3. Delegate to use case
  const useCase = UseCaseFactory.createTrackEpisodeUseCase();
  return useCase.execute(user.id, validated);
}
```

---

## 🚀 Adding a New Feature

### Example: Add "Mark Episode as Favorite"

#### Step 1: Domain Layer

```typescript
// core/domain/entities/UserEpisodeFavorite.ts
export class UserEpisodeFavorite {
  constructor(
    public readonly userId: string,
    public readonly episodeId: number,
    public readonly favoritedAt: Date
  ) {}
}
```

#### Step 2: Application Layer

```typescript
// core/application/ports/repositories/IUserFavoriteRepository.ts
export interface IUserFavoriteRepository {
  addFavorite(userId: string, episodeId: number): Promise<void>;
  removeFavorite(userId: string, episodeId: number): Promise<void>;
  isFavorite(userId: string, episodeId: number): Promise<boolean>;
}

// core/application/use-cases/episodes/ToggleFavoriteUseCase.ts
export class ToggleFavoriteUseCase {
  constructor(
    private readonly favoriteRepo: IUserFavoriteRepository,
    private readonly episodeRepo: IEpisodeRepository
  ) {}

  async execute(userId: string, episodeId: number): Promise<{ isFavorite: boolean }> {
    const episode = await this.episodeRepo.findById(episodeId);
    if (!episode) throw new NotFoundException("Episode", episodeId);

    const isFavorite = await this.favoriteRepo.isFavorite(userId, episodeId);
    
    if (isFavorite) {
      await this.favoriteRepo.removeFavorite(userId, episodeId);
      return { isFavorite: false };
    } else {
      await this.favoriteRepo.addFavorite(userId, episodeId);
      return { isFavorite: true };
    }
  }
}
```

#### Step 3: Infrastructure Layer

```typescript
// infrastructure/prisma/repositories/PrismaUserFavoriteRepository.ts
export class PrismaUserFavoriteRepository implements IUserFavoriteRepository {
  // Implement methods using Prisma
}

// infrastructure/factories/UseCaseFactory.ts
static createToggleFavoriteUseCase(): ToggleFavoriteUseCase {
  return new ToggleFavoriteUseCase(
    new PrismaUserFavoriteRepository(this.prisma),
    new PrismaEpisodeRepository(this.prisma)
  );
}
```

#### Step 4: Delivery Layer

```typescript
// app/_actions/episodes.ts
export async function toggleFavorite(episodeId: number) {
  const user = await getCurrentUserOptional();
  if (!user) throw new Error("Please log in");
  
  const useCase = UseCaseFactory.createToggleFavoriteUseCase();
  return useCase.execute(user.id, episodeId);
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Use Cases)

Mock the repository ports to test business logic in isolation.

```typescript
// __tests__/use-cases/ToggleFavoriteUseCase.test.ts
describe("ToggleFavoriteUseCase", () => {
  it("should add favorite when not favorited", async () => {
    const favoriteRepo = { isFavorite: vi.fn().mockResolvedValue(false), addFavorite: vi.fn() };
    const episodeRepo = { findById: vi.fn().mockResolvedValue(mockEpisode) };
    
    const useCase = new ToggleFavoriteUseCase(favoriteRepo, episodeRepo);
    const result = await useCase.execute("user-1", 1);
    
    expect(favoriteRepo.addFavorite).toHaveBeenCalledWith("user-1", 1);
    expect(result.isFavorite).toBe(true);
  });
});
```

### Server Action Tests

Mock the UseCaseFactory to test the thin controller layer.

```typescript
// app/_actions/episodes.test.ts
vi.mock("@/infrastructure/factories", () => ({
  UseCaseFactory: {
    createToggleFavoriteUseCase: vi.fn(),
  },
}));

describe("toggleFavorite", () => {
  it("should call use case with user id", async () => {
    mockGetCurrentUserOptional.mockResolvedValue(mockUser);
    mockExecute.mockResolvedValue({ isFavorite: true });
    
    await toggleFavorite(1);
    
    expect(mockExecute).toHaveBeenCalledWith(mockUser.id, 1);
  });
});
```

---

## 📋 Coding Standards

### Naming Conventions

| Layer | Convention | Example |
|-------|------------|---------|
| Entity | PascalCase | `Episode`, `DiaryEntry` |
| Value Object | PascalCase | `Rating`, `Content` |
| Use Case | PascalCase + "UseCase" | `TrackEpisodeUseCase` |
| Repository Interface | "I" + PascalCase + "Repository" | `IEpisodeRepository` |
| Repository Impl | "Prisma" + PascalCase + "Repository" | `PrismaEpisodeRepository` |
| Mapper | PascalCase + "Mapper" | `EpisodeMapper` |
| Server Action | camelCase | `trackEpisode`, `toggleFavorite` |

### File Organization

```
# New feature files
core/domain/entities/NewEntity.ts
core/application/use-cases/domain-name/NewFeatureUseCase.ts
core/application/ports/repositories/INewRepository.ts
infrastructure/prisma/repositories/PrismaNewRepository.ts
infrastructure/prisma/mappers/NewMapper.ts
app/_actions/domain-name.ts (add to existing or create new)
```

### Import Order

```typescript
// 1. External packages
import { z } from "zod";
import { revalidatePath } from "next/cache";

// 2. Domain layer
import { Episode } from "@/core/domain/entities";
import { NotFoundException } from "@/core/domain/exceptions";

// 3. Application layer
import { TrackEpisodeUseCase } from "@/core/application/use-cases/episodes";

// 4. Infrastructure layer
import { UseCaseFactory } from "@/infrastructure/factories";

// 5. App layer
import { getCurrentUser } from "@/app/_lib/auth";
```

---

## ❓ FAQ

### Q: Where should validation go?

- **Input validation** (format, required fields): Zod in Server Actions
- **Business rules** (rating 1-5, content length): Value Objects in Domain
- **Authorization**: Use Cases or Auth service

### Q: Can components call repositories directly?

No. Components → Server Actions → Use Cases → Repositories

### Q: When to create a new Use Case vs. add to existing?

Create new when:
- New feature with different business rules
- Different authorization requirements
- Different input/output structures

### Q: How to handle transactions?

Use Prisma transactions in the Repository or create a Unit of Work pattern.

---

## 🔗 Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - High-level architecture decisions
- [DEPLOYMENT_LESSONS.md](./DEPLOYMENT_LESSONS.md) - Deployment patterns
- [.traces/ddd-migration/](../.traces/ddd-migration/) - Migration tracking
