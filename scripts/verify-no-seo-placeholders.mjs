import fs from 'node:fs/promises';
import path from 'node:path';

const TOKEN_PATTERN = /__SEO_[A-Z0-9_]+__/g;
const roots = ['dist', '.vercel/output/static'];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
      continue;
    }
    if (entry.isFile() && full.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

async function scanRoot(root) {
  try {
    await fs.access(root);
  } catch {
    return { root, scanned: 0, failures: [] };
  }

  const htmlFiles = await walk(root);
  const failures = [];

  for (const file of htmlFiles) {
    const contents = await fs.readFile(file, 'utf8');
    const matches = [...new Set(contents.match(TOKEN_PATTERN) || [])];
    if (matches.length > 0) {
      failures.push({ file, matches });
    }
  }

  return { root, scanned: htmlFiles.length, failures };
}

const reports = await Promise.all(roots.map(scanRoot));
const totalScanned = reports.reduce((sum, r) => sum + r.scanned, 0);
const allFailures = reports.flatMap(r => r.failures);

for (const report of reports) {
  console.log(`[seo-placeholder-check] ${report.root}: scanned ${report.scanned} HTML files`);
}

if (allFailures.length > 0) {
  console.error('\n[seo-placeholder-check] Found unresolved SEO placeholders in build artifacts:');
  for (const failure of allFailures) {
    console.error(`- ${failure.file}`);
    console.error(`  tokens: ${failure.matches.join(', ')}`);
  }
  process.exit(1);
}

if (totalScanned === 0) {
  console.error('[seo-placeholder-check] No HTML artifacts found to scan.');
  process.exit(1);
}

console.log('[seo-placeholder-check] No unresolved __SEO_ placeholders found.');
