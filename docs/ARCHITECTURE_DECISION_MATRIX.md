# Architecture Decision Matrix

## 🎯 Purpose

This document provides a **pragmatic guide** for choosing between simple patterns and full DDD/Clean Architecture patterns. The goal is to **avoid over-engineering** while maintaining proper architecture where it adds real value.

> **YAGNI Principle:** You Ain't Gonna Need It. Don't add complexity unless there's a clear, immediate need.

---

## 📊 Decision Matrix

| Criteria              | Simple Pattern ✅            | DDD/Clean Pattern 🏗️                  |
| --------------------- | ---------------------------- | ------------------------------------- |
| **Operation Type**    | Read-only CRUD               | Mutations with business rules         |
| **Business Rules**    | None or trivial              | Complex validation, state transitions |
| **Data Ownership**    | Public data                  | User-owned, requires auth             |
| **Testability Needs** | Integration tests sufficient | Unit tests on business logic          |
| **Team Size**         | Solo or small                | Large, needs clear boundaries         |
| **Change Frequency**  | Stable, rarely changes       | High churn, frequent rule changes     |

---

## 🏷️ Domain Classification

### 🟢 Simple Domains (Direct Repository Pattern)

**Characteristics:**

- Mostly read operations
- No complex business rules
- Data validation handled by Zod at delivery layer
- No user-specific state management

| Domain              | Operations              | Pattern       | Rationale                         |
| ------------------- | ----------------------- | ------------- | --------------------------------- |
| **Characters**      | List, Get by ID, Search | Direct Prisma | Pure data retrieval, no mutations |
| **Episodes (Read)** | List, Get by ID         | Direct Prisma | Public catalog data               |
| **Locations**       | List all                | Direct Prisma | Static reference data             |

**Implementation:**

```typescript
// app/_lib/repositories.ts - Simple, direct access
export async function findAllCharacters(limit = 50) {
  return prisma.character.findMany({ take: limit });
}

// app/characters/page.tsx - Direct usage
const characters = await findAllCharacters();
```

### 🟡 Hybrid Domains (Mixed Patterns)

**Characteristics:**

- Both read (simple) and write (complex) operations
- Writes involve business rules
- Reads are straightforward

| Domain                  | Simple Operations | Complex Operations            |
| ----------------------- | ----------------- | ----------------------------- |
| **Episodes**            | List, Get details | Track progress, Rate          |
| **Characters (Social)** | View comments     | Follow/Unfollow, Post comment |

**Implementation:**

```typescript
// READ: Direct repository (simple)
const episode = await findEpisodeById(id);

// WRITE: Use Case pattern (complex)
const useCase = UseCaseFactory.createTrackEpisodeUseCase();
await useCase.execute({ episodeId, rating }, userId);
```

### 🔴 Complex Domains (Full DDD/Clean Architecture)

**Characteristics:**

- Mutations with business rules
- Validation requires domain knowledge
- State management (user-owned data)
- Authorization requirements (RLS)
- Cross-entity operations

| Domain            | Why Full DDD?                          |
| ----------------- | -------------------------------------- |
| **Diary**         | User ownership, business rules, RLS    |
| **Collections**   | Ownership, quota limits, validation    |
| **Trivia**        | Submission rules, entity relationships |
| **User Progress** | Rating validation, history tracking    |

**Implementation:**

```typescript
// Full DDD with Use Case
export async function createDiaryEntry(...) {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const useCase = UseCaseFactory.createCreateDiaryEntryUseCase();
    await useCase.execute({ characterId, locationId, description }, user.id);
    revalidatePath("/diary");
    return { success: true };
  });
}
```

---

## 📁 File Organization by Pattern

### Simple Pattern Structure

```
app/
  _lib/
    repositories.ts    # Direct Prisma queries
  characters/
    page.tsx           # Uses repositories directly
  episodes/
    page.tsx           # Uses repositories directly
```

### DDD Pattern Structure

```
core/
  domain/
    entities/          # Business objects
    exceptions/        # Domain errors
  application/
    use-cases/         # Business operations
    ports/             # Repository interfaces

infrastructure/
  prisma/
    repositories/      # Implements ports

app/
  _actions/
    diary.ts           # Delegates to use cases
    collections.ts     # Delegates to use cases
```

---

## 🚦 Decision Flowchart

```
                    ┌─────────────────┐
                    │ New Feature     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Is it read-only?│
                    └────────┬────────┘
                        Yes/ │ \No
                           / │   \
          ┌───────────────┐  │    ┌───────────────────┐
          │ Use Simple    │  │    │ Has business rules │
          │ Repository    │  │    │ or validation?     │
          └───────────────┘  │    └─────────┬─────────┘
                             │          Yes/ │ \No
                             │             / │   \
                             │  ┌──────────┐ │ ┌──────────────┐
                             │  │ Use DDD  │ │ │ Use Simple   │
                             │  │ Pattern  │ │ │ with Zod     │
                             │  └──────────┘ │ └──────────────┘
                             │               │
                    ┌────────▼───────────────▼┐
                    │ Requires authentication? │
                    └────────────┬────────────┘
                            Yes/ │ \No
                               / │   \
               ┌──────────────┐  │    ┌──────────────┐
               │ Add RLS      │  │    │ Public       │
               │ Protection   │  │    │ Access OK    │
               └──────────────┘  │    └──────────────┘
```

---

## 📝 Examples from This Project

### ✅ Correct: Simple Pattern for Characters List

```typescript
// app/_lib/repositories.ts
// WHY SIMPLE: Read-only, no business rules, public data
export async function findAllCharacters(limit = 50) {
  return prisma.character.findMany({ take: limit });
}

// app/characters/page.tsx
// WHY DIRECT: No transformation needed, just display
const characters = await findAllCharacters();
```

### ✅ Correct: DDD Pattern for Diary Entry

```typescript
// app/_actions/diary.ts
// WHY DDD: User ownership, business rules, RLS required
export async function createDiaryEntry(...) {
  return withAuthenticatedRLS(prisma, async (tx, user) => {
    const useCase = UseCaseFactory.createCreateDiaryEntryUseCase();
    // UseCase validates: character exists, location exists, description rules
    await useCase.execute(input, user.id);
  });
}
```

### ✅ Correct: Hybrid Pattern for Episodes

```typescript
// READ (Simple): app/_lib/repositories.ts
export async function findAllEpisodes() {
  return prisma.episode.findMany();
}

// WRITE (DDD): app/_actions/episodes.ts
export async function trackEpisode(...) {
  const useCase = UseCaseFactory.createTrackEpisodeUseCase();
  // UseCase validates: episode exists, rating 1-5, user context
  await useCase.execute({ episodeId, rating }, userId);
}
```

---

## ⚠️ Anti-Patterns to Avoid

### ❌ Over-engineering Simple Operations

```typescript
// DON'T: Use Case for simple list
class ListCharactersUseCase {
  execute() {
    return this.repo.findAll(); // Just wrapping the repo!
  }
}

// DO: Direct repository call
const characters = await findAllCharacters();
```

### ❌ Under-engineering Complex Operations

```typescript
// DON'T: Raw mutation without validation
export async function createDiaryEntry(data) {
  return prisma.diaryEntry.create({ data }); // No validation!
}

// DO: Use Case with proper validation
const useCase = UseCaseFactory.createCreateDiaryEntryUseCase();
await useCase.execute(validatedData, userId);
```

---

## 🔄 Migration Guidelines

### Moving from Simple → DDD

**When to upgrade:**

1. Business rules are being added
2. Multiple mutations need the same validation
3. Testing becomes difficult
4. Security vulnerabilities found

**Steps:**

1. Create domain entity with validation
2. Create use case encapsulating logic
3. Create repository interface (port)
4. Move Prisma code to infrastructure
5. Update Server Action to use factory

### Moving from DDD → Simple

**When to downgrade:**

1. Use case is just pass-through
2. No business rules in domain entity
3. Tests don't need domain isolation
4. Team agrees complexity isn't justified

**Steps:**

1. Move logic to repository function
2. Delete empty use case
3. Update Server Action to use repository directly
4. Remove unused domain entity (if no other users)

---

## 📚 Further Reading

- [YAGNI Principle](https://martinfowler.com/bliki/Yagni.html) - Martin Fowler
- [Simple Design](https://www.agilealliance.org/glossary/simple-design/) - Agile Alliance
- [When to Use DDD](https://enterprisecraftsmanship.com/posts/when-to-use-ddd/) - Vladimir Khorikov

---

**Last Updated:** January 20, 2026  
**Status:** 📖 Educational Reference
