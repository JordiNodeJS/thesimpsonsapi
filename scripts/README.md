# Scripts Directory

Utility scripts for The Simpsons API project development and deployment.

## Quick Reference

### 🚀 Release & Deployment

#### `merge-and-release.sh` ⭐ **NEW**

Automate PR merge and release tag creation with semantic versioning.

```bash
./merge-and-release.sh <PR_NUMBER> [--dry-run] [--no-tag] [--verbose]
```

**When to use**: After PR is approved and ready to merge  
**What it does**: Merges PR, calculates next version, creates git tag, generates GitHub release  
**Skill**: [.github/skills/github-pull-request/RELEASE_TAGGING.md](../.github/skills/github-pull-request/RELEASE_TAGGING.md)

**Example**:

```bash
./merge-and-release.sh 42              # Merge PR #42 and create release
./merge-and-release.sh 42 --dry-run    # Preview what would happen
./merge-and-release.sh 42 --no-tag     # Just merge, no release tag
```

### 🔐 Environment Management

#### `sync-vercel-env.sh`

Synchronize environment variables from Vercel to local .env files.

```bash
./sync-vercel-env.sh [--all-envs]
```

**When to use**: Before deployment or when env vars change  
**Documentation**: See [.github/skills/vercel-env-sync/SKILL.md](../.github/skills/vercel-env-sync/SKILL.md)

#### `check-vercel-env.sh`

Verify that environment variables are properly configured.

```bash
./check-vercel-env.sh
```

**When to use**: To validate env setup before deployment

#### `audit-vercel-env.sh`

Audit environment variables for missing or incorrect values.

```bash
./audit-vercel-env.sh
```

**When to use**: To find and fix env configuration issues

#### `setup-vercel-env.sh`

Initial setup of environment variables.

```bash
./setup-vercel-env.sh
```

**When to use**: First-time setup or environment reset

### 🗄️ Database Management

#### `verify-db.ts`

Verify database connectivity and basic schema.

```bash
pnpm tsx verify-db.ts
```

**When to use**: To test database connection

#### `fix-orphan-records.ts`

Find and remove orphaned database records.

```bash
pnpm tsx fix-orphan-records.ts
```

**When to use**: After data migrations or schema changes

#### `check-db-config.js`

Check database configuration and connection pooling.

```bash
node check-db-config.js
```

**When to use**: To debug database connection issues

### 🧪 Testing & Validation

#### `test-query-performance.ts`

Analyze query performance and suggest optimizations.

```bash
pnpm tsx test-query-performance.ts
```

**When to use**: To identify slow queries and performance bottlenecks

#### `test-zod-validations.ts`

Test Zod schema validations.

```bash
pnpm tsx test-zod-validations.ts
```

**When to use**: To verify form validation logic

## By Category

### 🎯 Most Used

1. `merge-and-release.sh` - Release management
2. `sync-vercel-env.sh` - Environment setup
3. `verify-db.ts` - Connection testing

### 🔧 Maintenance

1. `check-vercel-env.sh` - Validate configuration
2. `audit-vercel-env.sh` - Find issues
3. `fix-orphan-records.ts` - Clean up database

### 🐛 Debugging

1. `test-query-performance.ts` - Performance analysis
2. `check-db-config.js` - Connection debugging
3. `test-zod-validations.ts` - Validation testing

## Running Scripts

### Bash Scripts

```bash
./script-name.sh [arguments]
```

### TypeScript/Node Scripts

```bash
# Using tsx (preferred)
pnpm tsx script-name.ts

# Using node directly (for .js files)
node script-name.js
```

## Prerequisites

### System Requirements

- Node.js 18+
- Git
- GitHub CLI (`gh`) for release scripts
- pnpm package manager

### Installation

```bash
# Install Node.js
winget install OpenJS.NodeJS  # Windows
brew install node              # macOS
# or use your distro's package manager

# Install pnpm
npm install -g pnpm

# Install GitHub CLI
winget install GitHub.cli      # Windows
brew install gh                # macOS

# Verify installations
node --version
pnpm --version
gh --version
git --version
```

## Environment Variables

Most scripts require these env variables to be set:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Vercel
VERCEL_TOKEN=<token>
VERCEL_ORG_ID=<org-id>
VERCEL_PROJECT_ID=<project-id>

# GitHub (for release scripts)
GH_TOKEN=<github-token>
```

Set in `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

## Troubleshooting

### "Command not found" Error

```bash
# Make sure you're in the project root
cd /path/to/thesimpsonsapi

# Use relative path
./scripts/script-name.sh

# Or use pnpm
pnpm tsx scripts/script-name.ts
```

### "Permission denied" Error

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Or use bash directly
bash scripts/script-name.sh
```

### Environment Issues

```bash
# Ensure env vars are loaded
source .env.local

# For bash scripts, env vars should be automatic
# For Node scripts, create/update .env.local
```

## Adding New Scripts

1. Create script in this directory
2. Add shebang line: `#!/bin/bash` (for bash) or use `.ts` for TypeScript
3. Make executable: `chmod +x script-name.sh`
4. Document in this README
5. Update [RELEASE_TAGGING.md](../docs/RELEASE_TAGGING.md) if release-related

## Related Documentation

- [Release Tagging Guide](../docs/RELEASE_TAGGING.md)
- [Deployment Lessons](../docs/DEPLOYMENT_LESSONS.md)
- [GitHub PR Skill](../.github/skills/github-pull-request/SKILL.md)
- [Vercel Environment Sync](../.github/skills/vercel-env-sync/SKILL.md)

## Quick Links

- 🐙 [GitHub Releases](https://github.com/JordiNodeJS/thesimpsonsapi/releases)
- 🔗 [Repository](https://github.com/JordiNodeJS/thesimpsonsapi)
- 📦 [Vercel Project](https://vercel.com)
- 🗄️ [Neon Database](https://neon.tech)
