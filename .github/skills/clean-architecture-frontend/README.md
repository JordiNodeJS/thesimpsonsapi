# Clean Architecture for Frontend - Skill Overview

Skill experta en arquitectura limpia (Clean Architecture) para aplicaciones frontend Next.js 16, con separación estricta de capas y regla de dependencias.

## 🎯 Propósito

Proporciona patrones, estructuras y estrategias para implementar Clean Architecture en aplicaciones Next.js mediante separación de capas (Domain, Application, Infrastructure, Delivery) y la Regla de Dependencias (Dependency Rule).

## 📦 Activation Triggers

Esta skill se activa automáticamente cuando el usuario menciona:

- "Implement Clean Architecture"
- "Separate business logic from framework"
- "Create use cases"
- "Apply Dependency Rule"
- "Design port and adapter"
- "Make framework-independent code"
- "Implement hexagonal architecture"
- "Create repository interfaces"
- "Design domain entities"
- "Independent business logic"

## 🏗 The Four Layers

```
┌─────────────────────────────────────────┐
│    Delivery Layer (app/)                │ ← Next.js Routes, Components
│  ┌───────────────────────────────────┐  │
│  │  Infrastructure (infrastructure/) │  │ ← Prisma, APIs, Adapters
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Application (core/app/)    │  │  │ ← Use Cases, Ports (interfaces)
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Domain (core/domain/)│  │  │  │ ← Entities, Value Objects
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 1. Domain Layer (Core Business Logic)

**Location:** `core/domain/`

**Contains:**

- Entities (business objects with identity)
- Value Objects (immutable data with validation)
- Domain Services (complex business rules)
- Domain Exceptions

**Characteristics:**

- ✅ Zero dependencies on frameworks
- ✅ No React, no Next.js, no Prisma
- ✅ Pure TypeScript/JavaScript
- ✅ 100% testable without mocks

**Example:**

```typescript
// core/domain/entities/Episode.ts
export class Episode {
  private constructor(
    public readonly id: number,
    public readonly title: string,
    private _rating: number,
  ) {
    this.validateRating(_rating);
  }

  static create(data: EpisodeData): Episode {
    return new Episode(data.id, data.title, data.rating);
  }

  private validateRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new InvalidRatingError("Rating must be 1-5");
    }
  }

  updateRating(newRating: number): Episode {
    this.validateRating(newRating);
    return new Episode(this.id, this.title, newRating);
  }

  get isHighlyRated(): boolean {
    return this._rating >= 4;
  }
}
```

### 2. Application Layer (Use Cases)

**Location:** `core/application/`

**Contains:**

- Use Cases / Interactors
- Repository Interfaces (ports)
- Service Interfaces (ports)
- DTOs (Data Transfer Objects)

**Characteristics:**

- ✅ Orchestrates domain entities
- ✅ Defines interfaces for Infrastructure
- ✅ Framework-agnostic
- ✅ Imports from Domain layer only

**Example:**

```typescript
// core/application/ports/EpisodeRepository.ts (Interface)
export interface EpisodeRepository {
  findById(id: number): Promise<Episode | null>;
  save(episode: Episode): Promise<void>;
}

// core/application/use-cases/TrackEpisodeUseCase.ts
export class TrackEpisodeUseCase {
  constructor(private episodeRepository: EpisodeRepository) {}

  async execute(input: TrackEpisodeInput): Promise<TrackEpisodeOutput> {
    const episode = await this.episodeRepository.findById(input.episodeId);
    if (!episode) throw new EpisodeNotFoundError(input.episodeId);

    const updated = episode.updateRating(input.rating);
    await this.episodeRepository.save(updated);

    return { episodeId: updated.id, newRating: updated.rating };
  }
}
```

### 3. Infrastructure Layer (Adapters)

**Location:** `infrastructure/`

**Contains:**

- Repository Implementations (Prisma adapters)
- External API clients
- Database mappers
- Third-party integrations

**Characteristics:**

- ✅ Implements Application interfaces
- ✅ Framework-specific code (Prisma, Fetch API, etc.)
- ✅ Depends on Application and Domain
- ✅ Never accessed directly by Domain/Application

**Example:**

```typescript
// infrastructure/prisma/repositories/PrismaEpisodeRepository.ts
import { EpisodeRepository } from "@/core/application/ports/EpisodeRepository";
import { Episode } from "@/core/domain/entities/Episode";
import { prisma } from "@/app/_lib/prisma";

export class PrismaEpisodeRepository implements EpisodeRepository {
  async findById(id: number): Promise<Episode | null> {
    const record = await prisma.episode.findUnique({ where: { id } });
    return record ? EpisodeMapper.toDomain(record) : null;
  }

  async save(episode: Episode): Promise<void> {
    await prisma.episode.update({
      where: { id: episode.id },
      data: { rating: episode.rating },
    });
  }
}
```

### 4. Delivery Layer (UI/Controllers)

**Location:** `app/`

**Contains:**

- Next.js routes, layouts, pages
- React Server/Client components
- Server Actions (thin controllers)
- Dependency injection/composition

**Characteristics:**

- ✅ Depends on all other layers
- ✅ Orchestrates use case execution
- ✅ Handles HTTP/UI concerns
- ✅ Provides dependencies via DI

**Example:**

```typescript
// app/episodes/[id]/actions.ts
"use server";
import { TrackEpisodeUseCase } from "@/core/application/use-cases/TrackEpisodeUseCase";
import { PrismaEpisodeRepository } from "@/infrastructure/prisma/repositories/PrismaEpisodeRepository";

export async function trackEpisode(episodeId: number, rating: number) {
  const repository = new PrismaEpisodeRepository();
  const useCase = new TrackEpisodeUseCase(repository);

  const result = await useCase.execute({ episodeId, rating });
  revalidatePath(`/episodes/${episodeId}`);

  return result;
}
```

---

## 🧭 The Dependency Rule

> **Source code dependencies must point only inward, toward higher-level policies.**

### ✅ ALLOWED Dependencies

```typescript
// Delivery → Infrastructure
import { PrismaEpisodeRepository } from "@/infrastructure/prisma/repositories/PrismaEpisodeRepository";

// Delivery → Application
import { TrackEpisodeUseCase } from "@/core/application/use-cases/TrackEpisodeUseCase";

// Infrastructure → Application (implements interface)
import { EpisodeRepository } from "@/core/application/ports/EpisodeRepository";

// Application → Domain
import { Episode } from "@/core/domain/entities/Episode";

// Infrastructure → Domain
import { Episode } from "@/core/domain/entities/Episode";
```

### ❌ FORBIDDEN Dependencies

```typescript
// Domain → Application (VIOLATION!)
import { TrackEpisodeUseCase } from "@/core/application/use-cases/TrackEpisodeUseCase";

// Domain → Infrastructure (VIOLATION!)
import { prisma } from "@/app/_lib/prisma";

// Application → Infrastructure concrete class (VIOLATION!)
import { PrismaEpisodeRepository } from "@/infrastructure/prisma/repositories/PrismaEpisodeRepository";

// Domain/Application → Delivery (VIOLATION!)
import { trackEpisode } from "@/app/episodes/actions";
```

---

## 🎯 Key Benefits

1. **Framework Independence** - Business logic works with any framework
2. **Testability** - Test domain logic without mocks or database
3. **Flexibility** - Easy to swap Prisma for another ORM
4. **Maintainability** - Clear boundaries reduce coupling
5. **Scalability** - Separation of concerns enables growth

---

## 📚 Core Patterns

### Entities (Identity-based Objects)

```typescript
// core/domain/entities/Character.ts
export class Character {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    private _followersCount: number,
  ) {}

  static create(data: CharacterData): Character {
    return new Character(data.id, data.name, data.followersCount ?? 0);
  }

  incrementFollowers(): Character {
    return new Character(this.id, this.name, this._followersCount + 1);
  }

  equals(other: Character): boolean {
    return this.id === other.id;
  }
}
```

### Value Objects (Immutable, Validation)

```typescript
// core/domain/value-objects/Rating.ts
export class Rating {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): Rating {
    if (value < 1 || value > 5) {
      throw new InvalidRatingError("Rating must be 1-5");
    }
    return new Rating(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Rating): boolean {
    return this.value === other.value;
  }
}
```

### Use Cases (Orchestration)

```typescript
// core/application/use-cases/FollowCharacterUseCase.ts
export class FollowCharacterUseCase {
  constructor(
    private characterRepo: CharacterRepository,
    private followRepo: FollowRepository,
  ) {}

  async execute(input: FollowInput): Promise<void> {
    const character = await this.characterRepo.findById(input.characterId);
    if (!character) throw new CharacterNotFoundError();

    const updated = character.incrementFollowers();

    await this.followRepo.create(input.userId, input.characterId);
    await this.characterRepo.save(updated);
  }
}
```

### Repository Pattern (Port & Adapter)

```typescript
// Port (Interface in Application layer)
// core/application/ports/CharacterRepository.ts
export interface CharacterRepository {
  findById(id: number): Promise<Character | null>;
  save(character: Character): Promise<void>;
}

// Adapter (Implementation in Infrastructure layer)
// infrastructure/prisma/repositories/PrismaCharacterRepository.ts
export class PrismaCharacterRepository implements CharacterRepository {
  async findById(id: number): Promise<Character | null> {
    const record = await prisma.character.findUnique({ where: { id } });
    return record ? CharacterMapper.toDomain(record) : null;
  }

  async save(character: Character): Promise<void> {
    await prisma.character.update({
      where: { id: character.id },
      data: { followers_count: character.followersCount },
    });
  }
}
```

---

## 🚀 Quick Start

### 1. Create Domain Entity

```bash
# Create entity file
touch core/domain/entities/Episode.ts
```

### 2. Define Repository Interface

```bash
# Create port (interface)
touch core/application/ports/EpisodeRepository.ts
```

### 3. Create Use Case

```bash
# Create use case
touch core/application/use-cases/TrackEpisodeUseCase.ts
```

### 4. Implement Repository Adapter

```bash
# Create Prisma implementation
touch infrastructure/prisma/repositories/PrismaEpisodeRepository.ts
```

### 5. Execute from Delivery Layer

```bash
# Create Server Action
touch app/episodes/[id]/actions.ts
```

---

## 🔄 Migration Strategy

1. **Start with critical entities** - Extract core business objects first
2. **Create use cases** - Move logic from Server Actions to use cases
3. **Define interfaces** - Create repository ports in Application layer
4. **Implement adapters** - Build Prisma implementations
5. **Refactor delivery** - Update pages/actions to use use cases

---

## ⚠️ Common Anti-Patterns

### ❌ Domain Depends on Framework

```typescript
// WRONG - Domain imports Prisma
import { prisma } from "@/app/_lib/prisma";
export class Episode {
  async save() { await prisma.episode.update(...); }
}
```

### ❌ Use Case Depends on Concrete Class

```typescript
// WRONG - Use case creates repository directly
export class TrackEpisodeUseCase {
  async execute() {
    const repo = new PrismaEpisodeRepository(); // VIOLATION!
  }
}
```

### ❌ Anemic Domain Model

```typescript
// WRONG - No behavior, just data
export class Episode {
  id: number;
  rating: number;
}
```

---

## 📖 Resources

- **SKILL.md**: Complete documentation (~8000 words)
- **MIGRATION_EXAMPLE.md**: Step-by-step migration guide
- **VALIDATION_CHECKLIST.md**: 50+ validation points
- **QUICK_START.md**: Templates and quick reference
- **scripts/validate-clean-arch.ts**: Automated validation script

---

## 🎓 Learn More

Clean Architecture ensures:

- Business logic independence
- Framework flexibility
- Easy testing
- Clear boundaries
- Long-term maintainability

**Golden Rule:** Dependencies point inward only. Domain knows nothing about the outside world.
