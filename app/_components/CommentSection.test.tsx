/**
 * Tests for CommentSection Component
 * @module CommentSection.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "./CommentSection";
import type { CommentWithUser } from "@/app/_lib/repositories";

// Mock the server action
vi.mock("@/app/_actions/social", () => ({
  postComment: vi.fn(),
}));

// Mock hooks
vi.mock("@/app/_lib/hooks", () => ({
  useFormAction: vi.fn((action) => ({
    execute: async () => {
      await action();
    },
    isPending: false,
  })),
}));

describe("CommentSection", () => {
  const mockComments: CommentWithUser[] = [
    {
      id: 1,
      userId: "user-1",
      characterId: 1,
      content: "Homer is the best!",
      createdAt: "2026-01-15T10:00:00Z",
      username: "user1",
    },
    {
      id: 2,
      userId: "user-2",
      characterId: 1,
      content: "D'oh!",
      createdAt: "2026-01-14T10:00:00Z",
      username: "user2",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render section title", () => {
      render(<CommentSection characterId={1} comments={[]} />);

      expect(screen.getByText("Community Wall")).toBeInTheDocument();
    });

    it("should render comment input", () => {
      render(<CommentSection characterId={1} comments={[]} />);

      expect(
        screen.getByPlaceholderText(/leave a message/i),
      ).toBeInTheDocument();
    });

    it("should render post button", () => {
      render(<CommentSection characterId={1} comments={[]} />);

      expect(
        screen.getByRole("button", { name: /post comment/i }),
      ).toBeInTheDocument();
    });

    it("should render existing comments", () => {
      render(<CommentSection characterId={1} comments={mockComments} />);

      expect(screen.getByText("Homer is the best!")).toBeInTheDocument();
      expect(screen.getByText("D'oh!")).toBeInTheDocument();
    });

    it("should display comment usernames", () => {
      render(<CommentSection characterId={1} comments={mockComments} />);

      expect(screen.getByText("user1")).toBeInTheDocument();
      expect(screen.getByText("user2")).toBeInTheDocument();
    });

    it("should display comment dates", () => {
      render(<CommentSection characterId={1} comments={mockComments} />);

      // Dates should be formatted
      const dateElements = screen.getAllByText(/2026/i);
      expect(dateElements.length).toBeGreaterThanOrEqual(1);
    });

    it("should show avatar fallback with first letter", () => {
      render(<CommentSection characterId={1} comments={mockComments} />);

      // Avatar fallback should show first letter uppercase (multiple users = multiple avatars)
      const avatarFallbacks = screen.getAllByText("U");
      expect(avatarFallbacks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("empty state", () => {
    it("should handle empty comments array", () => {
      render(<CommentSection characterId={1} comments={[]} />);

      // Should still render the form
      expect(
        screen.getByPlaceholderText(/leave a message/i),
      ).toBeInTheDocument();
    });
  });

  describe("posting comments", () => {
    it("should allow typing in the textarea", async () => {
      const user = userEvent.setup();
      render(<CommentSection characterId={1} comments={[]} />);

      const textarea = screen.getByPlaceholderText(/leave a message/i);
      await user.type(textarea, "New comment!");

      expect(textarea).toHaveValue("New comment!");
    });

    it("should call postComment with correct data", async () => {
      const { postComment } = await import("@/app/_actions/social");
      vi.mocked(postComment).mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<CommentSection characterId={42} comments={[]} />);

      const textarea = screen.getByPlaceholderText(/leave a message/i);
      await user.type(textarea, "My comment");
      await user.click(screen.getByRole("button", { name: /post comment/i }));

      await waitFor(() => {
        expect(postComment).toHaveBeenCalledWith(42, "My comment");
      });
    });

    it("should not submit empty comments", async () => {
      const { postComment } = await import("@/app/_actions/social");

      const user = userEvent.setup();
      render(<CommentSection characterId={1} comments={[]} />);

      // Click post without typing
      await user.click(screen.getByRole("button", { name: /post comment/i }));

      expect(postComment).not.toHaveBeenCalled();
    });

    it("should clear textarea after successful post", async () => {
      const { postComment } = await import("@/app/_actions/social");
      vi.mocked(postComment).mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<CommentSection characterId={1} comments={[]} />);

      const textarea = screen.getByPlaceholderText(/leave a message/i);
      await user.type(textarea, "My comment");
      await user.click(screen.getByRole("button", { name: /post comment/i }));

      await waitFor(() => {
        expect(textarea).toHaveValue("");
      });
    });
  });

  describe("error handling", () => {
    it("should display error message on failure", async () => {
      const { postComment } = await import("@/app/_actions/social");
      vi.mocked(postComment).mockResolvedValue({
        success: false,
        error: "Please log in to post comments",
      });

      const user = userEvent.setup();
      render(<CommentSection characterId={1} comments={[]} />);

      const textarea = screen.getByPlaceholderText(/leave a message/i);
      await user.type(textarea, "My comment");
      await user.click(screen.getByRole("button", { name: /post comment/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/please log in to post comments/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("comment display", () => {
    it("should handle comments with null createdAt", () => {
      const commentsWithNullDate: CommentWithUser[] = [
        {
          id: 1,
          userId: "user-1",
          characterId: 1,
          content: "Test comment",
          createdAt: null,
          username: "testuser",
        },
      ];

      render(
        <CommentSection characterId={1} comments={commentsWithNullDate} />,
      );

      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });

    it("should handle anonymous users", () => {
      const commentsWithAnonymous: CommentWithUser[] = [
        {
          id: 1,
          userId: null,
          characterId: 1,
          content: "Anonymous comment",
          createdAt: "2026-01-15T10:00:00Z",
          username: "",
        },
      ];

      render(
        <CommentSection characterId={1} comments={commentsWithAnonymous} />,
      );

      // Should show ? for empty username
      expect(screen.getByText("?")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have properly labeled textarea", () => {
      render(<CommentSection characterId={1} comments={[]} />);

      const textarea = screen.getByPlaceholderText(/leave a message/i);
      expect(textarea).toHaveAttribute("placeholder");
    });

    it("should have proper button text", () => {
      render(<CommentSection characterId={1} comments={[]} />);

      expect(
        screen.getByRole("button", { name: /post comment/i }),
      ).toBeInTheDocument();
    });
  });
});
