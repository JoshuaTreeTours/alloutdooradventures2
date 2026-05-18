import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const BAD = /(__SEO|SEO_CANONICAL|undefined|null|placeholder|canonical\/canonical|-canonical-canonical)/i;
const URL_ATTR = /(?:href|content|loc)=["']([^"']+)["']|<loc>([^<]+)<\/loc>/gi;

const roots = ['dist','public'];
const failures = [];

for (const root of roots) {
  try {
    const files = await readdir(root);
    for (const file of files) {
      if (!file.endsWith('.html') && !file.endsWith('.xml')) continue;
      const p = path.join(root,file);
      const content = await readFile(p,'utf8');
      let m;
      while ((m = URL_ATTR.exec(content)) !== null) {
        const url = (m[1] || m[2] || '').trim();
        if (!url) continue;
        if (BAD.test(url)) failures.push(`${p}: ${url}`);
      }
    }
  } catch {}
}

if (failures.length) {
  console.error('[verify-no-malformed-urls] Failures:\n' + failures.slice(0,200).join('\n'));
  process.exit(1);
}
console.log('[verify-no-malformed-urls] passed');
