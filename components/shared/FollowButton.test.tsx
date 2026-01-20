/**
 * Tests for FollowButton Component
 * @module FollowButton.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FollowButton from "./FollowButton";

// Mock the server action
vi.mock("@/actions/social", () => ({
  toggleFollow: vi.fn(),
}));

// Mock hooks
vi.mock("@/lib/hooks", () => ({
  useFormAction: vi.fn((action) => {
    let isPending = false;
    return {
      execute: async () => {
        isPending = true;
        await action();
        isPending = false;
      },
      isPending,
    };
  }),
}));

describe("FollowButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render Follow button when not following", () => {
      render(<FollowButton characterId={1} initialIsFollowing={false} />);

      expect(screen.getByRole("button")).toHaveTextContent("Follow");
    });

    it("should render Following button when following", () => {
      render(<FollowButton characterId={1} initialIsFollowing={true} />);

      expect(screen.getByRole("button")).toHaveTextContent("Following");
    });

    it("should have heart icon", () => {
      render(<FollowButton characterId={1} initialIsFollowing={false} />);

      // Lucide icons render as SVG
      const button = screen.getByRole("button");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should toggle follow state on click", async () => {
      const { toggleFollow } = await import("@/actions/social");
      vi.mocked(toggleFollow).mockResolvedValue({
        success: true,
        isFollowing: true,
      });

      const user = userEvent.setup();
      render(<FollowButton characterId={1} initialIsFollowing={false} />);

      const button = screen.getByRole("button", { name: /follow/i });
      await user.click(button);

      await waitFor(() => {
        expect(toggleFollow).toHaveBeenCalledWith(1);
      });
    });

    it("should call toggleFollow with correct characterId", async () => {
      const { toggleFollow } = await import("@/actions/social");
      vi.mocked(toggleFollow).mockResolvedValue({
        success: true,
        isFollowing: true,
      });

      const user = userEvent.setup();
      render(<FollowButton characterId={42} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      expect(toggleFollow).toHaveBeenCalledWith(42);
    });
  });

  describe("error handling", () => {
    it("should display error message on failure", async () => {
      const { toggleFollow } = await import("@/actions/social");
      vi.mocked(toggleFollow).mockResolvedValue({
        success: false,
        error: "Please log in to follow characters",
      });

      const user = userEvent.setup();
      render(<FollowButton characterId={1} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(
          screen.getByText(/please log in to follow characters/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("should be keyboard accessible", async () => {
      render(<FollowButton characterId={1} initialIsFollowing={false} />);

      const button = screen.getByRole("button");
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("should have proper button role", () => {
      render(<FollowButton characterId={1} initialIsFollowing={false} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });
});
