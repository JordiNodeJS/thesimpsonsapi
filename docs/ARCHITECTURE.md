# System Architecture

## 1. High-Level Overview

The application is built on a **Next.js 16** framework using the **App Router**. It connects to an external **Simpsons API** for static data (synced periodically) and a **Neon PostgreSQL** database for dynamic user data.

## 2. Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui.
- **Backend:** Next.js Server Actions (for mutations), Route Handlers (for internal APIs).
- **Database:** Neon (PostgreSQL) via MCP.
- **External Data:** https://thesimpsonsapi.com/

## 3. Data Flow

1.  **Sync Layer:** A scheduled job (or admin trigger) fetches `Characters`, `Episodes`, and `Locations` from The Simpsons API and upserts them into the Neon DB to ensure referential integrity for user actions.
2.  **User Actions:** When a user tracks an episode or logs a diary entry, the data is written directly to Neon via Server Actions.
3.  **Read Layer:** Pages fetch data directly from Neon (using Prisma, Drizzle, or raw SQL) for the fastest performance.

## 4. Database Schema (Neon)

### Core Data (Synced)

```sql
CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  external_id INT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  season INT NOT NULL,
  episode_number INT NOT NULL,
  synopsis TEXT,
  image_url TEXT
);

CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  external_id INT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  occupation TEXT,
  image_url TEXT
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  external_id INT UNIQUE NOT NULL,
  name TEXT NOT NULL
);
```

### User Data

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, -- Placeholder for Auth
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_episode_progress (
  user_id INT REFERENCES users(id),
  episode_id INT REFERENCES episodes(id),
  watched_at TIMESTAMP DEFAULT NOW(),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  PRIMARY KEY (user_id, episode_id)
);

CREATE TABLE character_favorites (
  user_id INT REFERENCES users(id),
  character_id INT REFERENCES characters(id),
  PRIMARY KEY (user_id, character_id)
);

CREATE TABLE character_follows (
  user_id INT REFERENCES users(id),
  character_id INT REFERENCES characters(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, character_id)
);

CREATE TABLE character_comments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  character_id INT REFERENCES characters(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Features

```sql
CREATE TABLE quote_collections (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE collection_quotes (
  id SERIAL PRIMARY KEY,
  collection_id INT REFERENCES quote_collections(id),
  quote_text TEXT NOT NULL,
  character_name TEXT, -- Denormalized for simplicity or link to character_id
  source_episode TEXT
);

CREATE TABLE trivia_facts (
  id SERIAL PRIMARY KEY,
  related_entity_type TEXT CHECK (related_entity_type IN ('CHARACTER', 'EPISODE')),
  related_entity_id INT NOT NULL, -- ID from local tables
  content TEXT NOT NULL,
  submitted_by_user_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diary_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  character_id INT REFERENCES characters(id),
  location_id INT REFERENCES locations(id),
  activity_description TEXT NOT NULL,
  entry_date DATE DEFAULT CURRENT_DATE
);
```

## 5. Directory Structure

```
app/
  (routes)/
    dashboard/       # User stats
    episodes/        # List & Detail
    characters/      # Social Profiles
    diary/           # Simulator
    collections/     # Quotes
  _components/       # Shared UI
  _lib/              # DB connection, utils
  _actions/          # Server Actions
```
