"use client";

import { useState, useCallback, useTransition } from "react";

/**
 * Hook para persistir estado en localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.error(error);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}

/**
 * Hook para manejar el submit de formularios con server actions.
 * Proporciona estado de loading y manejo de errores consistente.
 */
export function useFormAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options?: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: Error) => void;
  }
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    (...args: TArgs) => {
      setError(null);
      startTransition(async () => {
        try {
          const result = await action(...args);
          options?.onSuccess?.(result);
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          setError(err);
          options?.onError?.(err);
          console.error("Form action failed:", err);
        }
      });
    },
    [action, options]
  );

  return { execute, isPending, error };
}
