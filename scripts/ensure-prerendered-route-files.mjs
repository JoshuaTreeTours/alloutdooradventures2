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

const setTagContent = (html, pattern, replacement) =>
  pattern.test(html) ? html.replace(pattern, replacement) : html;

const setMetaByAttr = (html, attr, name, value) => {
  const re = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*>`, 'i');
  return html.replace(re, `<meta ${attr}="${name}" content="${value}" />`);
};

const applySeo = (html, { title, description, url, image }) => {
  let out = html;
  out = setTagContent(out, /<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = setMetaByAttr(out, 'name', 'description', description);
  out = setMetaByAttr(out, 'property', 'og:title', title);
  out = setMetaByAttr(out, 'property', 'og:description', description);
  out = setMetaByAttr(out, 'property', 'og:url', url);
  out = setMetaByAttr(out, 'property', 'og:image', image);
  out = setMetaByAttr(out, 'name', 'twitter:title', title);
  out = setMetaByAttr(out, 'name', 'twitter:description', description);
  out = setMetaByAttr(out, 'name', 'twitter:image', image);
  out = out.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
  const ld = `<script id="structured-data" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description, image }).replace(/</g,'\\u003c')}</script>`;
  if (/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(out)) {
    out = out.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, ld);
  } else {
    out = out.replace('</head>', `${ld}</head>`);
  }
  return out;
};

const files = (await readdir(distDir)).filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));
const urls = new Set();
for (const file of files) {
  const xml = await readFile(path.join(distDir, file), 'utf8');
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const loc = match[1];
    if (!/\.xml$/i.test(loc)) urls.add(loc);
  }
}

const template = await readFile(templatePath, 'utf8');
const engine6Registry = await tsImport('../src/engine6/registry.ts', import.meta.url);
const engine6SeoMod = await tsImport('../src/engine6/seo.ts', import.meta.url);
const engine6Tours = Array.isArray(engine6Registry.engine6ResolvedTours) ? engine6Registry.engine6ResolvedTours : [];
const buildEngine6Seo = engine6SeoMod.buildEngine6Seo;
const seoByPath = new Map(engine6Tours.map(t => [t.canonicalPath, buildEngine6Seo(t)]));
const engine6ListingPaths = new Set();

const expandedPathnames = new Set();
for (const url of urls) expandedPathnames.add(new URL(url).pathname);
for (const tour of engine6Tours) {
  expandedPathnames.add(tour.canonicalPath);
  const listing = tour.canonicalPath.match(/^\/destinations\/([^/]+)\/([^/]+)\/tours\/[^/]+$/);
  if (listing) engine6ListingPaths.add(`/destinations/${listing[1]}/${listing[2]}/tours`);
}
for (const listingPath of engine6ListingPaths) expandedPathnames.add(listingPath);

let created = 0;
for (const pathname of expandedPathnames) {
  const outputPath = buildOutputPath(pathname);
  if (outputPath === templatePath) continue;
  let exists = false;
  try { const s = await stat(outputPath); exists = s.isFile(); } catch {}
  if (exists) continue;
  await mkdir(path.dirname(outputPath), { recursive: true });
  const engine6Seo = seoByPath.get(pathname);
  const listingMatch = pathname.match(/^\/destinations\/([^/]+)\/([^/]+)\/tours$/);
  const listingSeo = listingMatch
    ? {
        title: `${listingMatch[2].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} Tours & Activities`,
        description: `Explore outdoor tours and activities in ${listingMatch[2].replace(/-/g, " ")} with All Outdoor Adventures.`,
        url: `${SITE}${pathname}`,
        image: `${SITE}/hero.jpg`,
      }
    : null;
  const html = engine6Seo
    ? applySeo(template, {
        title: engine6Seo.title,
        description: engine6Seo.description,
        url: `${SITE}${engine6Seo.url}`,
        image: engine6Seo.image,
      })
    : listingSeo
      ? applySeo(template, listingSeo)
      : template;
  await writeFile(outputPath, html, 'utf8');
  created += 1;
}

console.log(`[ensure-prerendered-route-files] created ${created} missing HTML files from sitemap URLs.`);
