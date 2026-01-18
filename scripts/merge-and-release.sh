#!/bin/bash

################################################################################
# merge-and-release.sh
#
# Wrapper script that delegates to the skill implementation.
# This file is kept here for convenience but the actual implementation
# is in .github/skills/github-pull-request/scripts/merge-and-release.sh
#
# Usage: ./scripts/merge-and-release.sh <PR_NUMBER> [options]
#
# Options:
#   --no-tag    Don't create a git tag (just merge)
#   --dry-run   Show what would happen without making changes
#   --help      Show this help message
#
# Examples:
#   ./scripts/merge-and-release.sh 42                # Merge PR #42 and create release
#   ./scripts/merge-and-release.sh 45 --dry-run      # Preview what would happen
#   ./scripts/merge-and-release.sh 42 --no-tag       # Just merge, no release
#
# For full documentation, see:
#   - .github/skills/github-pull-request/RELEASE_TAGGING.md
#   - .github/skills/github-pull-request/SKILL.md
#
################################################################################

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Delegate to the skill implementation
exec "$PROJECT_ROOT/.github/skills/github-pull-request/scripts/merge-and-release.sh" "$@"
