# Clean Architecture Migration Example

Complete migration guide for The Simpsons API from current structure to Clean Architecture.

## Current vs Proposed Structure

### Current Structure (Framework-Coupled)

```
app/
  _lib/
    prisma.ts                    # Database client
    repositories.ts              # Data fetching
    auth.ts                      # Authentication
  _actions/
    episodes.ts                  # Server actions with business logic
    social.ts                    # Server actions with business logic
  _components/
    EpisodeTracker.tsx           # UI component
  episodes/
    [id]/
      page.tsx                   # Page with Prisma calls
```

**Problems:**

- ❌ Business logic scattered in Server Actions
- ❌ Direct Prisma calls in pages
- ❌ Difficult to test without database
- ❌ Tightly coupled to Next.js framework
- ❌ Hard to reuse logic across different UI layers

### Proposed Structure (Clean Architecture)

```
core/
  domain/
    entities/
      Episode.ts                 # Pure business object
      Character.ts
    value-objects/
      Rating.ts                  # Immutable validated value
      EmailAddress.ts
    services/
      EpisodeRecommendationService.ts
    exceptions/
      InvalidRatingError.ts
  application/
    use-cases/
      TrackEpisodeUseCase.ts     # Orchestrate tracking
      FollowCharacterUseCase.ts
    ports/
      EpisodeRepository.ts       # Interface (contract)
      CharacterRepository.ts
    dtos/
      TrackEpisodeDTO.ts         # Input/Output types

infrastructure/
  prisma/
    repositories/
      PrismaEpisodeRepository.ts # Implements EpisodeRepository
      PrismaCharacterRepository.ts
    mappers/
      EpisodeMapper.ts           # Domain ↔ Database mapping
  factories/
    UseCaseFactory.ts            # Dependency injection

app/
  _lib/
    prisma.ts                    # Keep framework utilities
    auth.ts
  _components/
    EpisodeTracker.tsx           # Thin UI component
  episodes/
    [id]/
      page.tsx                   # Thin orchestration
      actions.ts                 # Thin controllers
```

**Benefits:**

- ✅ Business logic in testable Domain layer
- ✅ Use cases orchestrate domain logic
- ✅ Framework-independent core
- ✅ Easy to swap Prisma for another ORM
- ✅ Reusable across web, mobile, CLI

---

## Complete Migration: "User Authentication" Feature

Let's migrate the user authentication feature from current structure to Clean Architecture.

### Phase 1: Current Implementation (Before)

#### Current: Server Action with Mixed Concerns

```typescript
// app/_actions/auth.ts (BEFORE)
"use server";

import { prisma } from "@/app/_lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginUser(email: string, password: string) {
  // Validation
  const validated = LoginSchema.parse({ email, password });

  // Database query
  const user = await prisma.user.findUnique({
    where: { email: validated.email.toLowerCase() },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Business logic
  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }

  // Password check
  const isValid = await bcrypt.compare(validated.password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // Framework-specific action
  await signIn("credentials", {
    email: user.email,
    redirect: false,
  });

  return { success: true, userId: user.id };
}
```

**Problems:**

- Mixed validation, business logic, database access, and auth framework
- Cannot test business rules without database
- Tightly coupled to Next.js and Prisma
- Difficult to reuse in mobile app or CLI

### Phase 2: Clean Architecture Implementation (After)

#### Step 1: Create Domain Entities

```typescript
// core/domain/entities/User.ts
export class User {
  private constructor(
    public readonly id: string,
    private _email: string,
    private _passwordHash: string,
    private _isActive: boolean,
    private _lastLoginAt: Date | null,
  ) {}

  static create(data: UserData): User {
    return new User(
      data.id,
      data.email.toLowerCase(),
      data.passwordHash,
      data.isActive ?? true,
      data.lastLoginAt ?? null,
    );
  }

  // Business rule: Active users can log in
  canLogin(): boolean {
    return this._isActive;
  }

  // Business rule: Update last login timestamp
  recordLogin(): User {
    return new User(
      this.id,
      this._email,
      this._passwordHash,
      this._isActive,
      new Date(),
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this._email,
      this._passwordHash,
      false,
      this._lastLoginAt,
    );
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
}
```

```typescript
// core/domain/value-objects/EmailAddress.ts
export class EmailAddress {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(email: string): EmailAddress {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailError(`Invalid email: ${email}`);
    }
    return new EmailAddress(email.toLowerCase());
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split("@")[1];
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}
```

```typescript
// core/domain/services/PasswordService.ts
import bcrypt from "bcryptjs";

export class PasswordService {
  async verify(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, 10);
  }
}
```

```typescript
// core/domain/exceptions/UserExceptions.ts
export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`User not found: ${email}`);
    this.name = "UserNotFoundError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super("Account is deactivated");
    this.name = "InactiveUserError";
  }
}
```

#### Step 2: Define Application Layer (Use Cases + Ports)

```typescript
// core/application/ports/UserRepository.ts
import { User } from "@/core/domain/entities/User";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

```typescript
// core/application/ports/AuthenticationService.ts
export interface AuthenticationService {
  signIn(email: string): Promise<void>;
}
```

```typescript
// core/application/dtos/LoginDTO.ts
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  userId: string;
  email: string;
  lastLoginAt: Date;
}
```

```typescript
// core/application/use-cases/LoginUserUseCase.ts
import { User } from "@/core/domain/entities/User";
import { EmailAddress } from "@/core/domain/value-objects/EmailAddress";
import { PasswordService } from "@/core/domain/services/PasswordService";
import { UserRepository } from "../ports/UserRepository";
import { AuthenticationService } from "../ports/AuthenticationService";
import { LoginInput, LoginOutput } from "../dtos/LoginDTO";
import {
  UserNotFoundError,
  InvalidCredentialsError,
  InactiveUserError,
} from "@/core/domain/exceptions/UserExceptions";

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthenticationService,
    private passwordService: PasswordService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Validate email format using Value Object
    const email = EmailAddress.create(input.email);

    // 2. Fetch user from repository
    const user = await this.userRepository.findByEmail(email.getValue());
    if (!user) {
      throw new UserNotFoundError(input.email);
    }

    // 3. Check if user can login (business rule)
    if (!user.canLogin()) {
      throw new InactiveUserError();
    }

    // 4. Verify password using Domain Service
    const isPasswordValid = await this.passwordService.verify(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 5. Update user state (business rule)
    const updatedUser = user.recordLogin();
    await this.userRepository.save(updatedUser);

    // 6. Sign in via authentication service
    await this.authService.signIn(user.email);

    // 7. Return DTO
    return {
      userId: updatedUser.id,
      email: updatedUser.email,
      lastLoginAt: updatedUser.lastLoginAt!,
    };
  }
}
```

#### Step 3: Implement Infrastructure Adapters

```typescript
// infrastructure/prisma/mappers/UserMapper.ts
import { User } from "@/core/domain/entities/User";
import { User as PrismaUser } from "@prisma/client";

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.password,
      isActive: prismaUser.isActive,
      lastLoginAt: prismaUser.lastLoginAt,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.email,
      password: user.passwordHash,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
```

```typescript
// infrastructure/prisma/repositories/PrismaUserRepository.ts
import { UserRepository } from "@/core/application/ports/UserRepository";
import { User } from "@/core/domain/entities/User";
import { prisma } from "@/app/_lib/prisma";
import { UserMapper } from "../mappers/UserMapper";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { email },
    });

    return record ? UserMapper.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await prisma.user.update({
      where: { id: user.id },
      data,
    });
  }
}
```

```typescript
// infrastructure/auth/BetterAuthService.ts
import { AuthenticationService } from "@/core/application/ports/AuthenticationService";
import { signIn } from "@/lib/auth";

export class BetterAuthService implements AuthenticationService {
  async signIn(email: string): Promise<void> {
    await signIn("credentials", {
      email,
      redirect: false,
    });
  }
}
```

#### Step 4: Create Dependency Injection Factory

```typescript
// infrastructure/factories/UseCaseFactory.ts
import { LoginUserUseCase } from "@/core/application/use-cases/LoginUserUseCase";
import { PrismaUserRepository } from "@/infrastructure/prisma/repositories/PrismaUserRepository";
import { BetterAuthService } from "@/infrastructure/auth/BetterAuthService";
import { PasswordService } from "@/core/domain/services/PasswordService";

export class UseCaseFactory {
  static createLoginUserUseCase(): LoginUserUseCase {
    const userRepository = new PrismaUserRepository();
    const authService = new BetterAuthService();
    const passwordService = new PasswordService();

    return new LoginUserUseCase(userRepository, authService, passwordService);
  }
}
```

#### Step 5: Refactor Delivery Layer (Server Action)

```typescript
// app/_actions/auth.ts (AFTER)
"use server";

import { UseCaseFactory } from "@/infrastructure/factories/UseCaseFactory";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginUser(email: string, password: string) {
  // 1. Validate input (framework concern)
  const validated = LoginSchema.parse({ email, password });

  // 2. Execute use case
  try {
    const useCase = UseCaseFactory.createLoginUserUseCase();
    const result = await useCase.execute({
      email: validated.email,
      password: validated.password,
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
```

---

## Testing Examples

### Before: Hard to Test (Requires Database)

```typescript
// ❌ Cannot test without Prisma and database
describe("loginUser", () => {
  it("logs in user successfully", async () => {
    // Need to setup Prisma, seed database, mock auth...
    await prisma.user.create({
      data: { email: "test@example.com", password: "hashed..." },
    });

    const result = await loginUser("test@example.com", "password123");

    expect(result.success).toBe(true);
  });
});
```

### After: Easy to Test (Pure Business Logic)

```typescript
// ✅ Test Domain Entity (Zero dependencies)
import { describe, it, expect } from "vitest";
import { User } from "./User";
import { InactiveUserError } from "../exceptions/UserExceptions";

describe("User Entity", () => {
  it("allows active users to login", () => {
    const user = User.create({
      id: "1",
      email: "test@example.com",
      passwordHash: "hashed",
      isActive: true,
    });

    expect(user.canLogin()).toBe(true);
  });

  it("prevents inactive users from logging in", () => {
    const user = User.create({
      id: "1",
      email: "test@example.com",
      passwordHash: "hashed",
      isActive: false,
    });

    expect(user.canLogin()).toBe(false);
  });

  it("records last login timestamp", () => {
    const user = User.create({
      id: "1",
      email: "test@example.com",
      passwordHash: "hashed",
      isActive: true,
    });

    const updatedUser = user.recordLogin();

    expect(updatedUser.lastLoginAt).toBeInstanceOf(Date);
  });
});

// ✅ Test Use Case (With mocks, no database)
import { describe, it, expect, vi } from "vitest";
import { LoginUserUseCase } from "./LoginUserUseCase";
import { UserRepository } from "../ports/UserRepository";
import { AuthenticationService } from "../ports/AuthenticationService";
import { PasswordService } from "@/core/domain/services/PasswordService";
import { User } from "@/core/domain/entities/User";

describe("LoginUserUseCase", () => {
  it("logs in user successfully", async () => {
    // Mock dependencies
    const mockUserRepo: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(
        User.create({
          id: "1",
          email: "test@example.com",
          passwordHash: "hashed",
          isActive: true,
        }),
      ),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const mockAuthService: AuthenticationService = {
      signIn: vi.fn().mockResolvedValue(undefined),
    };

    const mockPasswordService: PasswordService = {
      verify: vi.fn().mockResolvedValue(true),
      hash: vi.fn(),
    };

    // Execute use case
    const useCase = new LoginUserUseCase(
      mockUserRepo,
      mockAuthService,
      mockPasswordService,
    );

    const result = await useCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    // Verify
    expect(result.userId).toBe("1");
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockAuthService.signIn).toHaveBeenCalledWith("test@example.com");
  });

  it("throws error for inactive user", async () => {
    const mockUserRepo: UserRepository = {
      findByEmail: vi.fn().mockResolvedValue(
        User.create({
          id: "1",
          email: "test@example.com",
          passwordHash: "hashed",
          isActive: false, // Inactive!
        }),
      ),
      save: vi.fn(),
    };

    const mockAuthService: AuthenticationService = {
      signIn: vi.fn(),
    };

    const mockPasswordService: PasswordService = {
      verify: vi.fn(),
      hash: vi.fn(),
    };

    const useCase = new LoginUserUseCase(
      mockUserRepo,
      mockAuthService,
      mockPasswordService,
    );

    await expect(
      useCase.execute({
        email: "test@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Account is deactivated");
  });
});
```

---

## Step-by-Step Migration Guide

### Week 1-2: Setup Core Structure

```bash
# Create directories
mkdir -p core/domain/entities
mkdir -p core/domain/value-objects
mkdir -p core/domain/services
mkdir -p core/domain/exceptions
mkdir -p core/application/use-cases
mkdir -p core/application/ports
mkdir -p core/application/dtos
mkdir -p infrastructure/prisma/repositories
mkdir -p infrastructure/prisma/mappers
mkdir -p infrastructure/factories
```

### Week 3-4: Extract Domain Entities

1. **Identify core entities:** User, Episode, Character, Collection
2. **Extract business rules** from Server Actions
3. **Create entity classes** with validation
4. **Write domain tests** (100% coverage)

Example:

```bash
# Create User entity
touch core/domain/entities/User.ts

# Create tests
touch core/domain/entities/User.test.ts
```

### Week 5-6: Create Use Cases

1. **List all user actions** (login, track episode, follow character)
2. **Create one use case per action**
3. **Define repository interfaces** (ports)
4. **Test use cases with mocks**

Example:

```bash
# Create use case
touch core/application/use-cases/TrackEpisodeUseCase.ts

# Create repository interface
touch core/application/ports/EpisodeRepository.ts

# Create tests
touch core/application/use-cases/TrackEpisodeUseCase.test.ts
```

### Week 7-8: Implement Infrastructure

1. **Create Prisma repository implementations**
2. **Create mappers** (Domain ↔ Prisma)
3. **Write integration tests**

Example:

```bash
# Create Prisma implementation
touch infrastructure/prisma/repositories/PrismaEpisodeRepository.ts

# Create mapper
touch infrastructure/prisma/mappers/EpisodeMapper.ts

# Create tests
touch infrastructure/prisma/repositories/PrismaEpisodeRepository.test.ts
```

### Week 9-10: Refactor Delivery Layer

1. **Create use case factory** for DI
2. **Update Server Actions** to use use cases
3. **Remove direct Prisma calls** from app/
4. **Update pages** to use use cases

Example:

```typescript
// Before
export async function trackEpisode(episodeId: number, rating: number) {
  await prisma.userEpisodeProgress.upsert({...});
}

// After
export async function trackEpisode(episodeId: number, rating: number) {
  const useCase = UseCaseFactory.createTrackEpisodeUseCase();
  return useCase.execute({ episodeId, rating });
}
```

---

## Summary: Before vs After

| Aspect                 | Before (Current)            | After (Clean Architecture)         |
| ---------------------- | --------------------------- | ---------------------------------- |
| **Business Logic**     | Scattered in Server Actions | Centralized in Domain layer        |
| **Database Access**    | Direct Prisma calls         | Repository pattern with interfaces |
| **Testing**            | Requires database setup     | Pure unit tests for domain         |
| **Framework Coupling** | Tightly coupled to Next.js  | Framework-agnostic core            |
| **Reusability**        | Hard to reuse               | Easy to port to mobile/CLI         |
| **Maintainability**    | Mixed concerns              | Clear separation of concerns       |

---

## Next Steps

1. Start with **one critical feature** (e.g., user authentication)
2. Create domain entities with tests
3. Define use cases and repository interfaces
4. Implement Prisma adapters
5. Refactor Server Actions to use use cases
6. Repeat for other features

**Remember:** Clean Architecture is about separation of concerns and dependency direction, not perfection. Start small, iterate, and improve incrementally.
