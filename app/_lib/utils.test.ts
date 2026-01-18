import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  describe("basic class merging", () => {
    it("should merge class names correctly", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should handle multiple non-conflicting classes", () => {
      const result = cn("font-bold", "text-lg", "p-4");
      expect(result).toBe("font-bold text-lg p-4");
    });

    it("should merge multiple classes without conflicts", () => {
      const result = cn(
        "text-sm font-bold",
        "text-blue-500",
        "hover:text-blue-700",
      );
      expect(result).toContain("text-sm");
      expect(result).toContain("font-bold");
      expect(result).toContain("text-blue-500");
    });
  });

  describe("conditional classes", () => {
    it("should handle conditional classes", () => {
      const result = cn("base-class", false && "hidden-class", "visible-class");
      expect(result).toBe("base-class visible-class");
    });

    it("should handle true conditionals", () => {
      const isActive = true;
      const result = cn("base", isActive && "active-class");
      expect(result).toBe("base active-class");
    });

    it("should handle false conditionals", () => {
      const isHidden = false;
      const result = cn("base", isHidden && "hidden-class");
      expect(result).toBe("base");
    });

    it("should handle ternary conditionals", () => {
      const isError = true;
      const result = cn(
        "input",
        isError ? "border-red-500" : "border-gray-300",
      );
      expect(result).toBe("input border-red-500");
    });
  });

  describe("tailwind conflict resolution", () => {
    it("should merge conflicting tailwind classes", () => {
      const result = cn("px-2 py-1", "p-3");
      expect(result).toBe("p-3");
    });

    it("should override padding conflicts", () => {
      const result = cn("p-4", "px-2");
      expect(result).toContain("px-2");
    });

    it("should override text color conflicts", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should handle responsive variants correctly", () => {
      const result = cn("md:p-4", "md:p-6");
      expect(result).toBe("md:p-6");
    });

    it("should keep different responsive breakpoints", () => {
      const result = cn("sm:p-2", "md:p-4", "lg:p-6");
      expect(result).toBe("sm:p-2 md:p-4 lg:p-6");
    });
  });

  describe("edge cases", () => {
    it("should handle empty strings", () => {
      const result = cn("", "valid-class");
      expect(result).toBe("valid-class");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base", undefined, null, "end");
      expect(result).toBe("base end");
    });

    it("should handle all falsy values", () => {
      const result = cn(
        "base",
        false,
        null,
        undefined,
        0 as unknown as string,
        "",
        "end",
      );
      expect(result).toBe("base end");
    });

    it("should return empty string for no classes", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["foo", "bar"], "baz");
      expect(result).toBe("foo bar baz");
    });

    it("should handle object syntax", () => {
      const result = cn({
        "bg-red-500": true,
        "bg-blue-500": false,
        "text-white": true,
      });
      expect(result).toBe("bg-red-500 text-white");
    });
  });
});
