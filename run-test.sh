#!/bin/bash

# Load environment variables from .env.local
set -a
source .env.local
set +a

# Run the test
pnpm dlx tsx test-prisma.ts
