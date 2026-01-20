# Clean Architecture Quick Start Guide

Fast-track guide to implementing Clean Architecture in The Simpsons API project.

## 🚀 30-Second Overview

Clean Architecture separates business logic from framework code through **four layers**:

1. **Domain** (innermost): Pure business logic, zero dependencies
2. **Application**: Use cases and interfaces
3. **Infrastructure**: Database, APIs, adapters
4. **Delivery** (outermost): Next.js pages, components, Server Actions

**Golden Rule:** Dependencies point inward only. Domain knows nothing about frameworks.

---

## 📂 Quick Setup (5 minutes)

### Step 1: Create Directory Structure

```bash
# Create core directories
mkdir -p core/domain/{entities,value-objects,services,exceptions}
mkdir -p core/application/{use-cases,ports,dtos}
mkdir -p infrastructure/prisma/{repositories,mappers}
mkdir -p infrastructure/factories
```

### Step 2: Verify Structure

```
core/
  domain/
    entities/         # Business objects (Episode, Character, User)
    value-objects/    # Immutable values (Rating, EmailAddress)
    services/         # Complex business rules
    exceptions/       # Domain-specific errors
  application/
    use-cases/        # User actions (TrackEpisodeUseCase)
    ports/            # Interfaces (EpisodeRepository)
    dtos/             # Input/Output types
infrastructure/
  prisma/
    repositories/     # Prisma implementations
    mappers/          # Domain ↔ Database conversion
  factories/          # Dependency injection
```

---

## 📝 Layer Templates

### Domain Entity Template

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

  get rating(): number {
    return this._rating;
  }

  get isHighlyRated(): boolean {
    return this._rating >= 4;
  }
}

export interface EpisodeData {
  id: number;
  title: string;
  rating: number;
}
```

### Value Object Template

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

### Repository Interface Template (Port)

```typescript
// core/application/ports/EpisodeRepository.ts
import { Episode } from "@/core/domain/entities/Episode";

export interface EpisodeRepository {
  findById(id: number): Promise<Episode | null>;
  findAll(): Promise<Episode[]>;
  save(episode: Episode): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### Use Case Template

```typescript
// core/application/use-cases/TrackEpisodeUseCase.ts
import { Episode } from "@/core/domain/entities/Episode";
import { Rating } from "@/core/domain/value-objects/Rating";
import { EpisodeRepository } from "../ports/EpisodeRepository";

export interface TrackEpisodeInput {
  episodeId: number;
  rating: number;
}

export interface TrackEpisodeOutput {
  episodeId: number;
  newRating: number;
}

export class TrackEpisodeUseCase {
  constructor(private episodeRepository: EpisodeRepository) {}

  async execute(input: TrackEpisodeInput): Promise<TrackEpisodeOutput> {
    // 1. Validate using Value Object
    const rating = Rating.create(input.rating);

    // 2. Fetch entity
    const episode = await this.episodeRepository.findById(input.episodeId);
    if (!episode) {
      throw new EpisodeNotFoundError(input.episodeId);
    }

    // 3. Apply business logic (domain method)
    const updatedEpisode = episode.updateRating(rating.getValue());

    // 4. Persist
    await this.episodeRepository.save(updatedEpisode);

    // 5. Return DTO
    return {
      episodeId: updatedEpisode.id,
      newRating: updatedEpisode.rating,
    };
  }
}
```

### Mapper Template

```typescript
// infrastructure/prisma/mappers/EpisodeMapper.ts
import { Episode } from "@/core/domain/entities/Episode";
import { Episode as PrismaEpisode } from "@prisma/client";

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

### Repository Implementation Template (Adapter)

```typescript
// infrastructure/prisma/repositories/PrismaEpisodeRepository.ts
import { EpisodeRepository } from "@/core/application/ports/EpisodeRepository";
import { Episode } from "@/core/domain/entities/Episode";
import { prisma } from "@/app/_lib/prisma";
import { EpisodeMapper } from "../mappers/EpisodeMapper";

export class PrismaEpisodeRepository implements EpisodeRepository {
  async findById(id: number): Promise<Episode | null> {
    const record = await prisma.episode.findUnique({ where: { id } });
    return record ? EpisodeMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Episode[]> {
    const records = await prisma.episode.findMany();
    return records.map(EpisodeMapper.toDomain);
  }

  async save(episode: Episode): Promise<void> {
    const data = EpisodeMapper.toPersistence(episode);
    await prisma.episode.update({
      where: { id: episode.id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.episode.delete({ where: { id } });
  }
}
```

### Factory Template

```typescript
// infrastructure/factories/UseCaseFactory.ts
import { TrackEpisodeUseCase } from "@/core/application/use-cases/TrackEpisodeUseCase";
import { PrismaEpisodeRepository } from "@/infrastructure/prisma/repositories/PrismaEpisodeRepository";

export class UseCaseFactory {
  static createTrackEpisodeUseCase(): TrackEpisodeUseCase {
    const episodeRepository = new PrismaEpisodeRepository();
    return new TrackEpisodeUseCase(episodeRepository);
  }
}
```

### Server Action Template (Thin Controller)

```typescript
// app/episodes/[id]/actions.ts
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
```

### Page Template (Composition)

```typescript
// app/episodes/[id]/page.tsx
import { UseCaseFactory } from "@/infrastructure/factories/UseCaseFactory";
import { EpisodeDetail } from "@/app/_components/EpisodeDetail";

export default async function EpisodePage({ params }: { params: { id: string } }) {
  const useCase = UseCaseFactory.createGetEpisodeDetailsUseCase();
  const episode = await useCase.execute({ id: Number(params.id) });

  return <EpisodeDetail episode={episode} />;
}
```

---

## 🛠 Essential Commands

### Create New Entity

```bash
# 1. Create entity file
touch core/domain/entities/Character.ts

# 2. Create test file
touch core/domain/entities/Character.test.ts

# 3. Implement entity
cat > core/domain/entities/Character.ts << 'EOF'
export class Character {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    private _followersCount: number
  ) {}

  static create(data: CharacterData): Character {
    return new Character(data.id, data.name, data.followersCount ?? 0);
  }

  incrementFollowers(): Character {
    return new Character(this.id, this.name, this._followersCount + 1);
  }

  get followersCount(): number {
    return this._followersCount;
  }
}

export interface CharacterData {
  id: number;
  name: string;
  followersCount?: number;
}
EOF
```

### Create New Use Case

```bash
# 1. Create use case files
touch core/application/use-cases/FollowCharacterUseCase.ts
touch core/application/ports/CharacterRepository.ts
touch core/application/dtos/FollowCharacterDTO.ts

# 2. Implement repository interface
cat > core/application/ports/CharacterRepository.ts << 'EOF'
import { Character } from "@/core/domain/entities/Character";

export interface CharacterRepository {
  findById(id: number): Promise<Character | null>;
  save(character: Character): Promise<void>;
}
EOF

# 3. Implement use case
cat > core/application/use-cases/FollowCharacterUseCase.ts << 'EOF'
import { CharacterRepository } from "../ports/CharacterRepository";

export class FollowCharacterUseCase {
  constructor(private characterRepo: CharacterRepository) {}

  async execute(input: { characterId: number }): Promise<void> {
    const character = await this.characterRepo.findById(input.characterId);
    if (!character) throw new Error("Character not found");

    const updated = character.incrementFollowers();
    await this.characterRepo.save(updated);
  }
}
EOF
```

### Create Repository Implementation

```bash
# 1. Create implementation and mapper
touch infrastructure/prisma/repositories/PrismaCharacterRepository.ts
touch infrastructure/prisma/mappers/CharacterMapper.ts

# 2. Implement mapper
cat > infrastructure/prisma/mappers/CharacterMapper.ts << 'EOF'
import { Character } from "@/core/domain/entities/Character";
import { Character as PrismaCharacter } from "@prisma/client";

export class CharacterMapper {
  static toDomain(prisma: PrismaCharacter): Character {
    return Character.create({
      id: prisma.id,
      name: prisma.name,
      followersCount: prisma.followers_count,
    });
  }

  static toPersistence(character: Character) {
    return {
      id: character.id,
      name: character.name,
      followers_count: character.followersCount,
    };
  }
}
EOF
```

### Run Tests by Layer

```bash
# Test domain layer (pure unit tests)
pnpm vitest run core/domain

# Test application layer (use cases with mocks)
pnpm vitest run core/application

# Test infrastructure layer (integration tests)
pnpm vitest run infrastructure/prisma

# Test all layers
pnpm test
```

### Validate Architecture

```bash
# Check for domain violations
grep -r "from '@/app" core/domain/
grep -r "from '@/infrastructure" core/domain/

# Check for application violations
grep -r "from '@/infrastructure" core/application/

# Run automated validation
pnpm tsx .github/skills/clean-architecture-frontend/scripts/validate-clean-arch.ts
```

---

## 💡 Tips and Best Practices

### DO ✅

1. **Keep Domain Pure**
   - Zero framework dependencies
   - All business logic in entities
   - Test without mocks

2. **Use Interfaces**
   - Define ports in Application layer
   - Implement in Infrastructure layer
   - Inject via constructor

3. **Return DTOs**
   - Use cases return DTOs, not entities
   - Prevent domain leakage
   - Control what consumers see

4. **One Use Case = One User Action**
   - Single responsibility
   - Easy to test
   - Clear intent

5. **Immutable Entities**
   - Return new instances on updates
   - Prevent accidental mutations
   - Easier to reason about

### DON'T ❌

1. **Domain Depends on Framework**

   ```typescript
   // ❌ WRONG
   import { prisma } from "@/app/_lib/prisma";
   export class Episode {
     async save() { await prisma.episode.update(...); }
   }
   ```

2. **Use Case Depends on Concrete Class**

   ```typescript
   // ❌ WRONG
   import { PrismaEpisodeRepository } from "@/infrastructure/prisma";
   export class TrackEpisodeUseCase {
     async execute() {
       const repo = new PrismaEpisodeRepository();
     }
   }
   ```

3. **Business Logic in Server Actions**

   ```typescript
   // ❌ WRONG
   export async function trackEpisode(episodeId: number, rating: number) {
     if (rating < 1 || rating > 5) {
       // Should be in domain!
       throw new Error("Invalid rating");
     }
   }
   ```

4. **Anemic Domain Model**

   ```typescript
   // ❌ WRONG
   export class Episode {
     id: number;
     rating: number;
   }
   ```

5. **God Use Cases**
   ```typescript
   // ❌ WRONG
   export class EpisodeManagementUseCase {
     async createEpisode() {...}
     async updateEpisode() {...}
     async deleteEpisode() {...}
     async trackEpisode() {...}
   }
   ```

---

## 🎯 Common Workflows

### Add New Feature (Example: "Rate Episode")

**Step 1: Domain**

```bash
touch core/domain/entities/Episode.ts
touch core/domain/value-objects/Rating.ts
```

**Step 2: Application**

```bash
touch core/application/use-cases/RateEpisodeUseCase.ts
touch core/application/ports/EpisodeRepository.ts
touch core/application/dtos/RateEpisodeDTO.ts
```

**Step 3: Infrastructure**

```bash
touch infrastructure/prisma/repositories/PrismaEpisodeRepository.ts
touch infrastructure/prisma/mappers/EpisodeMapper.ts
```

**Step 4: Delivery**

```bash
touch app/episodes/[id]/actions.ts
```

**Step 5: Wire Up**

```typescript
// infrastructure/factories/UseCaseFactory.ts
static createRateEpisodeUseCase(): RateEpisodeUseCase {
  const repo = new PrismaEpisodeRepository();
  return new RateEpisodeUseCase(repo);
}
```

### Refactor Existing Feature

**Before (Direct Prisma in Server Action):**

```typescript
export async function trackEpisode(episodeId: number, rating: number) {
  await prisma.episode.update({
    where: { id: episodeId },
    data: { rating },
  });
}
```

**After (Clean Architecture):**

1. Create entity: `core/domain/entities/Episode.ts`
2. Create use case: `core/application/use-cases/TrackEpisodeUseCase.ts`
3. Create repository interface: `core/application/ports/EpisodeRepository.ts`
4. Create Prisma adapter: `infrastructure/prisma/repositories/PrismaEpisodeRepository.ts`
5. Update Server Action:

```typescript
export async function trackEpisode(episodeId: number, rating: number) {
  const useCase = UseCaseFactory.createTrackEpisodeUseCase();
  return useCase.execute({ episodeId, rating });
}
```

---

## ❓ FAQ

### Q: Do I need Clean Architecture for every feature?

**A:** No. Start with critical features that have complex business rules. Simple CRUD operations can remain in Server Actions initially.

### Q: Can I mix Clean Architecture with current structure?

**A:** Yes! Migrate progressively. Keep existing code working while adding new features using Clean Architecture.

### Q: How do I handle Next.js-specific concerns (revalidation, cookies)?

**A:** Keep them in Delivery layer (Server Actions). Use cases should be framework-agnostic.

```typescript
// ✅ CORRECT - Framework concerns in Server Action
export async function trackEpisode(episodeId: number, rating: number) {
  const useCase = UseCaseFactory.createTrackEpisodeUseCase();
  const result = await useCase.execute({ episodeId, rating });

  revalidatePath(`/episodes/${episodeId}`); // Next.js concern
  return result;
}
```

### Q: What about Form Actions with useFormAction()?

**A:** Server Actions remain thin controllers. Use cases handle business logic.

```typescript
"use server";
export async function trackEpisode(formData: FormData) {
  const episodeId = Number(formData.get("episodeId"));
  const rating = Number(formData.get("rating"));

  const useCase = UseCaseFactory.createTrackEpisodeUseCase();
  return useCase.execute({ episodeId, rating });
}
```

### Q: How do I test use cases?

**A:** Mock repository interfaces. No database needed.

```typescript
describe("TrackEpisodeUseCase", () => {
  it("tracks episode successfully", async () => {
    const mockRepo: EpisodeRepository = {
      findById: vi.fn().mockResolvedValue(Episode.create({...})),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new TrackEpisodeUseCase(mockRepo);
    await useCase.execute({ episodeId: 1, rating: 5 });

    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

### Q: Can I use Prisma directly in pages?

**A:** Avoid it. Use use cases for data fetching to keep pages thin.

```typescript
// ❌ WRONG
export default async function EpisodePage({ params }: Props) {
  const episode = await prisma.episode.findUnique({ where: { id: params.id } });
  return <div>{episode.title}</div>;
}

// ✅ CORRECT
export default async function EpisodePage({ params }: Props) {
  const useCase = UseCaseFactory.createGetEpisodeDetailsUseCase();
  const episode = await useCase.execute({ id: params.id });
  return <div>{episode.title}</div>;
}
```

---

## 📚 Next Steps

1. **Read full SKILL.md** for comprehensive guide
2. **Review MIGRATION_EXAMPLE.md** for step-by-step migration
3. **Use VALIDATION_CHECKLIST.md** to verify implementation
4. **Run validation script** to catch violations early

Start with one feature, perfect it, then expand. Clean Architecture is a journey, not a destination.
