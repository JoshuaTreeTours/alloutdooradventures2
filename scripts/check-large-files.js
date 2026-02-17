#!/usr/bin/env node

import { execSync } from 'node:child_process';

const LIMIT_BYTES = 5 * 1024 * 1024;

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only -z', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return output
    .split('\0')
    .map((file) => file.trim())
    .filter(Boolean);
}

function getStagedBlobSize(filePath) {
  try {
    const output = execSync(`git cat-file -s :"${filePath.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return Number.parseInt(output.trim(), 10);
  } catch {
    return null;
  }
}

const oversizedFiles = [];

for (const filePath of getStagedFiles()) {
  const size = getStagedBlobSize(filePath);

  if (Number.isInteger(size) && size > LIMIT_BYTES) {
    oversizedFiles.push({ filePath, size });
  }
}

if (oversizedFiles.length > 0) {
  console.warn('⚠️ Large staged files detected (> 5MB):');
  for (const { filePath, size } of oversizedFiles) {
    const sizeMb = (size / (1024 * 1024)).toFixed(2);
    console.warn(` - ${filePath} (${sizeMb} MB)`);
  }
  process.exit(1);
}

console.log('No staged files exceed 5MB.');
