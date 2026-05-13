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

const buildGenericRouteSeo = (pathname) => {
  if (!pathname || pathname === '/') return null;

  if (pathname === '/guides') {
    return {
      title: 'Travel Guides | All Outdoor Adventures',
      description: 'Explore destination travel guides, outdoor adventures, attractions, and curated experiences across top locations.',
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  const guidesState = /^\/guides\/us\/([^/]+)$/.exec(pathname);
  if (guidesState) {
    const state = titleCase(guidesState[1]);
    return {
      title: `${state} Travel Guides | All Outdoor Adventures`,
      description: `Explore travel guides, attractions, outdoor activities, and local experiences throughout ${state}.`,
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  if (pathname === '/guides/us') {
    return {
      title: 'United States Travel Guides | All Outdoor Adventures',
      description: 'Explore destination travel guides, attractions, outdoor activities, and local experiences across the United States.',
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  const staticPageSeo = {
    '/faqs': ['FAQs | All Outdoor Adventures', 'Find answers about tours, bookings, planning, and outdoor adventure travel with All Outdoor Adventures.'],
    '/about': ['About | All Outdoor Adventures', 'Learn about All Outdoor Adventures and how we curate outdoor tours, experiences, and destination guides.'],
    '/contact': ['Contact | All Outdoor Adventures', 'Contact All Outdoor Adventures for help with tours, destination planning, and travel experiences.'],
  };
  if (staticPageSeo[pathname]) {
    return { title: staticPageSeo[pathname][0], description: staticPageSeo[pathname][1], url: `${SITE}${pathname}`, image: `${SITE}/hero.jpg` };
  }

  const guidesCity = /^\/guides\/us\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (guidesCity) {
    const state = titleCase(guidesCity[1]);
    const city = titleCase(guidesCity[2]);
    return {
      title: `${city} Travel Guide | All Outdoor Adventures`,
      description: `Explore travel guides, attractions, outdoor activities, neighborhoods, food experiences, and local adventures in ${city}, ${state}.`,
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  const destinationState = /^\/destinations\/([^/]+)$/.exec(pathname);
  if (destinationState) {
    const state = titleCase(destinationState[1]);
    return {
      title: `${state} Destinations | All Outdoor Adventures`,
      description: `Discover tours, outdoor adventures, attractions, and travel destinations throughout ${state}.`,
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  const cityTours = /^\/destinations\/([^/]+)\/([^/]+)\/tours$/.exec(pathname);
  if (cityTours) {
    const state = titleCase(cityTours[1]);
    const city = titleCase(cityTours[2]);
    const description = city.toLowerCase() === 'san francisco'
      ? `Discover sightseeing tours, cruises, food experiences, outdoor adventures, and attractions in ${city}.`
      : `Explore top-rated tours, outdoor adventures, cruises, attractions, and experiences in ${city}, ${state}.`;
    return {
      title: `${city} Tours & Activities | All Outdoor Adventures`,
      description,
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  const cityPage = /^\/destinations\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (cityPage) {
    const state = titleCase(cityPage[1]);
    const city = titleCase(cityPage[2]);
    return {
      title: `${city}, ${state} Outdoor Guide | All Outdoor Adventures`,
      description: `Discover outdoor adventures, things to do, and travel experiences in ${city}, ${state}.`,
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  if (pathname === '/destinations') {
    return {
      title: 'Destinations | All Outdoor Adventures',
      description: 'Browse outdoor adventure destinations, tours, activities, and experiences throughout the United States.',
      url: `${SITE}${pathname}`,
      image: `${SITE}/hero.jpg`,
    };
  }

  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (!segments.length) return null;
  const label = segments.map(titleCase).join(' / ');
  return {
    title: `${label} | All Outdoor Adventures`,
    description: `Explore ${label} with All Outdoor Adventures.`,
    url: `${SITE}${pathname}`,
    image: `${SITE}/hero.jpg`,
  };
};

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
  let existingHtml = null;
  try {
    const s = await stat(outputPath);
    if (s.isFile()) {
      existingHtml = await readFile(outputPath, 'utf8');
    }
  } catch {}
  await mkdir(path.dirname(outputPath), { recursive: true });

  const detailSeo = seoByPath.get(pathname);
  const routeSeo = detailSeo
    ? { title: detailSeo.title, description: detailSeo.description, url: `${SITE}${detailSeo.url}`, image: detailSeo.image }
    : buildGenericRouteSeo(pathname);

  if (!routeSeo && existingHtml) {
    continue;
  }

  const sourceHtml = existingHtml ?? template;
  await writeFile(outputPath, routeSeo ? applySeo(sourceHtml, routeSeo) : template, 'utf8');
  created += 1;
}

console.log(`[ensure-prerendered-route-files] created ${created} missing HTML files from sitemap URLs.`);
