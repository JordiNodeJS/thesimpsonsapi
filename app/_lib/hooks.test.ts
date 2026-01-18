/**
 * Tests for custom React hooks
 * @module hooks.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocalStorage, useFormAction } from "./hooks";

describe("useLocalStorage", () => {
  const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockLocalStorage.store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorage.store[key];
    }),
    clear: vi.fn(() => {
      mockLocalStorage.store = {};
    }),
  };

  beforeEach(() => {
    mockLocalStorage.store = {};
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should return initial value when localStorage is empty", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "initial-value"),
      );

      expect(result.current[0]).toBe("initial-value");
    });

    it("should return stored value when localStorage has data", () => {
      mockLocalStorage.store["test-key"] = JSON.stringify("stored-value");

      const { result } = renderHook(() =>
        useLocalStorage("test-key", "initial-value"),
      );

      expect(result.current[0]).toBe("stored-value");
    });

    it("should handle complex objects", () => {
      const initialObject = { name: "Homer", age: 39 };
      mockLocalStorage.store["user-data"] = JSON.stringify(initialObject);

      const { result } = renderHook(() =>
        useLocalStorage("user-data", { name: "", age: 0 }),
      );

      expect(result.current[0]).toEqual(initialObject);
    });

    it("should handle arrays", () => {
      const initialArray = [1, 2, 3];
      mockLocalStorage.store["numbers"] = JSON.stringify(initialArray);

      const { result } = renderHook(() =>
        useLocalStorage("numbers", [] as number[]),
      );

      expect(result.current[0]).toEqual(initialArray);
    });
  });

  describe("setValue", () => {
    it("should update the value and localStorage", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "initial"),
      );

      act(() => {
        result.current[1]("updated");
      });

      expect(result.current[0]).toBe("updated");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify("updated"),
      );
    });

    it("should accept a function updater", () => {
      const { result } = renderHook(() => useLocalStorage("counter", 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });

    it("should handle object updates", () => {
      const { result } = renderHook(() =>
        useLocalStorage("user", { name: "Homer", age: 39 }),
      );

      act(() => {
        result.current[1]((prev) => ({ ...prev, age: 40 }));
      });

      expect(result.current[0]).toEqual({ name: "Homer", age: 40 });
    });
  });

  describe("error handling", () => {
    it("should return initial value on JSON parse error", () => {
      mockLocalStorage.store["bad-json"] = "not-valid-json{";

      const { result } = renderHook(() =>
        useLocalStorage("bad-json", "fallback"),
      );

      expect(result.current[0]).toBe("fallback");
    });

    it("should handle localStorage.setItem errors gracefully", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("QuotaExceededError");
      });

      const { result } = renderHook(() =>
        useLocalStorage("test-key", "initial"),
      );

      // Should not throw
      act(() => {
        result.current[1]("new-value");
      });

      // Console.error should have been called
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});

describe("useFormAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("execution", () => {
    it("should execute the action and handle success", async () => {
      const mockAction = vi.fn().mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useFormAction(mockAction, { onSuccess }),
      );

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith({ success: true });
      });
    });

    it("should handle action errors", async () => {
      const mockError = new Error("Action failed");
      const mockAction = vi.fn().mockRejectedValue(mockError);
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useFormAction(mockAction, { onError }),
      );

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError);
        expect(result.current.error).toEqual(mockError);
      });
    });

    it("should convert non-Error objects to Error", async () => {
      const mockAction = vi.fn().mockRejectedValue("string error");
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useFormAction(mockAction, { onError }),
      );

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error?.message).toBe("string error");
      });
    });

    it("should pass arguments to the action", async () => {
      const mockAction = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useFormAction(mockAction));

      await act(async () => {
        result.current.execute("arg1", 123, { key: "value" });
      });

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith("arg1", 123, { key: "value" });
      });
    });
  });

  describe("pending state", () => {
    it("should set isPending during execution", async () => {
      let resolveAction: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });
      const mockAction = vi.fn().mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useFormAction(mockAction));

      // Start the action
      act(() => {
        result.current.execute();
      });

      // Should be pending after starting
      expect(result.current.isPending).toBe(true);

      // Resolve the action
      await act(async () => {
        resolveAction!({ success: true });
      });

      // Should no longer be pending
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe("error state", () => {
    it("should clear error on new execution", async () => {
      const mockAction = vi
        .fn()
        .mockRejectedValueOnce(new Error("First error"))
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useFormAction(mockAction));

      // First execution (fails)
      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Second execution (succeeds)
      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it("should expose error in result", async () => {
      const mockError = new Error("Test error");
      const mockAction = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useFormAction(mockAction));

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });

  describe("without callbacks", () => {
    it("should work without onSuccess callback", async () => {
      const mockAction = vi.fn().mockResolvedValue({ data: "test" });

      const { result } = renderHook(() => useFormAction(mockAction));

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
        expect(result.current.error).toBeNull();
      });
    });

    it("should work without onError callback", async () => {
      const mockAction = vi.fn().mockRejectedValue(new Error("Test"));

      const { result } = renderHook(() => useFormAction(mockAction));

      await act(async () => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });
});
