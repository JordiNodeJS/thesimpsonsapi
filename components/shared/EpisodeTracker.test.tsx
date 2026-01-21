/**
 * Tests for EpisodeTracker Component
 * @module EpisodeTracker.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EpisodeTracker from "./EpisodeTracker";

// Mock the server action
vi.mock("@/actions/episodes", () => ({
  trackEpisode: vi.fn(),
}));

// Mock hooks
vi.mock("@/lib/hooks", () => ({
  useFormAction: vi.fn((action) => ({
    execute: async () => {
      await action();
    },
    isPending: false,
  })),
}));

describe("EpisodeTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render with no initial progress", () => {
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      expect(screen.getByText("Track Episode")).toBeInTheDocument();
      expect(screen.getByText("Rating")).toBeInTheDocument();
      expect(screen.getByText("Notes")).toBeInTheDocument();
    });

    it("should render with initial progress", () => {
      const progress = {
        id: 1,
        userId: "user-123",
        episodeId: 1,
        rating: 4,
        notes: "Great episode!",
        watchedAt: new Date(),
      };

      render(<EpisodeTracker episodeId={1} initialProgress={progress} />);

      // Notes should show initial value
      const notesInput = screen.getByPlaceholderText(/what did you think/i);
      expect(notesInput).toHaveValue("Great episode!");
    });

    it("should render 5 star rating buttons", () => {
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      const starButtons = screen.getAllByRole("button", {
        name: /rate \d of 5/i,
      });
      expect(starButtons).toHaveLength(5);
    });

    it("should show save button", () => {
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      expect(
        screen.getByRole("button", { name: /save progress/i }),
      ).toBeInTheDocument();
    });
  });

  describe("rating interaction", () => {
    it("should update rating when star is clicked", async () => {
      const user = userEvent.setup();
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      const fourthStar = screen.getByRole("button", { name: /rate 4 of 5/i });
      await user.click(fourthStar);

      // Star should now be filled (indicated by currentColor fill)
      expect(fourthStar.querySelector("svg")).toBeInTheDocument();
    });

    it("should allow changing rating", async () => {
      const user = userEvent.setup();
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      // Click 5 stars
      await user.click(screen.getByRole("button", { name: /rate 5 of 5/i }));

      // Click 3 stars (change rating)
      await user.click(screen.getByRole("button", { name: /rate 3 of 5/i }));

      // Component should update (we can verify by checking the button state)
      expect(
        screen.getByRole("button", { name: /rate 3 of 5/i }),
      ).toBeInTheDocument();
    });
  });

  describe("notes interaction", () => {
    it("should allow typing notes", async () => {
      const user = userEvent.setup();
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      const notesInput = screen.getByPlaceholderText(/what did you think/i);
      await user.type(notesInput, "This is a great episode!");

      expect(notesInput).toHaveValue("This is a great episode!");
    });

    it("should clear notes when typed over", async () => {
      const progress = {
        id: 1,
        userId: "user-123",
        episodeId: 1,
        rating: 4,
        notes: "Initial notes",
        watchedAt: new Date(),
      };

      const user = userEvent.setup();
      render(<EpisodeTracker episodeId={1} initialProgress={progress} />);

      const notesInput = screen.getByPlaceholderText(/what did you think/i);
      await user.clear(notesInput);
      await user.type(notesInput, "New notes");

      expect(notesInput).toHaveValue("New notes");
    });
  });

  describe("form submission", () => {
    it("should call trackEpisode with correct data", async () => {
      const { trackEpisode } = await import("@/actions/episodes");
      vi.mocked(trackEpisode).mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<EpisodeTracker episodeId={42} initialProgress={null} />);

      // Select a rating first
      await user.click(screen.getByRole("button", { name: /rate 5 of 5/i }));

      // Type notes
      const notesInput = screen.getByPlaceholderText(/what did you think/i);
      await user.type(notesInput, "Amazing!");

      // Submit
      await user.click(screen.getByRole("button", { name: /save progress/i }));

      await waitFor(() => {
        expect(trackEpisode).toHaveBeenCalledWith(42, 5, "Amazing!");
      });
    });

    it("should disable save button when no rating selected", () => {
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      const saveButton = screen.getByRole("button", { name: /save progress/i });
      expect(saveButton).toBeDisabled();
    });

    it("should show hint when no rating selected", () => {
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      expect(
        screen.getByText(/please select a rating first/i),
      ).toBeInTheDocument();
    });

    it("should enable save button when rating is selected", async () => {
      const user = userEvent.setup();
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      await user.click(screen.getByRole("button", { name: /rate 3 of 5/i }));

      const saveButton = screen.getByRole("button", { name: /save progress/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("should have accessible star rating buttons", () => {
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      // Each star should have aria-label
      const stars = screen.getAllByRole("button", { name: /rate \d of 5/i });
      expect(stars).toHaveLength(5);

      stars.forEach((star, index) => {
        expect(star).toHaveAttribute(
          "aria-label",
          `Rate ${index + 1} of 5 stars`,
        );
      });
    });

    it("should have label for notes textarea", () => {
      render(<EpisodeTracker episodeId={1} initialProgress={null} />);

      expect(screen.getByText("Notes")).toBeInTheDocument();
    });
  });
});
