import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { tsImport } from 'tsx/esm/api';

const HOME_CANONICAL = 'https://www.alloutdooradventures.com/';
const HOME_TITLE = 'All Outdoor Adventures | Tours, Guides & Outdoor Experiences';
const dist = path.resolve('dist');

const registry = await tsImport('../src/engine6/registry.ts', import.meta.url);
const seoMod = await tsImport('../src/engine6/seo.ts', import.meta.url);
const tours = Array.isArray(registry.engine6ResolvedTours) ? registry.engine6ResolvedTours : [];
const buildEngine6Seo = seoMod.buildEngine6Seo;

const failures = [];
for (const tour of tours.slice(0, 2000)) {
  const p = path.join(dist, tour.canonicalPath.replace(/^\//,''), 'index.html');
  let html;
  try { html = await readFile(p, 'utf8'); } catch { failures.push(`${tour.canonicalPath}:missing-file`); continue; }
  const seo = buildEngine6Seo(tour);
  const expectedUrl = `https://www.alloutdooradventures.com${tour.canonicalPath}`;
  if (!html.includes(`<title>${seo.title}</title>`) || html.includes(`<title>${HOME_TITLE}</title>`)) failures.push(`${tour.canonicalPath}:title`);
  if (!html.includes(`rel="canonical" href="${expectedUrl}"`) || html.includes(`rel="canonical" href="${HOME_CANONICAL}"`)) failures.push(`${tour.canonicalPath}:canonical`);
  if (!html.includes(`property=\"og:url\" content=\"${expectedUrl}\"`)) failures.push(`${tour.canonicalPath}:og:url`);
  if (!html.includes('application/ld+json') || !html.includes(expectedUrl)) failures.push(`${tour.canonicalPath}:jsonld`);
}

if (failures.length) {
  console.error('[verify-engine6-route-seo] failed:\n' + failures.slice(0,50).join('\n'));
  process.exit(1);
}
console.log(`[verify-engine6-route-seo] verified ${tours.length} Engine6 routes.`);
