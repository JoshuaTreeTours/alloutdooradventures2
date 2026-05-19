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

  const guidesCity = /^\/guides\/us\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (guidesCity) {
    const state = titleCase(guidesCity[1]);
    const city = titleCase(guidesCity[2]);
    return {
      title: `${city} Travel Guide | All Outdoor Adventures`,
      description: `Explore travel guides, outdoor activities, tours, neighborhoods, and local experiences in ${city}, ${state}.`,
      url: `${SITE}${pathname}`,
      image: ``,
    };
  }

  const destinationState = /^\/destinations\/([^/]+)$/.exec(pathname);
  if (destinationState) {
    const state = titleCase(destinationState[1]);
    return {
      title: `${state} Destinations | All Outdoor Adventures`,
      description: `Discover outdoor adventures, tours, and travel destinations throughout ${state}.`,
      url: `${SITE}${pathname}`,
      image: ``,
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
      image: ``,
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
      image: ``,
    };
  }

  if (pathname === '/destinations') {
    return {
      title: 'Destinations | All Outdoor Adventures',
      description: 'Browse destination guides and outdoor tours by state and city.',
      url: `${SITE}${pathname}`,
      image: ``,
    };
  }

  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (!segments.length) return null;
  const label = segments.map(titleCase).join(' / ');
  return {
    title: `${label} | All Outdoor Adventures`,
    description: `Explore ${label} with All Outdoor Adventures.`,
    url: `${SITE}${pathname}`,
    image: ``,
  };
};

const fallbackSeoEmitterModule = await tsImport('../src/lib/fallbackSeoEmitter.ts', import.meta.url);
const applySeo = fallbackSeoEmitterModule.applyRouteSeo;
const isLegacyTourDetailPath = fallbackSeoEmitterModule.isLegacyTourDetailPath;
const buildLegacyTourRouteFallbackSeo = fallbackSeoEmitterModule.buildLegacyTourRouteFallbackSeo;

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
const toursModule = await tsImport('../src/data/tours.generated.ts', import.meta.url);
const flagstaffToursModule = await tsImport('../src/data/flagstaffTours.ts', import.meta.url);
const tourSeoModule = await tsImport('../src/lib/tourSeo.ts', import.meta.url);
const legacyRouteSeoModule = await tsImport('../src/lib/legacyRouteSeo.ts', import.meta.url);
const engine6Tours = Array.isArray(engine6Registry.engine6ResolvedTours) ? engine6Registry.engine6ResolvedTours : [];
const toursGenerated = Array.isArray(toursModule.toursGenerated) ? toursModule.toursGenerated : [];
const flagstaffTours = Array.isArray(flagstaffToursModule.flagstaffTours) ? flagstaffToursModule.flagstaffTours : [];
const tours = [...toursGenerated, ...flagstaffTours];
const seoByPath = new Map(engine6Tours.map(t => [t.canonicalPath, engine6SeoMod.buildEngine6Seo(t)]));

const paths = new Set(['/destinations']);
for (const url of urls) paths.add(new URL(url).pathname);
for (const pathname of Array.from(paths)) {
  const legacyTourMatch = /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (legacyTourMatch) {
    paths.add(`/destinations/${legacyTourMatch[1]}/${legacyTourMatch[2]}/tours/${legacyTourMatch[3]}`);
  }
}
for (const tour of engine6Tours) {
  paths.add(tour.canonicalPath);
  const legacyTourMatch = /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(tour.canonicalPath);
  if (legacyTourMatch) {
    paths.add(`/destinations/${legacyTourMatch[1]}/${legacyTourMatch[2]}/tours/${legacyTourMatch[3]}`);
  }
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
  const legacySeo = legacyRouteSeoModule.buildLegacyTourRouteSeo({
    pathname,
    tours,
    buildTourMetaFn: tourSeoModule.buildTourMeta,
    buildBookingMetaFn: tourSeoModule.buildBookingMeta,
    site: SITE,
  });
  const routeSeo = detailSeo
    ? { title: detailSeo.title, description: detailSeo.description, url: `${SITE}${detailSeo.url}`, image: detailSeo.image }
    : legacySeo ??
      (isLegacyTourDetailPath(pathname)
        ? buildLegacyTourRouteFallbackSeo({ pathname, site: SITE })
        : buildGenericRouteSeo(pathname));

  await writeFile(outputPath, routeSeo ? applySeo(template, routeSeo) : template, 'utf8');
  if (pathname === "/destinations/florida/santa-rosa-beach/tours/dolphin-cruise-614529") {
    console.log(`[ensure-prerendered-route-files] Dolphin output path: ${outputPath}`);
  }
  created += 1;
}

console.log(`[ensure-prerendered-route-files] created ${created} missing HTML files from sitemap URLs.`);
