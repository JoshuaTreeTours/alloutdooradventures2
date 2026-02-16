#!/usr/bin/env bash

set -e

echo "Generating merchant feed..."
npx tsx scripts/generate-merchant-feed.ts

echo "Committing feed..."
git add data/merchantFeed.csv
git commit -m "update merchant feed" || echo "No changes"

echo "Pushing..."
bash scripts/push-current-branch.sh

echo "Done — feed available at:"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "https://raw.githubusercontent.com/JoshuaTreeTours/alloutdooradventures2/$BRANCH/data/merchantFeed.csv"
