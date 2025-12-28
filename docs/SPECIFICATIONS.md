# Technical Specifications

## 1. API Routes & Server Actions

### 1.1. Synchronization
- **Action:** `syncExternalData()`
- **Logic:** Fetch all pages from `thesimpsonsapi.com` endpoints (`/characters`, `/episodes`, `/locations`) and perform `INSERT ON CONFLICT UPDATE` into Neon.

### 1.2. Episode Tracking
- **Action:** `trackEpisode(episodeId, rating, notes)`
- **Method:** POST
- **Validation:** Ensure `episodeId` exists. Rating 1-5.

### 1.3. Social Interactions
- **Action:** `followCharacter(characterId)`
- **Action:** `postComment(characterId, content)`
- **UI:** Optimistic updates for "Follow" button.

### 1.4. Collections
- **Action:** `createCollection(name, description)`
- **Action:** `addQuoteToCollection(collectionId, quote, source)`

### 1.5. Diary
- **Action:** `logDiaryEntry(characterId, locationId, description, date)`
- **UI:** Form with Comboboxes for Character and Location selection.

## 2. UI/UX Specifications

### 2.1. Design System
- **Theme:** "Avant-Garde" Minimalist.
- **Colors:** Yellow accents (Simpsons DNA) but modern implementation.
- **Typography:** Distinctive headers, readable body.
- **Components:** `shadcn/ui` (Button, Card, Dialog, Form, Select, Toast).

### 2.2. Key Pages
- **Home:** Dashboard showing "Next to Watch" and "Recent Diary Entries".
- **Character Profile:**
  - Header: Image + Name + "Follow" Button.
  - Tabs: "Bio", "Comments", "Trivia".
- **Episode Detail:**
  - Header: Still + Title.
  - Action: "Mark as Watched" (Star rating).
  - Section: "Trivia".

## 3. Accessibility (WCAG AAA)
- All interactive elements must have `aria-label` if text is not descriptive.
- Color contrast ratio > 7:1 for normal text.
- Keyboard navigation support for all custom widgets (Diary selector).
