import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tsImport } from 'tsx/esm/api';

const distDir = path.resolve('dist');
const templatePath = path.join(distDir, 'index.html');
const SITE = 'https://www.alloutdooradventures.com';

const buildOutputPath = (pathname) => {
  if (!pathname || pathname === '/') return templatePath;
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  if (path.extname(normalized)) return path.join(distDir, normalized);
  return path.join(distDir, normalized, 'index.html');
};

const titleCase = value => value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const setMetaByAttr = (html, attr, name, value) => {
  const re = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*>`, 'i');
  return html.replace(re, `<meta ${attr}="${name}" content="${value}" />`);
};

const applySeo = (html, { title, description, url, image }) => {
  let out = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = setMetaByAttr(out, 'name', 'description', description);
  out = setMetaByAttr(out, 'property', 'og:title', title);
  out = setMetaByAttr(out, 'property', 'og:description', description);
  out = setMetaByAttr(out, 'property', 'og:url', url);
  out = setMetaByAttr(out, 'property', 'og:image', image);
  out = setMetaByAttr(out, 'name', 'twitter:title', title);
  out = setMetaByAttr(out, 'name', 'twitter:description', description);
  out = setMetaByAttr(out, 'name', 'twitter:image', image);
  out = out.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
  const ld = `<script id="structured-data" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description, image }).replace(/</g, '\\u003c')}</script>`;
  out = /application\/ld\+json/i.test(out) ? out.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, ld) : out.replace('</head>', `${ld}</head>`);
  return out;
};

const files = (await readdir(distDir)).filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));
const urls = new Set();
for (const file of files) {
  const xml = await readFile(path.join(distDir, file), 'utf8');
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    if (!/\.xml$/i.test(match[1])) urls.add(match[1]);
  }
}

const template = await readFile(templatePath, 'utf8');
const engine6Registry = await tsImport('../src/engine6/registry.ts', import.meta.url);
const engine6SeoMod = await tsImport('../src/engine6/seo.ts', import.meta.url);
const engine6Tours = Array.isArray(engine6Registry.engine6ResolvedTours) ? engine6Registry.engine6ResolvedTours : [];
const seoByPath = new Map(engine6Tours.map(t => [t.canonicalPath, engine6SeoMod.buildEngine6Seo(t)]));

const paths = new Set(['/destinations']);
for (const url of urls) paths.add(new URL(url).pathname);
for (const tour of engine6Tours) {
  paths.add(tour.canonicalPath);
  const m = /^\/destinations\/([^/]+)\/([^/]+)\/tours\/[^/]+$/.exec(tour.canonicalPath);
  if (m) {
    paths.add(`/destinations/${m[1]}`);
    paths.add(`/destinations/${m[1]}/${m[2]}`);
    paths.add(`/destinations/${m[1]}/${m[2]}/tours`);
  }
}

let created = 0;
for (const pathname of paths) {
  const outputPath = buildOutputPath(pathname);
  if (outputPath === templatePath) continue;
  try { const s = await stat(outputPath); if (s.isFile()) continue; } catch {}
  await mkdir(path.dirname(outputPath), { recursive: true });

  const detailSeo = seoByPath.get(pathname);
  const listMatch = /^\/destinations\/([^/]+)\/([^/]+)\/tours$/.exec(pathname);
  const cityMatch = /^\/destinations\/([^/]+)\/([^/]+)$/.exec(pathname);
  const stateMatch = /^\/destinations\/([^/]+)$/.exec(pathname);

  const routeSeo = detailSeo
    ? { title: detailSeo.title, description: detailSeo.description, url: `${SITE}${detailSeo.url}`, image: detailSeo.image }
    : listMatch
      ? { title: `${titleCase(listMatch[2])} Tours & Activities`, description: `Explore outdoor tours and activities in ${titleCase(listMatch[2])} with All Outdoor Adventures.`, url: `${SITE}${pathname}`, image: `${SITE}/hero.jpg` }
      : cityMatch
        ? { title: `${titleCase(cityMatch[2])}, ${titleCase(cityMatch[1])} Outdoor Guide`, description: `Discover outdoor adventures, things to do, and tours in ${titleCase(cityMatch[2])}, ${titleCase(cityMatch[1])}.`, url: `${SITE}${pathname}`, image: `${SITE}/hero.jpg` }
        : stateMatch
          ? { title: `${titleCase(stateMatch[1])} Outdoor Destinations & Tours`, description: `Explore outdoor destinations, city guides, and tours across ${titleCase(stateMatch[1])}.`, url: `${SITE}${pathname}`, image: `${SITE}/hero.jpg` }
          : pathname === '/destinations'
            ? { title: 'Destinations | All Outdoor Adventures', description: 'Browse destination guides and outdoor tours by state and city.', url: `${SITE}${pathname}`, image: `${SITE}/hero.jpg` }
            : null;

  await writeFile(outputPath, routeSeo ? applySeo(template, routeSeo) : template, 'utf8');
  created += 1;
}

console.log(`[ensure-prerendered-route-files] created ${created} missing HTML files from sitemap URLs.`);
