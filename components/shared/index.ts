/**
 * Shared Components - Centralized Exports
 *
 * All shared UI components organized for easy import.
 * Usage: import { CommentSection, FollowButton } from "@/components/shared"
 */

// Navigation
export { Breadcrumbs } from "./Breadcrumbs";
export { DesktopNav } from "./DesktopNav";
export { MobileMenuButton } from "./MobileMenuButton";
export { default as SimpsonsHeader } from "./SimpsonsHeader";
export { UserNav } from "./UserNav";

// Characters
export { default as CharacterImage } from "./CharacterImage";
export { default as CommentSection } from "./CommentSection";
export { default as FollowButton } from "./FollowButton";

// Episodes
export { default as EpisodeTracker } from "./EpisodeTracker";

// Diary
export { default as DiaryForm } from "./DiaryForm";
export { default as DeleteDiaryEntryButton } from "./DeleteDiaryEntryButton";

// Collections
export { default as CreateCollectionForm } from "./CreateCollectionForm";

// Trivia
export { default as TriviaSection } from "./TriviaSection";

// Home
export { default as IntroSection } from "./IntroSection";
export { default as RecentlyViewedList } from "./RecentlyViewedList";
export { default as RecentlyViewedTracker } from "./RecentlyViewedTracker";

// Utilities
export { default as HelpButton } from "./HelpButton";
export { CharacterCardSkeleton, EpisodeCardSkeleton } from "./Skeleton";
export { default as SyncButton } from "./SyncButton";
export { Toaster } from "./Toaster";
