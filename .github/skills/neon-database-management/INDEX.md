# Neon Database Management

> Comprehensive skill for managing Neon PostgreSQL in The Simpsons API

## 📚 Quick Links

- **[SKILL.md](SKILL.md)** - Complete documentation (396 lines)
- **[README.md](README.md)** - Quick reference guide (123 lines)  
- **[CHANGELOG.md](CHANGELOG.md)** - Creation history and updates (223 lines)
- **[check-db-config.js](check-db-config.js)** - Verification script (148 lines)

## ⚡ Quick Start

### Verify Configuration
```bash
node .github/skills/neon-database-management/check-db-config.js
```

### Read Documentation
```bash
# Full skill
cat .github/skills/neon-database-management/SKILL.md

# Quick reference
cat .github/skills/neon-database-management/README.md
```

## 🎯 What This Skill Covers

- ✅ Neon serverless PostgreSQL setup
- ✅ Schema management (`the_simpson`)
- ✅ Centralized table constants (`TABLES`)
- ✅ Query patterns and best practices
- ✅ Server Actions patterns
- ✅ Development features (validation & logging)
- ✅ Troubleshooting guide
- ✅ Migration checklists

## 📊 Skill Stats

- **Total Lines:** 890
- **Files:** 4
- **Sections in SKILL.md:** 13
- **Code Examples:** 20+
- **Tables Documented:** 12
- **Status:** ✅ Production Ready

## 🔧 Common Commands

```bash
# Verify DB config (no connection required)
node .github/skills/neon-database-management/check-db-config.js

# Full verification (requires DATABASE_URL)
pnpm dlx tsx scripts/verify-db.ts

# Quick check
grep -r "the_simpson\." app/_lib app/_actions 2>/dev/null
```

## 📖 For AI Agents

When working with Neon database:

1. Read [SKILL.md](SKILL.md) for complete context
2. Use [README.md](README.md) for quick patterns
3. Run `check-db-config.js` to verify changes
4. Follow the best practices section
5. Check troubleshooting for common issues

## 👥 For Developers

- **Onboarding:** Start with [SKILL.md](SKILL.md)
- **Daily Work:** Use [README.md](README.md) as reference
- **Before Commit:** Run `check-db-config.js`
- **Debugging:** See troubleshooting section in SKILL.md

## 🎓 Learning Path

1. **Basics** → Read SKILL.md sections 1-4
2. **Practice** → Review code examples in section 5
3. **Advanced** → Study sections 8-10
4. **Master** → Implement changes following checklist (section 9)

## 🚨 Critical Rules

1. **Always import TABLES:** `import { TABLES } from "@/app/_lib/db-schema"`
2. **Never hardcode schema:** Use `${TABLES.tableName}` not `the_simpson.tablename`
3. **Verify before commit:** Run `check-db-config.js`
4. **Follow patterns:** Use repository functions when available

---

**Created:** January 14, 2026  
**Status:** ✅ Production Ready  
**Maintained By:** Development Team
