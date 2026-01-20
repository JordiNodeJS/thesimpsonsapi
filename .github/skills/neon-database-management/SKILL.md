# Neon Database Management Skill

## Description

Comprehensive knowledge and utilities for managing Neon PostgreSQL database in The Simpsons API. This skill encapsulates the complete database configuration, schema management, query patterns, and verification processes specific to this application's Neon setup.

## Context

**The Simpsons API** uses **Neon** as its serverless PostgreSQL database provider with a specific architecture designed for optimal performance in serverless environments (Vercel).

### Key Configuration

- **Provider:** Neon (Serverless PostgreSQL)
- **Schema:** `the_simpson`
- **Connection Strategy:** HTTP-based queries via `poolQueryViaFetch = true`
- **Pattern:** Fully qualified table names (schema.table)
- **Centralization:** All schema configuration in `app/_lib/db-schema.ts`

## Architecture Overview

### Connection Flow
```
Next.js App → @neondatabase/serverless → Neon PostgreSQL
            ↓                           ↓
    poolQueryViaFetch = true      Schema: the_simpson
    HTTP Direct Connection        Tables: characters, episodes, etc.
```

### Critical Files

| File | Purpose |
|------|---------|
| `app/_lib/db.ts` | Pool configuration with HTTP fetch enabled |
| `app/_lib/db-schema.ts` | ⭐ Centralized schema and table constants |
| `app/_lib/db-utils.ts` | Query utilities with validation & logging |
| `app/_lib/repositories.ts` | Data access layer with type-safe queries |
| `app/_actions/*.ts` | Server actions for mutations |

## The Critical Problem We Solved

### The Issue
When using Neon with `poolQueryViaFetch = true` (HTTP mode), the driver **ignores session parameters** like `search_path` passed in the connection URL. This caused queries to fail silently in production because PostgreSQL couldn't find tables in the `the_simpson` schema.

### The Solution
Use **fully qualified table names** in ALL queries:
```typescript
// ❌ WRONG (depends on search_path, breaks in HTTP mode)
SELECT * FROM characters

// ✅ CORRECT (explicit schema, works everywhere)
SELECT * FROM the_simpson.characters
```

### Our Implementation
Instead of hardcoding `the_simpson.` everywhere, we centralized it:

```typescript
// app/_lib/db-schema.ts
export const DB_SCHEMA = "the_simpson" as const;

export const TABLES = {
  characters: `${DB_SCHEMA}.characters`,
  episodes: `${DB_SCHEMA}.episodes`,
  users: `${DB_SCHEMA}.users`,
  // ... all 12 tables
} as const;

// Usage in queries
import { TABLES } from "@/app/_lib/db-schema";
await query(`SELECT * FROM ${TABLES.characters}`);
```

## Database Schema Structure

### Core Tables (Synced from TheSimponsAPI.com)
```sql
the_simpson.characters      -- Character data
the_simpson.episodes        -- Episode catalog
the_simpson.locations       -- Springfield locations
```

### User Data Tables
```sql
the_simpson.users                   -- User accounts
the_simpson.user_episode_progress   -- Watch tracking
the_simpson.character_follows       -- Following relationships
the_simpson.character_comments      -- User comments
the_simpson.character_favorites     -- Favorites
the_simpson.trivia_facts            -- Community trivia
the_simpson.diary_entries           -- User diary
the_simpson.quote_collections       -- Quote collections
the_simpson.collection_quotes       -- Quotes in collections
```

## Best Practices

### 1. Always Use TABLES Constants
```typescript
// ✅ GOOD
import { TABLES } from "@/app/_lib/db-schema";
await pool.query(`SELECT * FROM ${TABLES.characters} WHERE id = $1`, [id]);

// ❌ BAD
await pool.query(`SELECT * FROM the_simpson.characters WHERE id = $1`, [id]);

// ❌ WORSE
await pool.query(`SELECT * FROM characters WHERE id = $1`, [id]);
```

### 2. Use Type-Safe Repositories
```typescript
// ✅ GOOD - Use existing repositories
import { findCharacterById } from "@/app/_lib/repositories";
const character = await findCharacterById(1);

// ⚠️ Only if repository doesn't exist
import { queryOne } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
const result = await queryOne(`SELECT * FROM ${TABLES.characters} WHERE id = $1`, [1]);
```

### 3. Server Actions Pattern
```typescript
"use server";

import { execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function myAction(data: SomeData) {
  const user = await getCurrentUser();
  
  await execute(
    `INSERT INTO ${TABLES.my_table} (user_id, field) VALUES ($1, $2)`,
    [user.id, data.field]
  );
  
  revalidatePath("/my-page");
}
```

### 4. Query Utilities
```typescript
// Read queries
import { query, queryOne } from "@/app/_lib/db-utils";

// Multiple rows
const characters = await query<DBCharacter>(
  `SELECT * FROM ${TABLES.characters} LIMIT 10`
);

// Single row (returns null if not found)
const character = await queryOne<DBCharacter>(
  `SELECT * FROM ${TABLES.characters} WHERE id = $1`,
  [1]
);

// Write operations
import { execute } from "@/app/_lib/db-utils";

const rowCount = await execute(
  `DELETE FROM ${TABLES.diary_entries} WHERE id = $1`,
  [entryId]
);
```

## Development Features

### Automatic Validation (Development Only)
The system automatically validates queries in development:

```typescript
// This will trigger a warning in dev console:
await query(`SELECT * FROM users`); // ⚠️ Unqualified table name

// This is correct:
await query(`SELECT * FROM ${TABLES.users}`); // ✅ No warning
```

### Query Logging (Development Only)
All queries are logged with params for easy debugging:

```console
✅ Query executed: { 
  sql: 'SELECT * FROM the_simpson.characters WHERE id = $1',
  params: [1] 
}
```

Error logging includes context:
```console
❌ Query failed: {
  sql: 'SELECT * FROM the_simpson.invalid_table',
  params: [],
  error: 'relation "the_simpson.invalid_table" does not exist'
}
```

## Verification Process

### Quick Configuration Check (No Database Connection Required)

Run the verification script to ensure code is properly configured:

```bash
node .github/skills/neon-database-management/check-db-config.js
```

This checks:
- ✅ All required files exist
- ✅ Schema is correctly configured
- ✅ All Server Actions import and use TABLES
- ✅ repositories.ts uses TABLES
- ✅ No hardcoded schema references
- ✅ Validation and logging functions are present

### Full Database Verification (Requires DATABASE_URL)

For runtime verification with actual database connection:

```bash
pnpm dlx tsx scripts/verify-db.ts
```

This checks:
- ✅ Connection to Neon
- ✅ Schema `the_simpson` exists
- ✅ All expected tables present
- ✅ Sample queries work
- ✅ Row counts for critical tables

## Common Tasks

### Adding a New Table

1. **Update db-schema.ts:**
   ```typescript
   export const TABLES = {
     // ... existing tables
     myNewTable: table("my_new_table"),
   } as const;
   ```

2. **Create type in db-types.ts:**
   ```typescript
   export interface DBMyNewTable extends QueryResultRow {
     id: number;
     field1: string;
     created_at: Date;
   }
   ```

3. **Add repository functions:**
   ```typescript
   export async function findMyNewTableData(): Promise<DBMyNewTable[]> {
     return query<DBMyNewTable>(
       `SELECT * FROM ${TABLES.myNewTable} ORDER BY created_at DESC`
     );
   }
   ```

### Changing the Schema Name

If you need to change from `the_simpson` to another schema:

1. Edit ONE line in `app/_lib/db-schema.ts`:
   ```typescript
   export const DB_SCHEMA = "new_schema_name" as const;
   ```

2. All queries automatically use the new schema!

### Debugging Query Issues

1. **Check development console** for validation warnings
2. **Review query logs** to see what SQL is being executed
3. **Run verification script** to ensure configuration is correct:
   ```bash
   node .github/skills/neon-database-management/check-db-config.js
   ```
4. **Verify Neon connection** if DATABASE_URL is available:
   ```bash
   pnpm dlx tsx scripts/verify-db.ts
   ```

## Migration Checklist

When creating new database operations:

- [ ] Import `TABLES` from `@/app/_lib/db-schema`
- [ ] Use `${TABLES.tableName}` instead of hardcoding
- [ ] Use `query`, `queryOne`, or `execute` from `db-utils`
- [ ] Add type for result using interfaces from `db-types.ts`
- [ ] Test in development to see validation warnings
- [ ] Run `node .github/skills/neon-database-management/check-db-config.js`
- [ ] Verify no hardcoded `the_simpson.` in your code

## Neon-Specific Considerations

### Connection Pooling
```typescript
// ✅ CORRECT - Use pool.query() directly
const result = await pool.query(sql, params);

// ❌ AVOID - pool.connect() has overhead in serverless
const client = await pool.connect();
const result = await client.query(sql, params);
client.release();
```

### Environment Variables
```typescript
// Required in .env.local
DATABASE_URL=postgresql://user:pass@ep-xxx.us-west-2.aws.neon.tech/neondb?sslmode=require

// Optional (for reference)
NEXT_PUBLIC_NEON_PROJECT=project-id-here
```

### Performance Tips
- ✅ HTTP mode (`poolQueryViaFetch = true`) is fastest for Vercel
- ✅ Qualified table names avoid schema lookup overhead
- ✅ Use `pool.query()` for one-off queries
- ✅ Prepare statements are automatic in Neon
- ⚠️ Avoid `pool.connect()` unless you need transactions

## Troubleshooting

### Problem: "relation does not exist"
**Cause:** Unqualified table name or wrong schema
**Fix:** 
```typescript
// Change this:
await query(`SELECT * FROM characters`)

// To this:
await query(`SELECT * FROM ${TABLES.characters}`)
```

### Problem: "Query works in dev but fails in production"
**Cause:** `search_path` ignored in HTTP mode
**Fix:** Always use qualified table names via `TABLES`

### Problem: "DATABASE_URL not defined"
**Cause:** Missing environment variable
**Fix:** Add to `.env.local`:
```
DATABASE_URL=your-neon-connection-string
```

### Problem: "Schema validation warnings"
**Cause:** Hardcoded table names detected
**Fix:** Run verification and update to use `TABLES`:
```bash
node .github/skills/neon-database-management/check-db-config.js
```

### Problem: "Connection timeout"
**Cause:** Cold start, network issues, or too many connections
**Fix:**
```typescript
// 1. Increase timeout in pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 seconds
});

// 2. Use HTTP mode (already configured)
neonConfig.poolQueryViaFetch = true;

// 3. Check Neon dashboard for connection limits
// Free tier: 100 connections max
```

### Problem: "Too many connections"
**Cause:** Serverless functions opening many parallel connections
**Fix:**
```typescript
// Already solved by HTTP mode
neonConfig.poolQueryViaFetch = true;

// Each query is a stateless HTTP request
// No persistent connections needed
```

### Problem: "Permission denied for schema"
**Cause:** Role doesn't have access to schema
**Fix:** Via Neon MCP or SQL console:
```sql
GRANT USAGE ON SCHEMA the_simpson TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA the_simpson TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA the_simpson TO neondb_owner;
```

### Problem: "Column does not exist"
**Cause:** Schema drift between code and database
**Fix:**
```bash
# 1. Check actual schema
mcp_neon_describe_table_schema

# 2. Compare with type definition in db-types.ts

# 3. Run migration if needed
mcp_neon_run_sql with ALTER TABLE statement
```

### Problem: "Duplicate key violates unique constraint"
**Cause:** Trying to insert existing primary key
**Fix:**
```typescript
// Use UPSERT pattern
await execute(
  `INSERT INTO ${TABLES.characters} (id, name)
   VALUES ($1, $2)
   ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
  [id, name]
);
```

---

## Performance Tuning

### Query Optimization Best Practices

#### 1. Index Management

```sql
-- Check existing indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'the_simpson'
ORDER BY tablename, indexname;

-- Create index for frequent queries
CREATE INDEX CONCURRENTLY idx_characters_name 
ON the_simpson.characters(name);

-- Create composite index for filtered queries
CREATE INDEX CONCURRENTLY idx_episodes_season_number 
ON the_simpson.episodes(season, episode_number);

-- Partial index for common filter
CREATE INDEX CONCURRENTLY idx_users_active 
ON the_simpson.users(id) 
WHERE deleted_at IS NULL;
```

#### 2. Query Analysis

```typescript
// Use EXPLAIN ANALYZE for slow queries
// Via Neon MCP:
mcp_neon_explain_sql_statement({
  params: {
    projectId: "wispy-poetry-52762475",
    sql: "SELECT * FROM the_simpson.characters WHERE name LIKE '%Simpson%'",
    analyze: true
  }
});

// Look for:
// - Seq Scan (consider adding index)
// - High cost numbers
// - Rows estimate vs actual mismatch
// - Nested loops on large tables
```

#### 3. Connection Pool Optimization

```typescript
// Optimal pool settings for Vercel
import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.poolQueryViaFetch = true; // HTTP mode - best for serverless

// No pool.connect() needed - each query is independent
// This avoids connection overhead in serverless
```

#### 4. Query Patterns for Performance

```typescript
// ❌ SLOW: N+1 queries
for (const char of characters) {
  const episodes = await query(`SELECT * FROM ${TABLES.episodes} WHERE character_id = $1`, [char.id]);
}

// ✅ FAST: Single query with JOIN
const data = await query(`
  SELECT c.*, e.title as episode_title
  FROM ${TABLES.characters} c
  LEFT JOIN ${TABLES.episodes} e ON e.character_id = c.id
`);

// ✅ FAST: Batch query
const characterIds = characters.map(c => c.id);
const episodes = await query(
  `SELECT * FROM ${TABLES.episodes} WHERE character_id = ANY($1)`,
  [characterIds]
);
```

#### 5. Pagination Best Practices

```typescript
// ❌ SLOW for large offsets
await query(`SELECT * FROM ${TABLES.characters} LIMIT 20 OFFSET 10000`);

// ✅ FAST: Cursor-based pagination
await query(`
  SELECT * FROM ${TABLES.characters}
  WHERE id > $1
  ORDER BY id
  LIMIT 20
`, [lastSeenId]);

// ✅ FAST: Keyset pagination for sorted results
await query(`
  SELECT * FROM ${TABLES.characters}
  WHERE (created_at, id) < ($1, $2)
  ORDER BY created_at DESC, id DESC
  LIMIT 20
`, [lastCreatedAt, lastId]);
```

### Slow Query Detection

Use Neon MCP to identify slow queries:

```typescript
// List slow queries from pg_stat_statements
mcp_neon_list_slow_queries({
  params: {
    projectId: "wispy-poetry-52762475",
    minExecutionTime: 100, // ms
    limit: 10
  }
});
```

---

## Backup and Disaster Recovery

### Neon Branching for Backups

Neon's branching creates instant point-in-time copies:

```typescript
// Create backup branch before risky operation
mcp_neon_create_branch({
  params: {
    projectId: "wispy-poetry-52762475",
    branchName: "backup-2026-01-14",
    parentBranchId: "main" // or specific branch ID
  }
});

// After verification, delete old backups
mcp_neon_delete_branch({
  params: {
    projectId: "wispy-poetry-52762475",
    branchId: "backup-old-branch-id"
  }
});
```

### Point-in-Time Recovery

Neon supports PITR with branching:

```typescript
// Create branch from specific point in time
// (Check Neon dashboard for exact timestamp options)

// Via Neon Console:
// 1. Go to Branches
// 2. Create branch → From timestamp
// 3. Select the recovery point
```

### Data Export for Offsite Backup

```bash
# Export using pg_dump (requires psql installed)
pg_dump "$DATABASE_URL" --schema=the_simpson --format=custom -f backup.dump

# Export to SQL
pg_dump "$DATABASE_URL" --schema=the_simpson --format=plain -f backup.sql

# Export specific table
pg_dump "$DATABASE_URL" --table=the_simpson.characters -f characters.sql
```

### Pre-Migration Backup Checklist

- [ ] Create backup branch in Neon
- [ ] Note current row counts for critical tables
- [ ] Document current schema state
- [ ] Test rollback procedure on branch
- [ ] Have connection string to backup branch ready

---

## Data Seeding and Fixtures

### Development Data Setup

```typescript
// app/_lib/seed.ts
import { execute, query } from "./db-utils";
import { TABLES } from "./db-schema";

export async function seedDatabase() {
  // Check if already seeded
  const existing = await query(`SELECT COUNT(*) FROM ${TABLES.characters}`);
  if (parseInt(existing[0].count) > 0) {
    console.log("Database already seeded");
    return;
  }

  // Seed characters
  const characters = [
    { id: 1, name: "Homer Simpson", occupation: "Safety Inspector" },
    { id: 2, name: "Marge Simpson", occupation: "Homemaker" },
    { id: 3, name: "Bart Simpson", occupation: "Student" },
    { id: 4, name: "Lisa Simpson", occupation: "Student" },
    { id: 5, name: "Maggie Simpson", occupation: "Baby" },
  ];

  for (const char of characters) {
    await execute(
      `INSERT INTO ${TABLES.characters} (id, name, occupation)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [char.id, char.name, char.occupation]
    );
  }

  console.log("Database seeded successfully");
}
```

### Fixture Files Pattern

```
scripts/
├── fixtures/
│   ├── characters.json
│   ├── episodes.json
│   └── locations.json
├── seed.ts
└── reset-db.ts
```

**characters.json:**
```json
[
  {
    "id": 1,
    "name": "Homer Simpson",
    "occupation": "Safety Inspector",
    "catchphrase": "D'oh!"
  },
  {
    "id": 2,
    "name": "Marge Simpson",
    "occupation": "Homemaker"
  }
]
```

**seed.ts:**
```typescript
import { execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
import characters from "./fixtures/characters.json";
import episodes from "./fixtures/episodes.json";

async function seed() {
  console.log("Starting database seed...");

  // Seed characters
  for (const char of characters) {
    await execute(
      `INSERT INTO ${TABLES.characters} (id, name, occupation, catchphrase)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         occupation = EXCLUDED.occupation,
         catchphrase = EXCLUDED.catchphrase`,
      [char.id, char.name, char.occupation, char.catchphrase || null]
    );
  }
  console.log(`✓ Seeded ${characters.length} characters`);

  // Seed episodes
  for (const ep of episodes) {
    await execute(
      `INSERT INTO ${TABLES.episodes} (id, title, season, episode_number)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         season = EXCLUDED.season,
         episode_number = EXCLUDED.episode_number`,
      [ep.id, ep.title, ep.season, ep.episode_number]
    );
  }
  console.log(`✓ Seeded ${episodes.length} episodes`);

  console.log("Seed complete!");
}

seed().catch(console.error);
```

### Reset Database Script

```typescript
// scripts/reset-db.ts
import { execute } from "@/app/_lib/db-utils";
import { TABLES, DB_SCHEMA } from "@/app/_lib/db-schema";

async function resetDatabase() {
  console.log("⚠️  Resetting database...");
  
  // Truncate in order (respecting foreign keys)
  const tablesToTruncate = [
    TABLES.collection_quotes,
    TABLES.quote_collections,
    TABLES.trivia_facts,
    TABLES.diary_entries,
    TABLES.character_favorites,
    TABLES.character_comments,
    TABLES.character_follows,
    TABLES.user_episode_progress,
    TABLES.users,
    TABLES.episodes,
    TABLES.locations,
    TABLES.characters,
  ];

  for (const table of tablesToTruncate) {
    await execute(`TRUNCATE ${table} CASCADE`);
    console.log(`✓ Truncated ${table}`);
  }

  console.log("Database reset complete!");
}

resetDatabase().catch(console.error);
```

### Running Seeds

```bash
# Seed development database
pnpm dlx tsx scripts/seed.ts

# Reset and reseed
pnpm dlx tsx scripts/reset-db.ts && pnpm dlx tsx scripts/seed.ts
```

---

## Query Examples by Table

### Characters Table

```typescript
import { query, queryOne, execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";

// Get all characters
const characters = await query(`SELECT * FROM ${TABLES.characters} ORDER BY name`);

// Get character by ID
const homer = await queryOne(
  `SELECT * FROM ${TABLES.characters} WHERE id = $1`,
  [1]
);

// Search characters
const simpsons = await query(
  `SELECT * FROM ${TABLES.characters} WHERE name ILIKE $1`,
  ['%simpson%']
);

// Get character with episode count
const withStats = await query(`
  SELECT 
    c.*,
    COUNT(DISTINCT uep.episode_id) as episodes_watched
  FROM ${TABLES.characters} c
  LEFT JOIN ${TABLES.user_episode_progress} uep ON uep.character_id = c.id
  GROUP BY c.id
  ORDER BY episodes_watched DESC
`);
```

### Episodes Table

```typescript
// Get episodes by season
const season5 = await query(
  `SELECT * FROM ${TABLES.episodes} 
   WHERE season = $1 
   ORDER BY episode_number`,
  [5]
);

// Get episode with user progress
const episodeWithProgress = await queryOne(`
  SELECT 
    e.*,
    uep.watched,
    uep.watched_at
  FROM ${TABLES.episodes} e
  LEFT JOIN ${TABLES.user_episode_progress} uep 
    ON uep.episode_id = e.id AND uep.user_id = $1
  WHERE e.id = $2
`, [userId, episodeId]);
```

### User Data Tables

```typescript
// Get user's diary entries
const diary = await query(`
  SELECT de.*, c.name as character_name
  FROM ${TABLES.diary_entries} de
  JOIN ${TABLES.characters} c ON c.id = de.character_id
  WHERE de.user_id = $1
  ORDER BY de.created_at DESC
`, [userId]);

// Get user's collections with quote count
const collections = await query(`
  SELECT 
    qc.*,
    COUNT(cq.id) as quote_count
  FROM ${TABLES.quote_collections} qc
  LEFT JOIN ${TABLES.collection_quotes} cq ON cq.collection_id = qc.id
  WHERE qc.user_id = $1
  GROUP BY qc.id
  ORDER BY qc.created_at DESC
`, [userId]);

// Add trivia fact
await execute(
  `INSERT INTO ${TABLES.trivia_facts} (character_id, fact, submitted_by)
   VALUES ($1, $2, $3)`,
  [characterId, factText, userId]
);
```

## When to Use This Skill

Use this skill when:
- ✅ Creating new database queries
- ✅ Adding new tables or schemas
- ✅ Debugging database connection issues
- ✅ Verifying database configuration
- ✅ Optimizing query performance
- ✅ Understanding why `search_path` doesn't work
- ✅ Migrating from hardcoded schemas to centralized config
- ✅ Setting up new developers on the project
- ✅ Before deploying to production
- ✅ Investigating production database errors

## Success Metrics

A properly configured Neon setup should have:
- ✅ 0 hardcoded schema references
- ✅ All queries using `TABLES.*`
- ✅ Validation warnings only in development
- ✅ Query logs for debugging
- ✅ Pass `check-db-config.js` verification
- ✅ All server actions importing `TABLES`
- ✅ Type-safe queries with `db-types.ts`

## References

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [docs/DEPLOYMENT_LESSONS.md](../../docs/DEPLOYMENT_LESSONS.md) - Our learnings
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - System design
- [app/_lib/db-schema.ts](../../app/_lib/db-schema.ts) - Source of truth

---

**Last Updated:** January 14, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready
