import { vi } from 'vitest';

// Mock authenticated user data
export const mockUser = {
  id: 'test-user-id-123',
  username: 'testuser',
  email: 'test@example.com',
  emailVerified: false,
  image: null,
  name: 'Test User',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// Mock auth functions
export const mockGetCurrentUser = vi.fn();
export const mockGetCurrentUserOptional = vi.fn();

// Mock the auth module
vi.mock('@/app/_lib/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
  getCurrentUserOptional: mockGetCurrentUserOptional,
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));
