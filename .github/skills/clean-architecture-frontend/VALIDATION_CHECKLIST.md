# Clean Architecture Validation Checklist

Comprehensive checklist for validating Clean Architecture implementation across all layers.

## Scoring System

- **Total Points:** 100
- **A Grade:** 90-100 (Excellent adherence)
- **B Grade:** 75-89 (Good with minor violations)
- **C Grade:** 60-74 (Acceptable with improvements needed)
- **D Grade:** 45-59 (Significant violations)
- **F Grade:** <45 (Major architectural violations)

---

## Layer 1: Domain Layer (25 points)

### Dependency Independence (10 points)

- [ ] **[2 pts]** Domain entities have ZERO imports from frameworks (React, Next.js)
- [ ] **[2 pts]** Domain entities have ZERO imports from Infrastructure layer
- [ ] **[2 pts]** Domain entities have ZERO imports from Application layer
- [ ] **[2 pts]** Domain entities have ZERO imports from Delivery layer
- [ ] **[2 pts]** Domain only imports from `core/domain/` directory

```typescript
// ✅ CORRECT - Domain entity with zero framework dependencies
export class Episode {
  private constructor(
    public readonly id: number,
    private _rating: number
  ) {}

  static create(data: EpisodeData): Episode {
    return new Episode(data.id, data.rating);
  }
}

// ❌ WRONG - Domain imports framework
import { prisma } from "@/app/_lib/prisma"; // VIOLATION!
export class Episode {
  async save() {
    await prisma.episode.update(...);
  }
}
```

### Rich Domain Model (8 points)

- [ ] **[2 pts]** Entities contain business logic, not just data
- [ ] **[2 pts]** Value Objects validate data at creation
- [ ] **[2 pts]** Business rules are enforced in domain methods
- [ ] **[2 pts]** Entities are immutable (return new instances on updates)

```typescript
// ✅ CORRECT - Rich domain model
export class Episode {
  private constructor(
    public readonly id: number,
    private _rating: number,
  ) {
    this.validateRating(_rating); // Business rule
  }

  private validateRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new InvalidRatingError("Rating must be 1-5");
    }
  }

  updateRating(newRating: number): Episode {
    this.validateRating(newRating);
    return new Episode(this.id, newRating); // Immutable
  }
}

// ❌ WRONG - Anemic domain model
export class Episode {
  id: number;
  rating: number;
}
```

### Domain Services (4 points)

- [ ] **[2 pts]** Complex business logic is in Domain Services, not scattered
- [ ] **[2 pts]** Domain Services operate on multiple entities or complex rules

```typescript
// ✅ CORRECT - Domain service for complex logic
export class EpisodeRecommendationService {
  calculateRecommendationScore(
    episode: Episode,
    userHistory: Episode[],
  ): number {
    let score = 0;
    if (episode.isHighlyRated) score += 10;
    if (userHistory.some((ep) => ep.season === episode.season)) score += 5;
    return score;
  }
}
```

### Exception Handling (3 points)

- [ ] **[1 pt]** Domain exceptions are specific and meaningful
- [ ] **[1 pt]** Exceptions extend Error with descriptive names
- [ ] **[1 pt]** Exceptions are thrown from domain methods, not caught

```typescript
// ✅ CORRECT - Domain exception
export class InvalidRatingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRatingError";
  }
}
```

---

## Layer 2: Application Layer (25 points)

### Use Case Design (10 points)

- [ ] **[2 pts]** One use case per user action/intention
- [ ] **[2 pts]** Use cases orchestrate domain logic, not implement it
- [ ] **[2 pts]** Use cases have single responsibility
- [ ] **[2 pts]** Use cases return DTOs, not domain entities
- [ ] **[2 pts]** Use cases accept DTOs as input, not raw primitives

```typescript
// ✅ CORRECT - Use case orchestrates, doesn't implement logic
export class TrackEpisodeUseCase {
  constructor(private episodeRepository: EpisodeRepository) {}

  async execute(input: TrackEpisodeInput): Promise<TrackEpisodeOutput> {
    const episode = await this.episodeRepository.findById(input.episodeId);
    const updated = episode.updateRating(input.rating); // Domain logic
    await this.episodeRepository.save(updated);

    return { episodeId: updated.id, newRating: updated.rating }; // DTO
  }
}

// ❌ WRONG - Use case implements business logic
export class TrackEpisodeUseCase {
  async execute(episodeId: number, rating: number) {
    if (rating < 1 || rating > 5) {
      // Business logic should be in domain!
      throw new Error("Invalid rating");
    }
    await this.repository.save({ episodeId, rating });
  }
}
```

### Repository Interfaces (8 points)

- [ ] **[2 pts]** Repository interfaces are defined in Application layer
- [ ] **[2 pts]** Repository methods accept/return domain entities
- [ ] **[2 pts]** Repositories represent aggregate roots
- [ ] **[2 pts]** Use cases depend on interfaces, not concrete classes

```typescript
// ✅ CORRECT - Repository interface in Application layer
// core/application/ports/EpisodeRepository.ts
export interface EpisodeRepository {
  findById(id: number): Promise<Episode | null>;
  save(episode: Episode): Promise<void>;
}

// Use case depends on interface
export class TrackEpisodeUseCase {
  constructor(private episodeRepository: EpisodeRepository) {} // Interface!
}

// ❌ WRONG - Use case depends on concrete class
import { PrismaEpisodeRepository } from "@/infrastructure/prisma";
export class TrackEpisodeUseCase {
  constructor(private episodeRepository: PrismaEpisodeRepository) {} // Concrete class!
}
```

### DTOs (4 points)

- [ ] **[2 pts]** Input/Output DTOs are defined for each use case
- [ ] **[2 pts]** DTOs are plain objects (no methods or business logic)

```typescript
// ✅ CORRECT - Plain DTOs
export interface TrackEpisodeInput {
  userId: string;
  episodeId: number;
  rating: number;
}

export interface TrackEpisodeOutput {
  episodeId: number;
  newRating: number;
}
```

### Dependency Direction (3 points)

- [ ] **[1 pt]** Application imports from Domain layer only
- [ ] **[1 pt]** Application defines interfaces for Infrastructure
- [ ] **[1 pt]** Application has ZERO imports from Infrastructure/Delivery

```typescript
// ✅ CORRECT - Application imports Domain only
import { Episode } from "@/core/domain/entities/Episode";
import { EpisodeRepository } from "../ports/EpisodeRepository"; // Interface

// ❌ WRONG - Application imports Infrastructure
import { PrismaEpisodeRepository } from "@/infrastructure/prisma"; // VIOLATION!
```

---

## Layer 3: Infrastructure Layer (20 points)

### Repository Implementation (10 points)

- [ ] **[2 pts]** Repositories implement Application interfaces
- [ ] **[2 pts]** Repositories use mappers to convert Prisma ↔ Domain
- [ ] **[2 pts]** Repository methods never expose Prisma types
- [ ] **[2 pts]** Repositories handle all database concerns
- [ ] **[2 pts]** Repositories are in `infrastructure/` directory

```typescript
// ✅ CORRECT - Repository implements interface
import { EpisodeRepository } from "@/core/application/ports/EpisodeRepository";
import { Episode } from "@/core/domain/entities/Episode";
import { EpisodeMapper } from "../mappers/EpisodeMapper";

export class PrismaEpisodeRepository implements EpisodeRepository {
  async findById(id: number): Promise<Episode | null> {
    const record = await prisma.episode.findUnique({ where: { id } });
    return record ? EpisodeMapper.toDomain(record) : null;
  }

  async save(episode: Episode): Promise<void> {
    const data = EpisodeMapper.toPersistence(episode);
    await prisma.episode.update({ where: { id: episode.id }, data });
  }
}

// ❌ WRONG - Repository returns Prisma type
export class PrismaEpisodeRepository implements EpisodeRepository {
  async findById(id: number): Promise<PrismaEpisode> {
    // WRONG!
    return prisma.episode.findUnique({ where: { id } });
  }
}
```

### Mappers (5 points)

- [ ] **[2 pts]** Mappers convert between Domain entities and Prisma models
- [ ] **[2 pts]** Mappers have `toDomain()` and `toPersistence()` methods
- [ ] **[1 pt]** Mappers are separate from repositories

```typescript
// ✅ CORRECT - Mapper for Domain ↔ Prisma
export class EpisodeMapper {
  static toDomain(prismaEpisode: PrismaEpisode): Episode {
    return Episode.create({
      id: prismaEpisode.id,
      title: prismaEpisode.title,
      rating: prismaEpisode.rating,
    });
  }

  static toPersistence(episode: Episode) {
    return {
      id: episode.id,
      title: episode.title,
      rating: episode.rating,
    };
  }
}
```

### Adapter Pattern (5 points)

- [ ] **[2 pts]** External services implement Application interfaces
- [ ] **[2 pts]** Third-party SDKs are wrapped in adapters
- [ ] **[1 pt]** Adapters are in `infrastructure/` directory

```typescript
// ✅ CORRECT - External service adapter
import { AuthenticationService } from "@/core/application/ports/AuthenticationService";
import { signIn } from "@/lib/auth";

export class BetterAuthService implements AuthenticationService {
  async signIn(email: string): Promise<void> {
    await signIn("credentials", { email, redirect: false });
  }
}
```

---

## Layer 4: Delivery Layer (20 points)

### Server Actions as Thin Controllers (8 points)

- [ ] **[2 pts]** Server Actions orchestrate use cases, not implement logic
- [ ] **[2 pts]** Server Actions handle framework concerns (validation, revalidation)
- [ ] **[2 pts]** Server Actions compose dependencies manually or via factory
- [ ] **[2 pts]** Server Actions return simple results (success/error)

```typescript
// ✅ CORRECT - Thin Server Action
"use server";
import { UseCaseFactory } from "@/infrastructure/factories/UseCaseFactory";
import { revalidatePath } from "next/cache";

export async function trackEpisode(episodeId: number, rating: number) {
  const useCase = UseCaseFactory.createTrackEpisodeUseCase();

  try {
    const result = await useCase.execute({ episodeId, rating });
    revalidatePath(`/episodes/${episodeId}`);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ❌ WRONG - Server Action contains business logic
export async function trackEpisode(episodeId: number, rating: number) {
  if (rating < 1 || rating > 5) {
    // Business logic!
    throw new Error("Invalid rating");
  }
  await prisma.episode.update({ where: { id: episodeId }, data: { rating } });
}
```

### Pages as Composition Layer (6 points)

- [ ] **[2 pts]** Pages orchestrate use cases, not call Prisma directly
- [ ] **[2 pts]** Pages compose dependencies via factory or manual DI
- [ ] **[2 pts]** Pages handle UI rendering only

```typescript
// ✅ CORRECT - Page uses use case
import { UseCaseFactory } from "@/infrastructure/factories/UseCaseFactory";

export default async function EpisodePage({ params }: Props) {
  const useCase = UseCaseFactory.createGetEpisodeDetailsUseCase();
  const episode = await useCase.execute({ id: params.id });

  return <EpisodeDetail episode={episode} />;
}

// ❌ WRONG - Page calls Prisma directly
import { prisma } from "@/app/_lib/prisma";

export default async function EpisodePage({ params }: Props) {
  const episode = await prisma.episode.findUnique({ where: { id: params.id } });
  return <div>{episode.title}</div>;
}
```

### Dependency Injection (6 points)

- [ ] **[2 pts]** Dependencies are injected via constructor or factory
- [ ] **[2 pts]** Use case factory exists for DI composition
- [ ] **[2 pts]** No direct instantiation of repositories in use cases

```typescript
// ✅ CORRECT - Factory for DI
export class UseCaseFactory {
  static createTrackEpisodeUseCase(): TrackEpisodeUseCase {
    const episodeRepo = new PrismaEpisodeRepository();
    return new TrackEpisodeUseCase(episodeRepo);
  }
}

// ❌ WRONG - Direct instantiation in use case
export class TrackEpisodeUseCase {
  async execute(input: TrackEpisodeInput) {
    const repo = new PrismaEpisodeRepository(); // VIOLATION!
    await repo.save(...);
  }
}
```

---

## Layer 5: Testing (10 points)

### Domain Tests (4 points)

- [ ] **[2 pts]** Domain entities are tested with pure unit tests
- [ ] **[2 pts]** Domain tests have zero mocks or database

```typescript
// ✅ CORRECT - Pure unit test
describe("Episode", () => {
  it("updates rating correctly", () => {
    const episode = Episode.create({ id: 1, title: "Test", rating: 3 });
    const updated = episode.updateRating(5);

    expect(updated.rating).toBe(5);
    expect(episode.rating).toBe(3); // Immutability
  });
});
```

### Use Case Tests (4 points)

- [ ] **[2 pts]** Use cases are tested with mocked repositories
- [ ] **[2 pts]** Use case tests verify business flow, not implementation

```typescript
// ✅ CORRECT - Use case test with mocks
describe("TrackEpisodeUseCase", () => {
  it("tracks episode successfully", async () => {
    const mockRepo: EpisodeRepository = {
      findById: vi.fn().mockResolvedValue(Episode.create({...})),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new TrackEpisodeUseCase(mockRepo);
    const result = await useCase.execute({ episodeId: 1, rating: 5 });

    expect(result.newRating).toBe(5);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

### Infrastructure Tests (2 points)

- [ ] **[1 pt]** Repositories have integration tests with database
- [ ] **[1 pt]** Mappers are tested for correct conversion

```typescript
// ✅ CORRECT - Integration test
describe("PrismaEpisodeRepository", () => {
  it("saves and retrieves episode", async () => {
    const repository = new PrismaEpisodeRepository();
    const episode = Episode.create({ id: 1, title: "Test", rating: 5 });

    await repository.save(episode);
    const retrieved = await repository.findById(1);

    expect(retrieved?.rating).toBe(5);
  });
});
```

---

## Quick Validation Commands

### Check for Domain violations

```bash
# Search for framework imports in domain layer
grep -r "from '@/app" core/domain/
grep -r "from '@/infrastructure" core/domain/
grep -r "import.*prisma" core/domain/

# Should return ZERO results
```

### Check for Application violations

```bash
# Search for Infrastructure imports in Application layer
grep -r "from '@/infrastructure" core/application/

# Should return ZERO results (except in tests)
```

### Check for Use Case God Classes

```bash
# Find use cases with too many methods
find core/application/use-cases -name "*.ts" -exec sh -c 'echo "$1: $(grep -c "async execute" "$1")"' _ {} \;

# Each use case should have exactly ONE execute method
```

### Check for Anemic Domain Models

```bash
# Find entities with no methods (just properties)
find core/domain/entities -name "*.ts" -exec sh -c '
  methods=$(grep -c "^\s*[a-zA-Z].*(): " "$1")
  if [ "$methods" -lt 2 ]; then
    echo "$1: Only $methods methods (possible anemic model)"
  fi
' _ {} \;
```

---

## Scoring Summary

| Category             | Max Points | Your Score |
| -------------------- | ---------- | ---------- |
| Domain Layer         | 25         | \_\_\_     |
| Application Layer    | 25         | \_\_\_     |
| Infrastructure Layer | 20         | \_\_\_     |
| Delivery Layer       | 20         | \_\_\_     |
| Testing              | 10         | \_\_\_     |
| **TOTAL**            | **100**    | **\_\_\_** |

### Grade Interpretation

- **90-100 (A):** Excellent Clean Architecture adherence. Minor improvements only.
- **75-89 (B):** Good implementation with some violations. Refactor problem areas.
- **60-74 (C):** Acceptable but needs improvement. Focus on Dependency Rule.
- **45-59 (D):** Significant violations. Review core principles.
- **<45 (F):** Major architectural issues. Consider migration guide.

---

## Common Violations and Fixes

### Violation #1: Domain Depends on Framework

```typescript
// ❌ VIOLATION
import { prisma } from "@/app/_lib/prisma";
export class Episode {
  async save() {
    await prisma.episode.update(...);
  }
}

// ✅ FIX
export class Episode {
  updateRating(newRating: number): Episode {
    return new Episode(this.id, this.title, newRating);
  }
}
// Move persistence to repository
```

### Violation #2: Use Case Depends on Concrete Class

```typescript
// ❌ VIOLATION
import { PrismaEpisodeRepository } from "@/infrastructure/prisma";
export class TrackEpisodeUseCase {
  async execute() {
    const repo = new PrismaEpisodeRepository();
  }
}

// ✅ FIX
import { EpisodeRepository } from "../ports/EpisodeRepository";
export class TrackEpisodeUseCase {
  constructor(private repository: EpisodeRepository) {}
}
```

### Violation #3: Server Action Contains Business Logic

```typescript
// ❌ VIOLATION
export async function trackEpisode(episodeId: number, rating: number) {
  if (rating < 1 || rating > 5) {
    throw new Error("Invalid rating");
  }
  await prisma.episode.update({...});
}

// ✅ FIX
export async function trackEpisode(episodeId: number, rating: number) {
  const useCase = UseCaseFactory.createTrackEpisodeUseCase();
  return useCase.execute({ episodeId, rating });
}
```

---

## Quick Wins (High Impact, Low Effort)

1. **Extract validation to Value Objects** - Move input validation from Server Actions to Value Objects
2. **Create repository interfaces** - Define ports in Application layer
3. **Remove Prisma from pages** - Use use cases instead of direct Prisma calls
4. **Create use case factory** - Centralize dependency injection
5. **Write domain tests** - Test business logic without database

---

## Next Steps

After completing this checklist:

1. **Calculate your score** using the scorecard
2. **Identify violations** with highest point values
3. **Create action plan** to fix critical violations first
4. **Re-run validation** after fixes
5. **Aim for A grade** (90-100 points)

Use the automated validation script for continuous monitoring:

```bash
pnpm tsx .github/skills/clean-architecture-frontend/scripts/validate-clean-arch.ts
```
