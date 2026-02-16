#!/usr/bin/env bash

set -e

REMOTE_URL="https://github.com/JoshuaTreeTours/alloutdooradventures2.git"

if git remote | grep -q origin; then
  echo "origin already exists"
else
  git remote add origin $REMOTE_URL
  echo "origin added"
fi

git remote -v
