import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = (process.env.SITE_URL || "https://www.alloutdooradventures.com").replace(
  /\/+$/,
  "",
);

const ensurePath = (value) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.pathname || "/";
    } catch {
      return null;
    }
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const addUrl = (set, value) => {
  const normalized = ensurePath(value);
  if (!normalized) {
    return;
  }

  set.add(normalized);
};

const buildSitemap = async () => {
  const destinationsModule = await tsImport(
    "../src/data/destinations.ts",
    import.meta.url,
  );
  const toursModule = await tsImport("../src/data/tours.ts", import.meta.url);
  const catalogModule = await tsImport(
    "../src/data/tourCatalog.ts",
    import.meta.url,
  );
  const flagstaffModule = await tsImport(
    "../src/data/flagstaffTours.ts",
    import.meta.url,
  );

  const urls = new Set();

  addUrl(urls, "/");
  addUrl(urls, "/tours");
  addUrl(urls, "/tours/catalog");
  addUrl(urls, "/tours/day");
  addUrl(urls, "/tours/day/cycling");
  addUrl(urls, "/tours/day/hiking");
  addUrl(urls, "/tours/day/paddle");
  addUrl(urls, "/tours/multi-day");
  addUrl(urls, "/tours/cycling");
  addUrl(urls, "/tours/hiking");
  addUrl(urls, "/tours/canoeing");

  if (Array.isArray(catalogModule.ACTIVITY_PAGES)) {
    catalogModule.ACTIVITY_PAGES.forEach((activity) => {
      addUrl(urls, `/tours/activities/${activity.slug}`);
    });
  }

  if (Array.isArray(catalogModule.ADVENTURE_ACTIVITY_PAGES)) {
    catalogModule.ADVENTURE_ACTIVITY_PAGES.forEach((activity) => {
      addUrl(urls, `/tours/activities/${activity.slug}`);
      addUrl(urls, `/tours/${activity.slug}`);
    });
  }

  addUrl(urls, "/destinations");

  if (Array.isArray(destinationsModule.destinations)) {
    destinationsModule.destinations.forEach((destination) => {
      addUrl(urls, destination.href);
    });
  }

  if (Array.isArray(destinationsModule.states)) {
    destinationsModule.states.forEach((state) => {
      addUrl(urls, `/destinations/states/${state.slug}`);
      addUrl(urls, `/destinations/states/${state.slug}/tours`);

      if (Array.isArray(state.cities)) {
        state.cities.forEach((city) => {
          addUrl(urls, `/destinations/${state.slug}/${city.slug}`);
          addUrl(
            urls,
            `/destinations/states/${state.slug}/cities/${city.slug}/tours`,
          );
        });
      }
    });
  }

  if (Array.isArray(toursModule.tours)) {
    toursModule.tours.forEach((tour) => {
      addUrl(urls, toursModule.getTourDetailPath(tour));
    });
  }

  if (Array.isArray(flagstaffModule.flagstaffTours)) {
    flagstaffModule.flagstaffTours.forEach((tour) => {
      addUrl(urls, flagstaffModule.getFlagstaffTourDetailPath(tour));
    });
  }

  const sortedUrls = Array.from(urls).sort((a, b) => a.localeCompare(b));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  const urlsetOpen =
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = "</urlset>\n";
  const urlEntries = sortedUrls
    .map((url) => `  <url><loc>${BASE_URL}${url}</loc></url>`)
    .join("\n");

  return {
    xml: `${xml}${urlsetOpen}${urlEntries}\n${urlsetClose}`,
    urls: sortedUrls,
  };
};

const run = async () => {
  const { xml, urls } = await buildSitemap();
  const distOutputPath = path.resolve(__dirname, "../dist/sitemap.xml");
  const publicOutputPath = path.resolve(__dirname, "../public/sitemap.xml");

  await mkdir(path.dirname(distOutputPath), { recursive: true });
  await writeFile(distOutputPath, xml, "utf8");

  try {
    await mkdir(path.dirname(publicOutputPath), { recursive: true });
    await writeFile(publicOutputPath, xml, "utf8");
  } catch {
    // Optional secondary output; ignore failures.
  }

  const sample = urls.slice(0, 5).join(", ");
  console.log(`Sitemap URLs: ${urls.length}`);
  console.log(`Sitemap output: ${distOutputPath}`);
  console.log(`Sitemap samples: ${sample}`);
};

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Sitemap generation failed: ${message}`);
  process.exit(0);
}
