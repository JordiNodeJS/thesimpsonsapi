"use client";

import { useState, useCallback, useTransition, useEffect } from "react";

/**
 * Hook para persistir estado en localStorage (SSR-safe).
 * Evita hydration mismatch usando patron de "mounted" para acceder a localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado con valor inicial seguro para SSR
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  // Efecto para cargar desde localStorage después de montaje en cliente
  useEffect(() => {
    try {
      if (globalThis.window !== undefined) {
        const item = globalThis.window.localStorage.getItem(key);
        const value = item ? JSON.parse(item) : initialValue;
        setStoredValue(value);
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    setMounted(true);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = typeof value === "function" ? value(prev) : value;
          if (globalThis.window !== undefined) {
            globalThis.window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
    },
    [key],
  );

  // Retornar el valor inicial hasta que el componente esté montado
  // Esto evita hydration mismatch
  return [mounted ? storedValue : initialValue, setValue] as const;
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
  },
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
    [action, options],
  );

  return { execute, isPending, error };
}
