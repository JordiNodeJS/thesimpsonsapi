# Sprint Plan

## Sprint 1: Foundation & Infrastructure
**Goal:** Set up the project, database, and data synchronization.
- [ ] Initialize Next.js project with Tailwind 4.
- [ ] Install `shadcn/ui` and `radix-ui` primitives.
- [ ] Configure Neon Database (create tables via MCP).
- [ ] Implement `syncExternalData` script/action.
- [ ] Run initial sync to populate DB.

## Sprint 2: Core Tracker (Episodes)
**Goal:** Allow users to browse and track episodes.
- [ ] Create `EpisodeList` component (Pagination).
- [ ] Create `EpisodeDetail` page.
- [ ] Implement `trackEpisode` Server Action.
- [ ] Build "My Progress" dashboard widget.

## Sprint 3: Social & Characters
**Goal:** Implement the social layer.
- [ ] Create `CharacterList` and `CharacterProfile` pages.
- [ ] Implement `followCharacter` and `character_follows` table logic.
- [ ] Build Comment system for Character profiles.
- [ ] Implement `RecommendationEngine` (SQL Query).

## Sprint 4: Simulator & Trivia
**Goal:** Add the interactive/fun features.
- [ ] Build `DiaryEntry` form (Complex UI with Selectors).
- [ ] Create `DiaryTimeline` view.
- [ ] Implement `TriviaSubmission` form.
- [ ] Display Trivia on relevant pages.

## Sprint 5: Collections & Polish
**Goal:** Final features and UI refinement.
- [ ] Build `QuoteCollection` manager.
- [ ] Refine UI/UX (Animations, Transitions).
- [ ] Accessibility Audit (WCAG AAA check).
- [ ] Final Testing & Bug Fixes.
