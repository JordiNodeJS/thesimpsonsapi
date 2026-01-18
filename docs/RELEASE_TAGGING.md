# Release Tagging Guide

> **Note**: This documentation is maintained in the GitHub PR Skill.
> For the latest version, see [.github/skills/github-pull-request/RELEASE_TAGGING.md](.github/skills/github-pull-request/RELEASE_TAGGING.md)

## Quick Start

After a PR is approved and ready to merge, use the automated merge-and-release script:

```bash
# Merge PR #42 and create release v1.2.0
./scripts/merge-and-release.sh 42

# Preview what would happen
./scripts/merge-and-release.sh 42 --dry-run

# Merge without creating a tag
./scripts/merge-and-release.sh 42 --no-tag
```

## How It Works

The `merge-and-release.sh` script performs these steps automatically:

1. **Verify PR is valid** - Checks PR exists and is in OPEN state
2. **Check merge compatibility** - Ensures no conflicts and all checks pass
3. **Fetch PR details** - Gets title, branch, and other metadata
4. **Calculate version** - Uses Conventional Commits to determine MAJOR/MINOR/PATCH bump
5. **Merge PR** - Squashes commits and removes remote branch
6. **Create git tag** - Creates annotated tag with release notes
7. **Push tag** - Pushes tag to GitHub
8. **Create GitHub release** - Generates release page with PR info

## Semantic Versioning Rules

The script automatically determines version bumps based on PR title:

| PR Type      | Example                   | Version Bump                |
| ------------ | ------------------------- | --------------------------- |
| **feat**     | `feat: add new feature`   | **MINOR** (v1.2.0 → v1.3.0) |
| **fix**      | `fix: resolve bug`        | **PATCH** (v1.2.0 → v1.2.1) |
| **docs**     | `docs: update README`     | **PATCH** (v1.2.0 → v1.2.1) |
| **refactor** | `refactor: optimize code` | **PATCH** (v1.2.0 → v1.2.1) |
| **chore**    | `chore: update deps`      | **PATCH** (v1.2.0 → v1.2.1) |

## Options

### `--dry-run`

Preview what would happen without making any changes:

```bash
./scripts/merge-and-release.sh 42 --dry-run
```

Output shows:

- PR merge plan
- Version calculation
- Tag that would be created
- Release notes preview

### `--no-tag`

Merge PR without creating a release tag:

```bash
./scripts/merge-and-release.sh 42 --no-tag
```

Useful for:

- Hotfixes that shouldn't be released yet
- Early stage features
- Emergency merges

### `--verbose`

Show detailed execution steps:

```bash
./scripts/merge-and-release.sh 42 --verbose
```

## Full Documentation

For comprehensive documentation, see:

- [.github/skills/github-pull-request/SKILL.md](.github/skills/github-pull-request/SKILL.md)
- [.github/skills/github-pull-request/RELEASE_TAGGING.md](.github/skills/github-pull-request/RELEASE_TAGGING.md)

## Manual Workflow (if needed)

If you need to merge and tag manually:

```bash
# 1. Merge the PR
gh pr merge 42 --squash --delete-branch

# 2. Get current version
CURRENT_TAG=$(git describe --tags --abbrev=0)
echo "Current: $CURRENT_TAG"

# 3. Create next version (example: bump minor)
NEXT_VERSION="v1.3.0"

# 4. Create tag with release notes
git tag -a "$NEXT_VERSION" -m "Release $NEXT_VERSION

Merged PR #42

Release Date: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"

# 5. Push tag
git push origin "$NEXT_VERSION"

# 6. Create GitHub release
gh release create "$NEXT_VERSION" \
  --title "Release $NEXT_VERSION" \
  --notes "See PR #42 for changes"
```

## Troubleshooting

### "PR not found or inaccessible"

- Verify PR number is correct
- Check you're authenticated: `gh auth status`

### "PR is not OPEN"

- PR might already be merged
- Check: `gh pr view <number>`

### "PR is not mergeable"

- Resolve conflicts first
- Ensure all checks pass

### "Failed to create git tag"

- Tag might already exist: `git tag -l | grep "^v"`
- Try with different version number

### "Tag was created but GitHub release failed"

- Tag is already in GitHub
- Create release manually: `gh release create <tag>`

## Integration with CI/CD

The script can be called from CI/CD pipelines:

```bash
#!/bin/bash
# GitHub Actions example
- name: Merge and Release
  run: |
    ./scripts/merge-and-release.sh ${{ github.event.pull_request.number }}
  if: github.event.pull_request.merged == true
```

## Version History Format

Release tags follow this format:

```
vMAJOR.MINOR.PATCH

Examples:
v1.0.0   # Initial release
v1.1.0   # New features added
v1.1.1   # Bug fix
v2.0.0   # Breaking changes
```

Each tag includes:

- Release title
- PR reference
- Merge commit hash
- Release date

View releases: https://github.com/JordiNodeJS/thesimpsonsapi/releases

## Tips

1. **Always use the script** - Ensures consistency and prevents mistakes
2. **Review PRs before merging** - Script won't merge unapproved PRs
3. **Use --dry-run first** - Safe way to preview before committing
4. **Check version calculations** - Verify MAJOR/MINOR/PATCH decisions
5. **Verify GitHub release** - Click link in script output to confirm

## Related Commands

```bash
# List all releases
gh release list

# View specific release
gh release view v1.2.0

# List git tags
git tag -l

# Delete a tag (if needed)
git tag -d v1.2.0
git push origin --delete v1.2.0

# Show commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

## Questions?

For more information, see:

- [GitHub Pull Request Skill](.github/skills/github-pull-request/SKILL.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
