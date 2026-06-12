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
const MIN_TOUR_URL_COUNT = 50;

const CLASS_A_SITEMAP_ONLY_ACTIVITY_PATHS = new Set([
  "/tours/activities/day-adventures",
  "/tours/activities/detours",
  "/tours/activities/multi-day",
]);

const CATEGORY_SITEMAP_PATH = path.resolve(
  __dirname,
  "../public/sitemap-categories.xml"
);
const CATEGORY_SITEMAP_PRE_CANONICALIZATION_URL_COUNT = 616;

const parseSitemapLocPaths = contents =>
  [...contents.matchAll(/<loc>https?:\/\/[^/]+([^<]+)<\/loc>/g)].map(
    match => match[1]
  );

const loadExistingCategorySitemapEligibility = async () => {
  try {
    const contents = await readFile(CATEGORY_SITEMAP_PATH, "utf8");
    return new Set(parseSitemapLocPaths(contents));
  } catch (error) {
    console.warn(
      `[sitemap] unable to load existing category sitemap eligibility from ${CATEGORY_SITEMAP_PATH}; activity category URLs will not be allowlist-pruned.`,
      error?.message || error
    );
    return null;
  }
};

const applyExistingCategorySitemapEligibility = (categoryUrls, eligibility) => {
  if (!eligibility?.size) {
    return;
  }

  [...categoryUrls].forEach(url => {
    if (!eligibility.has(url)) {
      categoryUrls.delete(url);
    }
  });

  if (categoryUrls.size > CATEGORY_SITEMAP_PRE_CANONICALIZATION_URL_COUNT) {
    throw new Error(
      `sitemap-categories.xml must not expand while canonicalizing activity taxonomy routes (found ${categoryUrls.size}; limit ${CATEGORY_SITEMAP_PRE_CANONICALIZATION_URL_COUNT})`
    );
  }
};

export const CONFIRMED_EMPTY_ACTIVITY_CATEGORY_PATHS = new Set([
  "/tours/air-tours/switzerland",
  "/tours/hiking/nevada",
  "/tours/sailing/france",
  "/tours/sailing/louisiana",
  "/tours/sailing/minnesota",
  "/tours/sailing/new-york",
  "/tours/sailing/pennsylvania",
  "/tours/sailing/switzerland",
  "/tours/sightseeing-city-tours/mississippi",
  "/tours/sightseeing-city-tours/netherlands",
  "/tours/stargazing/nevada",
  "/tours/water-sports/switzerland",
  "/tours/wildlife/nevada",
  "/tours/air-tours/alaska/seward",
  "/tours/air-tours/switzerland/zurich",
  "/tours/cycling/minnesota/cannon-falls",
  "/tours/food-wine/california/ensenada",
  "/tours/food-wine/california/los-angeles",
  "/tours/food-wine/mexico/puerto-vallarta",
  "/tours/food-wine/minnesota/grant",
  "/tours/food-wine/ontario/windsor",
  "/tours/food-wine/spain/barcelona",
  "/tours/food-wine/spain/viladellops",
  "/tours/hiking/alaska/moose-pass",
  "/tours/hiking/california/san-francisco",
  "/tours/hiking/hawaii/hawaii",
  "/tours/hiking/hawaii/kapa-a",
  "/tours/hiking/hawaii/waianae",
  "/tours/hiking/minnesota/bloomington",
  "/tours/hiking/nevada/las-vegas",
  "/tours/paddle-sports/alaska/ketchikan",
  "/tours/paddle-sports/alberta/grande-cache",
  "/tours/paddle-sports/florida/melbourne-beach",
  "/tours/paddle-sports/florida/parrish",
  "/tours/paddle-sports/florida/tierra-verde",
  "/tours/paddle-sports/hawaii/captain-cook",
  "/tours/paddle-sports/hawaii/lahaina",
  "/tours/paddle-sports/hawaii/waimea",
  "/tours/paddle-sports/minnesota/minneapolis",
  "/tours/paddle-sports/minnesota/taylors-falls",
  "/tours/paddle-sports/north-carolina/kure-beach",
  "/tours/sailing/california/san-francisco",
  "/tours/sailing/florida/fort-lauderdale",
  "/tours/sailing/france/paris",
  "/tours/sailing/hawaii/haleiwa",
  "/tours/sailing/hawaii/kailua",
  "/tours/sailing/hawaii/kailua-kona",
  "/tours/sailing/hawaii/kapolei",
  "/tours/sailing/hawaii/kekaha",
  "/tours/sailing/hawaii/lahaina",
  "/tours/sailing/hawaii/waianae",
  "/tours/sailing/louisiana/new-orleans",
  "/tours/sailing/mexico/cabo-san-lucas",
  "/tours/sailing/mexico/cancun",
  "/tours/sailing/minnesota/lake-city",
  "/tours/sailing/new-york/new-york",
  "/tours/sailing/pennsylvania/allison-park",
  "/tours/sailing/switzerland/lucerne",
  "/tours/sightseeing-city-tours/british-columbia/vancouver",
  "/tours/sightseeing-city-tours/california/palm-springs",
  "/tours/sightseeing-city-tours/mississippi/bay-saint-louis",
  "/tours/sightseeing-city-tours/netherlands/amsterdam",
  "/tours/sightseeing-city-tours/spain/san-sebastian",
  "/tours/stargazing/nevada/las-vegas",
  "/tours/water-sports/switzerland/zurich",
  "/tours/wildlife/alberta/calgary",
  "/tours/wildlife/hawaii/kahului",
  "/tours/wildlife/hawaii/kapolei",
  "/tours/wildlife/minnesota/brainerd",
  "/tours/wildlife/nevada/las-vegas",
]);

const EXCLUDED_PRODUCT_CODES = ["36001P1", "301378", "301379"];
const EXCLUDED_TOUR_PATH_TOKENS = [
  ...EXCLUDED_PRODUCT_CODES.map(code => code.toLowerCase()),
  "yosemite-in-a-day-tour-from-san-francisco",
  "intermediate-singletrack-mountain-biking-clinic-301378",
  "private-mtb-lesson-301379",
  "/destinations/california/palm-springs/tours/joshua-tree-national-park-tour-34897",
  "/destinations/california/palm-springs/tours/joshua-tree-national-park-tour-34897/book",
  "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849/book",
  "/destinations/california/palm-springs/tours/shared-indian-canyons-hiking-tour-by-jeep-574370",
];
const LEGACY_SOFT_404_TOUR_PATH_PATTERNS = [
  /\/tours\/[^/]+\/[^/]+\/[^/]*-legacy-[^/]*-\d+\/?$/i,
  /\/destinations\/[^/]+\/[^/]+\/tours\/[^/]*-legacy-[^/]*-\d+\/?$/i,
];
const excludedUrlStats = {
  tokenMatches: 0,
  legacySoft404Matches: 0,
  bookingMatches: 0,
};

const ensurePath = value => {
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

  const normalizedLower = normalized.toLowerCase();
  if (/\/book\/?$/i.test(normalized)) {
    excludedUrlStats.bookingMatches += 1;
    return;
  }

  if (CONFIRMED_EMPTY_ACTIVITY_CATEGORY_PATHS.has(normalized)) {
    return;
  }

  if (
    EXCLUDED_TOUR_PATH_TOKENS.some(token => normalizedLower.includes(token))
  ) {
    excludedUrlStats.tokenMatches += 1;
    return;
  }

  if (
    LEGACY_SOFT_404_TOUR_PATH_PATTERNS.some(pattern => pattern.test(normalized))
  ) {
    excludedUrlStats.legacySoft404Matches += 1;
    return;
  }

  set.add(normalized);
};

const getNonCountryUsTourEquivalent = value => {
  const normalized = ensurePath(value);
  const match = normalized?.match?.(
    /^\/destinations\/united-states\/([^/]+)\/([^/]+)\/tours\/([^/]+)\/?$/
  );

  if (!match) {
    return null;
  }

  const [, stateSlug, citySlug, tourSlug] = match;
  return `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`;
};

const suppressDuplicateUsCountryQualifiedTourUrls = toursUrls => {
  [...toursUrls].forEach(tourUrl => {
    const nonCountryEquivalent = getNonCountryUsTourEquivalent(tourUrl);
    if (nonCountryEquivalent && toursUrls.has(nonCountryEquivalent)) {
      toursUrls.delete(tourUrl);
    }
  });
};

const safeSlugify = (catalogModule, value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const slug = catalogModule.slugify(trimmed);
  return slug || null;
};

const getTourIdentifier = (tour, fallback = "unknown") =>
  tour?.sourceItemId ||
  tour?.tour_id ||
  tour?.item_id ||
  tour?.id ||
  tour?.slug ||
  fallback;

let destinationAliasesModulePromise = null;
const getDestinationAliasesModule = () => {
  destinationAliasesModulePromise ??= tsImport(
    "../src/data/destinationAliases.ts",
    import.meta.url
  );
  return destinationAliasesModulePromise;
};

const canonicalizeKnownDestinationPath = (pathname, aliasesModule) =>
  aliasesModule?.canonicalizeDestinationPath?.(pathname) ?? pathname;

const buildCanonicalTourPath = (tour, catalogModule, aliasesModule) => {
  const canonicalPath = ensurePath(
    tour?.seo?.canonicalPath ||
      tour?.canonicalPath ||
      tour?.path ||
      tour?.href ||
      tour?.url
  );
  if (canonicalPath && canonicalPath !== "/") {
    const legacyMatch = canonicalPath.match(
      /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)\/?$/
    );
    if (legacyMatch) {
      const [, stateSlug, citySlug, slug] = legacyMatch;
      return canonicalizeKnownDestinationPath(
        `/destinations/${stateSlug}/${citySlug}/tours/${slug}`,
        aliasesModule
      );
    }
    return canonicalizeKnownDestinationPath(canonicalPath, aliasesModule);
  }

  const destination = tour?.destination ?? {};
  if (destination.stateSlug && destination.citySlug && tour?.slug) {
    return canonicalizeKnownDestinationPath(
      `/destinations/${destination.stateSlug}/${destination.citySlug}/tours/${tour.slug}`,
      aliasesModule
    );
  }

  const slug =
    safeSlugify(catalogModule, tour?.slug) ||
    safeSlugify(catalogModule, tour?.title);
  if (!slug) {
    return null;
  }

  const city =
    destination.citySlug || destination.city || tour?.city || tour?.location;
  const citySlug = safeSlugify(catalogModule, city);

  const state =
    destination.stateSlug ||
    destination.state ||
    tour?.stateSlug ||
    tour?.state ||
    tour?.country;
  const stateSlug = safeSlugify(catalogModule, state);

  if (!stateSlug || !citySlug) {
    return null;
  }

  return canonicalizeKnownDestinationPath(
    `/destinations/${stateSlug}/${citySlug}/tours/${slug}`,
    aliasesModule
  );
};

const listUsGuideCitiesByState = async retiredGuidePolicy => {
  const guidesRoot = path.join(__dirname, "..", "src", "data", "guides", "us");
  const stateEntries = await readdir(guidesRoot, { withFileTypes: true });
  const guidesByState = new Map();

  await Promise.all(
    stateEntries
      .filter(entry => entry.isDirectory())
      .map(async stateEntry => {
        const stateSlug = stateEntry.name;
        const stateDir = path.join(guidesRoot, stateSlug);
        const cityEntries = await readdir(stateDir, { withFileTypes: true });
        const citySlugs = cityEntries
          .filter(entry => entry.isFile() && entry.name.endsWith(".json"))
          .map(entry => entry.name.replace(/\.json$/, ""))
          .filter(
            citySlug =>
              citySlug !== "index" &&
              !retiredGuidePolicy.isRetiredLowInventoryGuide(
                stateSlug,
                citySlug
              )
          );

        guidesByState.set(stateSlug, new Set(citySlugs));
      })
  );

  return guidesByState;
};

const escapeXml = value =>
  value.replace(/[<>&'"]/g, char => {
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

const buildUrlsetXml = entries => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  const urlsetOpen =
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = "</urlset>\n";
  const urlEntries = entries
    .map(entry => {
      const segments = [`<loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) {
        segments.push(`<lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      if (entry.priority !== undefined) {
        segments.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `  <url>${segments.join("")}</url>`;
    })
    .join("\n");

  return `${xml}${urlsetOpen}${urlEntries}\n${urlsetClose}`;
};

const buildSitemapIndexXml = entries => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  const sitemapOpen =
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapClose = "</sitemapindex>\n";
  const sitemapEntries = entries
    .map(entry => `  <sitemap><loc>${escapeXml(entry)}</loc></sitemap>`)
    .join("\n");

  return `${xml}${sitemapOpen}${sitemapEntries}\n${sitemapClose}`;
};

const getStateSlugSet = catalogModule =>
  new Set(
    (catalogModule.US_STATES || []).map(state => catalogModule.slugify(state))
  );

const parseCsvRows = text => {
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

const parseCsv = contents => {
  const rows = parseCsvRows(contents);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map(header => header.trim());

  return rows.slice(1).map(row => {
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

const US_COUNTRY_ALIAS_SLUGS = new Set([
  "united-states",
  "us",
  "usa",
]);

const isUsCountryAliasSlug = countrySlug =>
  Boolean(countrySlug && US_COUNTRY_ALIAS_SLUGS.has(countrySlug));

const REMOVED_TOUR_IDS = new Set([
  "34849",
  "34897",
  "43915",
  "34899",
  "34891",
  "574370",
]);
const REMOVED_OPERATOR_NAMES = new Set([
  "desert adventures red jeep tours",
  "red jeep tours",
  "red jeep company",
]);
const REMOVED_OPERATOR_SHORTNAMES = new Set(["red-jeep"]);

const getTourIdFromSlug = slug => {
  const match = slug?.match?.(/-(\d+)$/);
  return match?.[1] ?? null;
};

const isRemovedTour = tour => {
  const tourId = tour.id?.toString?.() ?? getTourIdFromSlug(tour.slug ?? "");
  if (tourId && REMOVED_TOUR_IDS.has(tourId)) {
    return true;
  }

  const operatorName = tour.operator?.trim?.().toLowerCase?.();
  if (operatorName && REMOVED_OPERATOR_NAMES.has(operatorName)) {
    return true;
  }

  const shortName = tour.companyShortname?.trim?.().toLowerCase?.();
  return Boolean(shortName && REMOVED_OPERATOR_SHORTNAMES.has(shortName));
};

const buildTourSummaries = async catalogModule => {
  const toursDataModule = await tsImport(
    "../src/data/tours.ts",
    import.meta.url
  );

  const tours = [];

  if (Array.isArray(toursDataModule.tours)) {
    toursDataModule.tours
      .filter(tour => tour?.engine !== "engine6")
      .forEach(tour => tours.push(tour));
  }

  // Sitemap tour detail URLs must come from route-backed registries only.
  // Raw regional CSV fallbacks previously emitted product slugs that the SPA could
  // not resolve, causing soft "Tour not found" detail pages and orphan city routes.

  return tours.filter(tour => !isRemovedTour(tour));
};

const parseUsStateFallbackRows = (rows, catalogModule, defaults = {}) =>
  rows
    .map((row, index) => {
      const location = row.location?.trim() || "";
      const parts = location
        .split("/")
        .map(part => part.trim())
        .filter(Boolean);
      const country = (
        defaults.country ||
        row.country ||
        row.country_name ||
        parts[0] ||
        ""
      ).trim();
      const stateSlug = (
        defaults.stateSlug ||
        row.stateSlug ||
        row.state ||
        parts[1] ||
        ""
      ).trim();
      const city = (defaults.city || row.city || parts[2] || "").trim();
      const citySlug =
        typeof defaults.citySlug === "function"
          ? defaults.citySlug(row, catalogModule)
          : defaults.citySlug || catalogModule.slugify(city);
      const title = (row.title || row.name || row.item_name || "").trim();
      const id = (
        row.id ||
        row.tour_id ||
        row.item_id ||
        row.sourceItemId ||
        ""
      ).trim();

      if (!country || !stateSlug || !citySlug || !title || !id) {
        console.warn(
          `[sitemap] skipped US fallback row ${index + 2}: missing country/state/city/title/id`
        );
        return null;
      }

      const normalizedCountry = country.toLowerCase();
      if (
        !normalizedCountry.includes("united states") &&
        normalizedCountry !== "us" &&
        normalizedCountry !== "usa"
      ) {
        return null;
      }

      const normalizedStateSlug = catalogModule.slugify(stateSlug);

      return {
        seo: {
          canonicalPath: `/destinations/united-states/${normalizedStateSlug}/${citySlug}/tours/${catalogModule.slugify(title)}-${id}`,
        },
      };
    })
    .filter(Boolean);

const buildHawaiiSitemapFallbackTours = async catalogModule => {
  const hawaiiPath = path.resolve(__dirname, "../data/hawaii.csv");
  const hawaiiContents = await readFile(hawaiiPath, "utf8");
  const hawaiiRows = parseCsv(hawaiiContents);

  return parseUsStateFallbackRows(hawaiiRows, catalogModule, {
    country: "United States",
    stateSlug: "hawaii",
    citySlug: (row, module) => {
      const rawCity = (row.city || row.location_city || "").trim();
      if (rawCity) {
        return module.slugify(rawCity);
      }

      const location = (row.location || "").trim();
      const parts = location
        .split("/")
        .map(part => part.trim())
        .filter(Boolean);
      const cityFromLocation = parts[2] || parts[parts.length - 1] || "Hawaii";
      const normalized = module.slugify(cityFromLocation);
      return normalized || "hawaii";
    },
  });
};

const parseMexicoFallbackRows = (rows, catalogModule, defaults = {}) =>
  rows
    .map((row, index) => {
      const location = row.location?.trim() || "";
      const parts = location
        .split("/")
        .map(part => part.trim())
        .filter(Boolean);
      const country = (
        defaults.country ||
        row.country ||
        row.country_name ||
        parts[0] ||
        ""
      ).trim();
      const city = (defaults.city || row.city || parts[2] || "").trim();
      const citySlug =
        typeof defaults.citySlug === "function"
          ? defaults.citySlug(row, catalogModule)
          : defaults.citySlug || catalogModule.slugify(city);
      const title = (row.title || row.name || row.item_name || "").trim();
      const id = (
        row.id ||
        row.tour_id ||
        row.item_id ||
        row.sourceItemId ||
        ""
      ).trim();

      if (!country || !citySlug || !title || !id) {
        console.warn(
          `[sitemap] skipped Mexico fallback row ${index + 2}: missing country/citySlug/title/id`
        );
        return null;
      }

      const normalizedCountry = country.toLowerCase();
      if (
        normalizedCountry.includes("united states") ||
        normalizedCountry === "us" ||
        normalizedCountry === "usa"
      ) {
        return null;
      }

      return {
        seo: {
          canonicalPath: `/destinations/mexico/${citySlug}/tours/${catalogModule.slugify(title)}-${id}`,
        },
      };
    })
    .filter(Boolean);

const buildMexicoSitemapFallbackTours = async catalogModule => {
  const mexicoPath = path.resolve(__dirname, "../data/mexico.csv");
  const cancunPath = path.resolve(__dirname, "../data/cancun.csv");
  const puertoVallartaPath = path.resolve(
    __dirname,
    "../data/Puerto Vallarta.csv"
  );
  const caboPath = path.resolve(__dirname, "../data/cabo.csv");

  const [mexicoContents, cancunContents, puertoVallartaContents, caboContents] =
    await Promise.all([
      readFile(mexicoPath, "utf8"),
      readFile(cancunPath, "utf8"),
      readFile(puertoVallartaPath, "utf8"),
      readFile(caboPath, "utf8"),
    ]);

  const mexicoRows = parseCsv(mexicoContents);
  const cancunRows = parseCsv(cancunContents);
  const puertoVallartaRows = parseCsv(puertoVallartaContents);
  const caboRows = parseCsv(caboContents);

  const resolveCaboCitySlug = row => {
    const source =
      `${row.city || ""} ${row.destination_city || ""} ${row.location || ""}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (
      source.includes("san jose del cabo") ||
      source.includes("san jose cabo")
    ) {
      return "san-jose-del-cabo";
    }

    return "cabo-san-lucas";
  };

  return [
    ...parseMexicoFallbackRows(mexicoRows, catalogModule),
    ...parseMexicoFallbackRows(cancunRows, catalogModule, {
      country: "Mexico",
      city: "Cancun",
      citySlug: "cancun",
    }),
    ...parseMexicoFallbackRows(puertoVallartaRows, catalogModule, {
      country: "Mexico",
      city: "Puerto Vallarta",
      citySlug: "puerto-vallarta",
    }),
    ...parseMexicoFallbackRows(caboRows, catalogModule, {
      country: "Mexico",
      city: "Cabo San Lucas",
      citySlug: resolveCaboCitySlug,
    }),
  ];
};

const buildAmsterdamSitemapFallbackTours = async catalogModule => {
  const amsterdamPath = path.resolve(__dirname, "../data/amsterdam.csv");
  const amsterdamContents = await readFile(amsterdamPath, "utf8");
  const amsterdamRows = parseCsv(amsterdamContents);

  return amsterdamRows
    .map((row, index) => {
      const title = (row.item_name || row.title || row.name || "").trim();
      const id = (row.item_id || row.sourceItemId || row.id || "").trim();

      if (!title || !id) {
        console.warn(
          `[sitemap] skipped Amsterdam fallback row ${index + 2}: missing title/id`
        );
        return null;
      }

      return {
        seo: {
          canonicalPath: `/destinations/netherlands/amsterdam/tours/${catalogModule.slugify(title)}-${id}`,
        },
      };
    })
    .filter(Boolean);
};

export const buildSitemap = async () => {
  const destinationsModule = await tsImport(
    "../src/data/destinations.ts",
    import.meta.url
  );
  const destinationAliasesModule = await getDestinationAliasesModule();
  const catalogModule = await tsImport(
    "../src/data/tourCatalog.ts",
    import.meta.url
  );
  const activityDiscoveryModule = await tsImport(
    "../src/data/activityDiscovery.ts",
    import.meta.url
  );
  const flagstaffModule = await tsImport(
    "../src/data/flagstaffTours.ts",
    import.meta.url
  );
  const retiredGuidePolicy = await tsImport(
    "../src/utils/guides/retiredLowInventoryGuides.ts",
    import.meta.url
  );
  const tours = await buildTourSummaries(catalogModule);
  let engine2Tours = [];
  try {
    const engine2Module = await tsImport(
      "../src/engine2/data/loadEngine2.ts",
      import.meta.url
    );
    engine2Tours = Array.isArray(engine2Module.getAllEngine2Tours?.())
      ? engine2Module.getAllEngine2Tours()
      : [];
  } catch (error) {
    console.warn(
      "Unable to import Engine2 tours for sitemap; continuing with fallback parsing.",
      error?.message || error
    );
  }

  let engine6Tours = [];
  try {
    const engine6Module = await tsImport(
      "../src/engine6/registry.ts",
      import.meta.url
    );
    engine6Tours = Array.isArray(engine6Module.engine6ResolvedTours)
      ? engine6Module.engine6ResolvedTours
      : [];
  } catch (error) {
    console.warn(
      "Unable to import Engine6 tours for sitemap; continuing without Engine6 sitemap entries.",
      error?.message || error
    );
  }

  let engine4ListingEntries = [];
  try {
    const engine4ListingModule = await tsImport(
      "../src/engine4/listing/getEngine4ListingEntries.ts",
      import.meta.url
    );
    const allEngine4ListingEntries =
      engine4ListingModule.getAllEngine4ListingEntries?.();
    engine4ListingEntries = Array.isArray(allEngine4ListingEntries)
      ? allEngine4ListingEntries
      : [];
  } catch (error) {
    console.warn(
      "Unable to import Engine4 listing tours for sitemap; continuing without Engine4 sitemap entries.",
      error?.message || error
    );
  }

  const pages = new Set();
  const toursUrls = new Set();
  const cityUrls = new Set();
  const guideUrls = new Set();
  const destinationUrls = new Set();
  const categoryUrls = new Set();
  const stateSlugSet = getStateSlugSet(catalogModule);

  addUrl(pages, "/");
  addUrl(pages, "/faqs");
  addUrl(pages, "/activities");
  addUrl(pages, "/journeys");
  addUrl(pages, "/about");
  addUrl(pages, "/contact");
  addUrl(pages, "/privacy");
  addUrl(pages, "/terms");
  addUrl(pages, "/cookies");
  addUrl(pages, "/disclosure");

  addUrl(categoryUrls, "/tours");
  addUrl(categoryUrls, "/tours/catalog");
  addUrl(categoryUrls, "/tours/day");
  addUrl(categoryUrls, "/tours/day/cycling");
  addUrl(categoryUrls, "/tours/day/hiking");
  addUrl(categoryUrls, "/tours/day/paddle");
  addUrl(categoryUrls, "/tours/multi-day");
  // Activity discovery pages are added below only when backed by activityCategories inventory.

  addUrl(guideUrls, "/guides");

  if (Array.isArray(catalogModule.ACTIVITY_PAGES)) {
    catalogModule.ACTIVITY_PAGES.forEach(activity => {
      const activityPath = `/tours/activities/${activity.slug}`;
      if (!CLASS_A_SITEMAP_ONLY_ACTIVITY_PATHS.has(activityPath)) {
        addUrl(categoryUrls, activityPath);
      }
    });
  }

  if (Array.isArray(catalogModule.ADVENTURE_ACTIVITY_PAGES)) {
    catalogModule.ADVENTURE_ACTIVITY_PAGES.forEach(activity => {
      addUrl(categoryUrls, `/tours/activities/${activity.slug}`);
    });
  }

  if (Array.isArray(activityDiscoveryModule.ACTIVITY_DISCOVERY_PAGES)) {
    activityDiscoveryModule.ACTIVITY_DISCOVERY_PAGES.forEach(activity => {
      const activityTours =
        activityDiscoveryModule.getToursByActivityCategory?.(activity.slug);
      if (Array.isArray(activityTours) && activityTours.length > 0) {
        addUrl(categoryUrls, `/tours/${activity.slug}`);
      }
    });
  }

  addUrl(destinationUrls, "/destinations");
  addUrl(destinationUrls, "/destinations/europe");

  if (Array.isArray(destinationsModule.destinations)) {
    destinationsModule.destinations.forEach(destination => {
      addUrl(destinationUrls, destination.href);
    });
  }

  if (Array.isArray(destinationsModule.states)) {
    destinationsModule.states.forEach(state => {
      addUrl(destinationUrls, `/destinations/${state.slug}`);

      if (Array.isArray(state.cities)) {
        state.cities.forEach(city => {
          if (
            !retiredGuidePolicy.isRetiredLowInventoryGuide(
              state.slug,
              city.slug
            )
          ) {
            addUrl(cityUrls, `/guides/us/${state.slug}/${city.slug}`);
          }
          addUrl(cityUrls, `/destinations/${state.slug}/${city.slug}/tours`);
        });
      }
    });
  }

  tours.forEach(tour => {
    const tourPath = buildCanonicalTourPath(
      tour,
      catalogModule,
      destinationAliasesModule
    );
    if (!tourPath) {
      console.warn(
        `Skipping tour sitemap URL (missing route fields): ${getTourIdentifier(tour)}`
      );
      return;
    }
    addUrl(toursUrls, tourPath);
  });

  engine2Tours.forEach(tour => {
    const tourPath = buildCanonicalTourPath(
      tour,
      catalogModule,
      destinationAliasesModule
    );
    if (!tourPath) {
      console.warn(
        `Skipping Engine2 tour sitemap URL (missing route fields): ${getTourIdentifier(tour)}`
      );
      return;
    }
    addUrl(toursUrls, tourPath);
  });

  engine4ListingEntries.forEach(entry => {
    const tourPath = ensurePath(entry.href);
    if (!tourPath) {
      console.warn(
        `Skipping Engine4 tour sitemap URL (missing route fields): ${getTourIdentifier(entry.tour, entry.tour?.productCode ?? "unknown")}`
      );
      return;
    }
    addUrl(toursUrls, tourPath);
  });

  engine6Tours.forEach(tour => {
    const tourPath = buildCanonicalTourPath(
      tour,
      catalogModule,
      destinationAliasesModule
    );
    if (!tourPath) {
      console.warn(
        `Skipping Engine6 tour sitemap URL (missing route fields): ${getTourIdentifier(tour, tour?.productCode ?? "unknown")}`
      );
      return;
    }
    addUrl(toursUrls, tourPath);
  });

  if (!engine2Tours.length) {
    const [mexicoFallbackTours, hawaiiFallbackTours, amsterdamFallbackTours] =
      await Promise.all([
        buildMexicoSitemapFallbackTours(catalogModule),
        buildHawaiiSitemapFallbackTours(catalogModule),
        buildAmsterdamSitemapFallbackTours(catalogModule),
      ]);
    [
      ...mexicoFallbackTours,
      ...hawaiiFallbackTours,
      ...amsterdamFallbackTours,
    ].forEach(tour => {
      const tourPath = buildCanonicalTourPath(
        tour,
        catalogModule,
        destinationAliasesModule
      );
      if (tourPath) addUrl(toursUrls, tourPath);
    });
  }
  if (Array.isArray(flagstaffModule.flagstaffTours)) {
    flagstaffModule.flagstaffTours.forEach(tour => {
      const legacyPath = ensurePath(
        flagstaffModule.getFlagstaffTourDetailPath(tour)
      );
      const canonicalPath = buildCanonicalTourPath(
        tour,
        catalogModule,
        destinationAliasesModule
      );
      if (canonicalPath) {
        addUrl(toursUrls, canonicalPath);
        return;
      }
      if (legacyPath) {
        addUrl(toursUrls, legacyPath);
        return;
      }
      console.warn(
        `Skipping Flagstaff tour sitemap URL (missing route fields): ${getTourIdentifier(tour)}`
      );
    });
  }

  if (Array.isArray(activityDiscoveryModule.ACTIVITY_DISCOVERY_PAGES)) {
    activityDiscoveryModule.ACTIVITY_DISCOVERY_PAGES.forEach(activity => {
      const activityTours =
        activityDiscoveryModule.getToursByActivityCategory?.(activity.slug);
      if (!Array.isArray(activityTours) || activityTours.length === 0) {
        return;
      }

      const stateCityMap = new Map();
      activityTours.forEach(tour => {
        const { stateSlug, citySlug } =
          activityDiscoveryModule.getCanonicalActivityLocationSlugs?.(tour) ?? {
            stateSlug: tour.destination?.stateSlug,
            citySlug: tour.destination?.citySlug,
          };
        if (!stateSlug) return;
        if (!stateCityMap.has(stateSlug)) {
          stateCityMap.set(stateSlug, new Set());
        }
        if (citySlug) {
          stateCityMap.get(stateSlug).add(citySlug);
        }
      });

      stateCityMap.forEach((citySlugs, stateSlug) => {
        addUrl(categoryUrls, `/tours/${activity.slug}/${stateSlug}`);
        citySlugs.forEach(citySlug => {
          addUrl(
            categoryUrls,
            `/tours/${activity.slug}/${stateSlug}/${citySlug}`
          );
        });
      });
    });
  }

  const europeCountrySlugs = new Set(
    (catalogModule.EUROPE_COUNTRIES || []).map(country =>
      catalogModule.slugify(country)
    )
  );
  const europeCitiesByCountry = new Map();
  const worldCitiesByCountry = new Map();

  tours.forEach(tour => {
    const countrySlug = getCountrySlugFromTour(tour, catalogModule);
    const citySlug = destinationAliasesModule.getCanonicalDestinationCitySlug(
      countrySlug ?? tour.destination.stateSlug,
      tour.destination.citySlug
    );
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
    addUrl(destinationUrls, `/destinations/europe/${countrySlug}`);
    addUrl(destinationUrls, `/destinations/europe/${countrySlug}/tours`);

    cities.forEach(citySlug => {
      addUrl(
        cityUrls,
        `/destinations/europe/${countrySlug}/cities/${citySlug}`
      );
      addUrl(
        cityUrls,
        `/destinations/europe/${countrySlug}/cities/${citySlug}/tours`
      );
    });
  });

  worldCitiesByCountry.forEach((cities, countrySlug) => {
    addUrl(destinationUrls, `/destinations/world/${countrySlug}`);

    cities.forEach(citySlug => {
      addUrl(cityUrls, `/destinations/world/${countrySlug}/cities/${citySlug}`);
      addUrl(
        cityUrls,
        `/destinations/world/${countrySlug}/cities/${citySlug}/tours`
      );
    });
  });

  const guideStates = new Map();
  const guideCountries = new Map();
  const allowedUsGuideCities =
    await listUsGuideCitiesByState(retiredGuidePolicy);

  tours.forEach(tour => {
    const rawCitySlug = tour.destination.citySlug;
    const countrySlugForAlias = getCountrySlugFromTour(tour, catalogModule);
    const citySlug = destinationAliasesModule.getCanonicalDestinationCitySlug(
      countrySlugForAlias ?? tour.destination.stateSlug,
      rawCitySlug
    );
    if (!citySlug) {
      return;
    }

    if (isUsStateTour(tour, stateSlugSet, catalogModule)) {
      const stateSlug = tour.destination.stateSlug;
      if (!stateSlug) {
        return;
      }

      if (!allowedUsGuideCities.get(stateSlug)?.has(citySlug)) {
        return;
      }

      if (!guideStates.has(stateSlug)) {
        guideStates.set(stateSlug, new Set());
      }
      guideStates.get(stateSlug).add(citySlug);
      return;
    }

    const countrySlug = countrySlugForAlias;
    if (!countrySlug || isUsCountryAliasSlug(countrySlug)) {
      return;
    }
    if (!guideCountries.has(countrySlug)) {
      guideCountries.set(countrySlug, new Set());
    }
    guideCountries.get(countrySlug).add(citySlug);
  });

  guideStates.forEach((cities, stateSlug) => {
    addUrl(guideUrls, `/guides/us/${stateSlug}`);
    cities.forEach(citySlug => {
      addUrl(guideUrls, `/guides/us/${stateSlug}/${citySlug}`);
    });
  });

  guideCountries.forEach((cities, countrySlug) => {
    addUrl(guideUrls, `/guides/world/${countrySlug}`);
    cities.forEach(citySlug => {
      addUrl(guideUrls, `/guides/world/${countrySlug}/${citySlug}`);
    });
  });

  suppressDuplicateUsCountryQualifiedTourUrls(toursUrls);
  applyExistingCategorySitemapEligibility(
    categoryUrls,
    await loadExistingCategorySitemapEligibility()
  );

  return {
    pages,
    toursUrls,
    cityUrls,
    guideUrls,
    destinationUrls,
    categoryUrls,
  };
};

const run = async () => {
  const shouldWrite = process.env.SITEMAP_WRITE === "1";
  const {
    pages,
    toursUrls,
    cityUrls,
    guideUrls,
    destinationUrls,
    categoryUrls,
  } = await buildSitemap();
  const outputDir = path.resolve(__dirname, "../public");
  const sitemapIndexPath = path.join(outputDir, "sitemap.xml");

  if (shouldWrite) {
    await mkdir(outputDir, { recursive: true });

    const existingFiles = await readdir(outputDir);
    await Promise.all(
      existingFiles
        .filter(file => file.startsWith("sitemap-") && file.endsWith(".xml"))
        .map(file => unlink(path.join(outputDir, file)))
    );
  }

  const toEntries = (values, options = {}) =>
    Array.from(values)
      .sort((a, b) => a.localeCompare(b))
      .map(url => ({
        loc: `${BASE_URL}${url}`,
        lastmod: options.lastmod,
        priority: options.priority,
      }));

  const writeUrlsetFiles = async (slug, entries) => {
    if (!entries.length) {
      return [];
    }

    const chunks = [];
    for (let i = 0; i < entries.length; i += MAX_URLS_PER_SITEMAP) {
      chunks.push(entries.slice(i, i + MAX_URLS_PER_SITEMAP));
    }

    return Promise.all(
      chunks.map(async (chunk, index) => {
        const filename =
          chunks.length === 1
            ? `sitemap-${slug}.xml`
            : `sitemap-${slug}-${index + 1}.xml`;
        const filepath = path.join(outputDir, filename);
        if (shouldWrite) {
          await writeFile(filepath, buildUrlsetXml(chunk), "utf8");
        }
        return `${BASE_URL}/${filename}`;
      })
    );
  };

  const sections = [
    { slug: "pages", entries: toEntries(pages, { priority: 0.4 }) },
    { slug: "tours", entries: toEntries(toursUrls, { priority: 0.8 }) },
    { slug: "cities", entries: toEntries(cityUrls, { priority: 0.6 }) },
    { slug: "guides", entries: toEntries(guideUrls, { priority: 0.5 }) },
    {
      slug: "destinations",
      entries: toEntries(destinationUrls, { priority: 0.6 }),
    },
    { slug: "categories", entries: toEntries(categoryUrls, { priority: 0.5 }) },
  ];

  const sitemapFiles = [];
  for (const section of sections) {
    try {
      const files = await writeUrlsetFiles(section.slug, section.entries);
      sitemapFiles.push(...files);
      console.log(`Sitemap ${section.slug}: ${section.entries.length}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping sitemap section \"${section.slug}\": ${message}`);
    }
  }

  const sitemapIndexXml = buildSitemapIndexXml(sitemapFiles);
  if (shouldWrite) {
    await writeFile(sitemapIndexPath, sitemapIndexXml, "utf8");
  }

  if (sitemapIndexXml.includes("sitemap-booking.xml")) {
    throw new Error("sitemap.xml must not include sitemap-booking.xml");
  }

  const toursSection = sections.find(section => section.slug === "tours");
  const tourUrlCount = toursSection?.entries.length ?? 0;
  if (tourUrlCount < MIN_TOUR_URL_COUNT) {
    throw new Error(
      `sitemap-tours.xml must contain at least ${MIN_TOUR_URL_COUNT} tour URLs (found ${tourUrlCount})`
    );
  }

  const excludedPatternCount =
    EXCLUDED_TOUR_PATH_TOKENS.length +
    LEGACY_SOFT_404_TOUR_PATH_PATTERNS.length;
  const excludedUrlCount =
    excludedUrlStats.tokenMatches +
    excludedUrlStats.legacySoft404Matches +
    excludedUrlStats.bookingMatches;
  console.log(
    `[sitemap] excluded ${excludedUrlCount} URL emissions using ${excludedPatternCount} denylist patterns/tokens (${excludedUrlStats.tokenMatches} token matches, ${excludedUrlStats.legacySoft404Matches} legacy soft-404 matches, ${excludedUrlStats.bookingMatches} booking matches).`
  );

  if (!shouldWrite) {
    console.log("SITEMAP_WRITE is not set to 1; skipping XML file writes.");
  }
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMain) {
  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Sitemap generation failed: ${message}`);
    process.exit(1);
  }
}
