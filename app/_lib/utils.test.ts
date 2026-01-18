import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden-class', 'visible-class');
    expect(result).toBe('base-class visible-class');
  });

  it('should merge conflicting tailwind classes', () => {
    const result = cn('px-2 py-1', 'p-3');
    expect(result).toBe('p-3');
  });

  it('should handle empty strings', () => {
    const result = cn('', 'valid-class');
    expect(result).toBe('valid-class');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('should merge multiple classes without conflicts', () => {
    const result = cn('text-sm font-bold', 'text-blue-500', 'hover:text-blue-700');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
    expect(result).toContain('text-blue-500');
  });
});
