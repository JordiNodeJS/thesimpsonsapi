# Neon Database Management Skill

Quick reference for managing the Neon PostgreSQL database in The Simpsons API.

## Quick Commands

### Verify Database Configuration (No connection required)
```bash
node .github/skills/neon-database-management/check-db-config.js
```

### Verify Database Connection (Requires DATABASE_URL)
```bash
pnpm dlx tsx scripts/verify-db.ts
```

## Essential Rules

1. **Always import TABLES:**
   ```typescript
   import { TABLES } from "@/app/_lib/db-schema";
   ```

2. **Use TABLES in queries:**
   ```typescript
   // ✅ CORRECT
   await query(`SELECT * FROM ${TABLES.characters} WHERE id = $1`, [id]);
   
   // ❌ WRONG
   await query(`SELECT * FROM the_simpson.characters WHERE id = $1`, [id]);
   ```

3. **Use repository functions when available:**
   ```typescript
   import { findCharacterById } from "@/app/_lib/repositories";
   const character = await findCharacterById(1);
   ```

## Common Patterns

### Query Pattern (Read)
```typescript
import { query, queryOne } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";

// Multiple rows
const items = await query(`SELECT * FROM ${TABLES.myTable}`);

// Single row
const item = await queryOne(`SELECT * FROM ${TABLES.myTable} WHERE id = $1`, [id]);
```

### Execute Pattern (Write)
```typescript
import { execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";

await execute(
  `INSERT INTO ${TABLES.myTable} (field) VALUES ($1)`,
  [value]
);
```

### Server Action Pattern
```typescript
"use server";

import { execute } from "@/app/_lib/db-utils";
import { TABLES } from "@/app/_lib/db-schema";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function myAction(data: SomeData) {
  const user = await getCurrentUser();
  await execute(
    `INSERT INTO ${TABLES.myTable} (user_id, field) VALUES ($1, $2)`,
    [user.id, data.field]
  );
  revalidatePath("/my-page");
}
```

## Schema Structure

```
the_simpson/
  ├── characters              (synced from API)
  ├── episodes               (synced from API)
  ├── locations              (synced from API)
  ├── users                  (app users)
  ├── user_episode_progress  (watch tracking)
  ├── character_follows      (social)
  ├── character_comments     (social)
  ├── character_favorites    (social)
  ├── trivia_facts           (community)
  ├── diary_entries          (feature)
  ├── quote_collections      (feature)
  └── collection_quotes      (feature)
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "relation does not exist" | Use `${TABLES.tableName}` instead of bare table name |
| Works in dev, fails in prod | Ensure using qualified table names via TABLES |
| DATABASE_URL not defined | Add to `.env.local` |
| Validation warnings | Run `check-db-config.js` and fix hardcoded schemas |

## Full Documentation

See [SKILL.md](SKILL.md) for complete documentation including:
- Architecture details
- Best practices
- Migration guide
- Performance tips
- Troubleshooting
- Neon-specific considerations

---

**Before any DB operation:** Review [SKILL.md](SKILL.md)  
**Before deployment:** Run `node .github/skills/neon-database-management/check-db-config.js`
