import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Set dummy DATABASE_URL for tests (mocked anyway)
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

// Import mocks
import {
  mockGetCurrentUser,
  mockGetCurrentUserOptional,
  mockUser,
} from "./__mocks__/auth";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup default auth mock behavior before each test
beforeEach(() => {
  // By default, assume user is authenticated
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockGetCurrentUserOptional.mockResolvedValue(mockUser);
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock Next.js image component
vi.mock("next/image", () => ({
  default: (props: any) => props,
}));

// Mock Next.js cache functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Prisma RLS helpers
vi.mock("@/app/_lib/prisma-rls", async () => {
  const actual = await import("./__mocks__/prisma-rls");
  return actual;
});

// Mock UseCaseFactory for Clean Architecture
vi.mock("@/infrastructure/factories", async () => {
  const actual =
    await import("./__mocks__/infrastructure/factories/UseCaseFactory");
  return actual;
});

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
