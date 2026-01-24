import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = (
  process.env.SITE_URL || "https://www.alloutdooradventures.com"
).replace(/\/+$/, "");
const MAX_URLS_PER_SITEMAP = 50000;

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

const escapeXml = (value) =>
  value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });

const buildUrlsetXml = (urls) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  const urlsetOpen =
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = "</urlset>\n";
  const urlEntries = urls
    .map((url) => `  <url><loc>${escapeXml(`${BASE_URL}${url}`)}</loc></url>`)
    .join("\n");

  return `${xml}${urlsetOpen}${urlEntries}\n${urlsetClose}`;
};

const buildSitemapIndexXml = (entries) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  const sitemapOpen =
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapClose = "</sitemapindex>\n";
  const sitemapEntries = entries
    .map((entry) => `  <sitemap><loc>${escapeXml(entry)}</loc></sitemap>`)
    .join("\n");

  return `${xml}${sitemapOpen}${sitemapEntries}\n${sitemapClose}`;
};

const getStateSlugSet = (catalogModule) =>
  new Set(
    (catalogModule.US_STATES || []).map((state) => catalogModule.slugify(state)),
  );

const parseCsvRows = (text) => {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    if (char !== "\r") {
      current += char;
    }
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (contents) => {
  const rows = parseCsvRows(contents);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((row) => {
    const entry = {};
    headers.forEach((header, index) => {
      if (!header) {
        return;
      }
      entry[header] = row[index]?.trim() ?? "";
    });
    return entry;
  });
};

const isUsStateTour = (tour, stateSlugSet, catalogModule) => {
  if (stateSlugSet.has(tour.destination.stateSlug)) {
    return true;
  }

  if (tour.destination.state) {
    return stateSlugSet.has(catalogModule.slugify(tour.destination.state));
  }

  return false;
};

const getCountrySlugFromTour = (tour, catalogModule) =>
  tour.destination.country
    ? catalogModule.slugify(tour.destination.country)
    : tour.destination.stateSlug ||
      (tour.destination.state
        ? catalogModule.slugify(tour.destination.state)
        : undefined);

const buildTourSummaries = async (catalogModule) => {
  const toursGeneratedModule = await tsImport(
    "../src/data/tours.generated.ts",
    import.meta.url,
  );

  const tours = [];

  if (Array.isArray(toursGeneratedModule.toursGenerated)) {
    toursGeneratedModule.toursGenerated.forEach((tour) => tours.push(tour));
  }

  const europeDir = path.resolve(__dirname, "../data/europe");
  const europeFiles = await readdir(europeDir);
  await Promise.all(
    europeFiles
      .filter((file) => file.endsWith(".csv"))
      .map(async (file) => {
        const activitySlug = file
          .replace(/^europe-/, "")
          .replace(/\.csv$/, "");
        const contents = await readFile(path.join(europeDir, file), "utf8");
        const rows = parseCsv(contents);

        rows.forEach((row) => {
          const location = row.location?.trim();
          const itemName = row.item_name?.trim();
          if (!location || !itemName) {
            return;
          }

          const locationParts = location
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean);
          const country = locationParts[0] ?? "Europe";
          const city = locationParts[locationParts.length - 1] ?? country;
          const itemId = row.item_id?.trim() || catalogModule.slugify(itemName);

          tours.push({
            slug: catalogModule.slugify(`${itemName}-${itemId}`),
            destination: {
              state: country,
              stateSlug: catalogModule.slugify(country),
              city,
              citySlug: catalogModule.slugify(city),
            },
            activitySlugs: [activitySlug],
            primaryCategory: activitySlug,
          });
        });
      }),
  );

  const australiaPath = path.resolve(__dirname, "../data/australia.csv");
  const australiaContents = await readFile(australiaPath, "utf8");
  const australiaRows = parseCsv(australiaContents);

  australiaRows.forEach((row) => {
    const location = row.location?.trim();
    const itemName = row.item_name?.trim();
    if (!location || !itemName) {
      return;
    }

    const locationParts = location
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);
    const city = locationParts[locationParts.length - 1] ?? "Unknown";
    const country = "Australia";
    const itemId = row.item_id?.trim() || catalogModule.slugify(itemName);

    tours.push({
      slug: catalogModule.slugify(`${itemName}-${itemId}`),
      destination: {
        state: country,
        stateSlug: catalogModule.slugify(country),
        city,
        citySlug: catalogModule.slugify(city),
      },
      activitySlugs: [],
      primaryCategory: undefined,
    });
  });

  return tours;
};

const buildSitemap = async () => {
  const destinationsModule = await tsImport(
    "../src/data/destinations.ts",
    import.meta.url,
  );
  const catalogModule = await tsImport(
    "../src/data/tourCatalog.ts",
    import.meta.url,
  );
  const flagstaffModule = await tsImport(
    "../src/data/flagstaffTours.ts",
    import.meta.url,
  );
  const tours = await buildTourSummaries(catalogModule);

  const urls = new Set();
  const stateSlugSet = getStateSlugSet(catalogModule);

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
  addUrl(urls, "/guides");
  addUrl(urls, "/faqs");
  addUrl(urls, "/journeys");
  addUrl(urls, "/about");
  addUrl(urls, "/contact");
  addUrl(urls, "/privacy");
  addUrl(urls, "/terms");
  addUrl(urls, "/cookies");
  addUrl(urls, "/disclosure");

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
  addUrl(urls, "/destinations/europe");

  if (Array.isArray(destinationsModule.destinations)) {
    destinationsModule.destinations.forEach((destination) => {
      addUrl(urls, destination.href);
    });
  }

  if (Array.isArray(destinationsModule.states)) {
    destinationsModule.states.forEach((state) => {
      addUrl(urls, `/destinations/${state.slug}`);
      addUrl(urls, `/destinations/states/${state.slug}`);
      addUrl(urls, `/destinations/states/${state.slug}/tours`);

      if (Array.isArray(state.cities)) {
        state.cities.forEach((city) => {
          addUrl(urls, `/destinations/states/${state.slug}/cities/${city.slug}`);
          addUrl(
            urls,
            `/destinations/states/${state.slug}/cities/${city.slug}/tours`,
          );
        });
      }
    });
  }

  tours.forEach((tour) => {
    if (!tour?.destination?.stateSlug || !tour?.destination?.citySlug) {
      return;
    }
    addUrl(
      urls,
      `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`,
    );
  });

  if (Array.isArray(flagstaffModule.flagstaffTours)) {
    flagstaffModule.flagstaffTours.forEach((tour) => {
      addUrl(urls, flagstaffModule.getFlagstaffTourDetailPath(tour));
    });
  }

  const activityByState = new Map();

  tours.forEach((tour) => {
    if (!isUsStateTour(tour, stateSlugSet, catalogModule)) {
      return;
    }

    const stateSlug = tour.destination.stateSlug;
    if (!stateSlug) {
      return;
    }

    const activitySlugs = new Set(
      [...(tour.activitySlugs ?? []), tour.primaryCategory].filter(Boolean),
    );

    activitySlugs.forEach((slug) => {
      if (!activityByState.has(slug)) {
        activityByState.set(slug, new Set());
      }
      activityByState.get(slug).add(stateSlug);
    });
  });

  activityByState.forEach((stateSlugs, activitySlug) => {
    stateSlugs.forEach((stateSlug) => {
      addUrl(urls, `/tours/${activitySlug}/us/${stateSlug}`);
    });
  });

  const europeCountrySlugs = new Set(
    (catalogModule.EUROPE_COUNTRIES || []).map((country) =>
      catalogModule.slugify(country),
    ),
  );
  const europeCitiesByCountry = new Map();
  const worldCitiesByCountry = new Map();

  tours.forEach((tour) => {
    const countrySlug = getCountrySlugFromTour(tour, catalogModule);
    const citySlug = tour.destination.citySlug;
    if (!countrySlug || !citySlug) {
      return;
    }

    if (isUsStateTour(tour, stateSlugSet, catalogModule)) {
      return;
    }

    const map = europeCountrySlugs.has(countrySlug)
      ? europeCitiesByCountry
      : worldCitiesByCountry;

    if (!map.has(countrySlug)) {
      map.set(countrySlug, new Set());
    }
    map.get(countrySlug).add(citySlug);
  });

  europeCitiesByCountry.forEach((cities, countrySlug) => {
    addUrl(urls, `/destinations/europe/${countrySlug}`);
    addUrl(urls, `/destinations/europe/${countrySlug}/tours`);

    cities.forEach((citySlug) => {
      addUrl(urls, `/destinations/europe/${countrySlug}/cities/${citySlug}`);
      addUrl(
        urls,
        `/destinations/europe/${countrySlug}/cities/${citySlug}/tours`,
      );
    });
  });

  worldCitiesByCountry.forEach((cities, countrySlug) => {
    addUrl(urls, `/destinations/world/${countrySlug}`);

    cities.forEach((citySlug) => {
      addUrl(urls, `/destinations/world/${countrySlug}/cities/${citySlug}`);
      addUrl(
        urls,
        `/destinations/world/${countrySlug}/cities/${citySlug}/tours`,
      );
    });
  });

  const guideStates = new Map();
  const guideCountries = new Map();

  tours.forEach((tour) => {
    const citySlug = tour.destination.citySlug;
    if (!citySlug) {
      return;
    }

    if (isUsStateTour(tour, stateSlugSet, catalogModule)) {
      const stateSlug = tour.destination.stateSlug;
      if (!stateSlug) {
        return;
      }
      if (!guideStates.has(stateSlug)) {
        guideStates.set(stateSlug, new Set());
      }
      guideStates.get(stateSlug).add(citySlug);
      return;
    }

    const countrySlug = getCountrySlugFromTour(tour, catalogModule);
    if (!countrySlug) {
      return;
    }
    if (!guideCountries.has(countrySlug)) {
      guideCountries.set(countrySlug, new Set());
    }
    guideCountries.get(countrySlug).add(citySlug);
  });

  guideStates.forEach((cities, stateSlug) => {
    addUrl(urls, `/guides/us/${stateSlug}`);
    cities.forEach((citySlug) => {
      addUrl(urls, `/guides/us/${stateSlug}/${citySlug}`);
    });
  });

  guideCountries.forEach((cities, countrySlug) => {
    addUrl(urls, `/guides/world/${countrySlug}`);
    cities.forEach((citySlug) => {
      addUrl(urls, `/guides/world/${countrySlug}/${citySlug}`);
    });
  });

  const sortedUrls = Array.from(urls).sort((a, b) => a.localeCompare(b));

  return {
    urls: sortedUrls,
  };
};

const run = async () => {
  const { urls } = await buildSitemap();
  const outputDir = path.resolve(__dirname, "../public");
  const sitemapIndexPath = path.join(outputDir, "sitemap.xml");

  await mkdir(outputDir, { recursive: true });

  const existingFiles = await readdir(outputDir);
  await Promise.all(
    existingFiles
      .filter((file) => file.startsWith("sitemap-") && file.endsWith(".xml"))
      .map((file) => unlink(path.join(outputDir, file))),
  );

  if (urls.length <= MAX_URLS_PER_SITEMAP) {
    const xml = buildUrlsetXml(urls);
    await writeFile(sitemapIndexPath, xml, "utf8");
  } else {
    const chunks = [];
    for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
      chunks.push(urls.slice(i, i + MAX_URLS_PER_SITEMAP));
    }

    const sitemapFiles = await Promise.all(
      chunks.map(async (chunk, index) => {
        const filename = `sitemap-${index + 1}.xml`;
        const filepath = path.join(outputDir, filename);
        await writeFile(filepath, buildUrlsetXml(chunk), "utf8");
        return `${BASE_URL}/${filename}`;
      }),
    );

    await writeFile(sitemapIndexPath, buildSitemapIndexXml(sitemapFiles), "utf8");
  }

  const sample = urls.slice(0, 5).join(", ");
  console.log(`Sitemap URLs: ${urls.length}`);
  console.log(`Sitemap samples: ${sample}`);
};

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Sitemap generation failed: ${message}`);
  process.exit(1);
}
