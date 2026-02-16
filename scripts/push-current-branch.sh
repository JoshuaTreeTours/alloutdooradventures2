#!/usr/bin/env bash

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $BRANCH"

git push -u origin $BRANCH
