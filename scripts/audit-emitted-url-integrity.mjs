import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = process.cwd();
const SITE_URL = "https://www.alloutdooradventures.com";
const REPORT_JSON = path.join(repoRoot, "audit", "emitted-url-integrity.json");
const REPORT_MD = path.join(repoRoot, "audit", "emitted-url-integrity.md");

const quietImport = async relativePath => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  try {
    return await import(pathToFileURL(path.join(repoRoot, relativePath)).href);
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.info = originalInfo;
  }
};

const [
  sitemapModule,
  toursModule,
  destinationsModule,
  fallbackModule,
  activityDiscoveryModule,
  engine2Module,
  engine3Module,
  engine4Module,
  engine6RegistryModule,
  engine6RoutesModule,
  legacyEngine6Module,
  flagstaffModule,
  excludedProductCodesModule,
  removedToursModule,
  invalidPlaceholderToursModule,
  tourCatalogModule,
] = await Promise.all([
  quietImport("scripts/generate-sitemap.mjs"),
  quietImport("src/data/tours.ts"),
  quietImport("src/data/destinations.ts"),
  quietImport("src/data/tourFallbacks.ts"),
  quietImport("src/data/activityDiscovery.ts"),
  quietImport("src/engine2/data/loadEngine2.ts"),
  quietImport("src/engine3/routing.ts"),
  quietImport("src/engine4/routing.ts"),
  quietImport("src/engine6/registry.ts"),
  quietImport("src/engine6/routes.ts"),
  quietImport("src/engine6/legacyFh/registry.ts"),
  quietImport("src/data/flagstaffTours.ts"),
  quietImport("src/data/excludedProductCodes.ts"),
  quietImport("src/utils/tours/isTourRemoved.ts"),
  quietImport("src/utils/tours/invalidPlaceholderTours.ts"),
  quietImport("src/data/tourCatalog.ts"),
]);

console.log = () => {};
console.warn = () => {};
console.error = () => {};
console.info = () => {};

const emitted = new Map();
const addUrl = (value, origin) => {
  if (!value || typeof value !== "string") return;
  let url = value.trim();
  if (!url) return;
  if (url.startsWith(SITE_URL)) url = url.slice(SITE_URL.length) || "/";
  if (/^https?:\/\//i.test(url)) return;
  if (!url.startsWith("/")) return;
  url = url.replace(/[?#].*$/, "").replace(/\/$/, "") || "/";
  if (!emitted.has(url)) emitted.set(url, new Set());
  emitted.get(url).add(origin);
};

const addUrls = (urls, origin) => {
  for (const url of urls ?? []) addUrl(url, origin);
};

const readSitemapUrls = async fileName => {
  try {
    const xml = await readFile(path.join(repoRoot, "public", fileName), "utf8");
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  } catch {
    return [];
  }
};

for (const fileName of [
  "sitemap-tours.xml",
  "sitemap-cities.xml",
  "sitemap-destinations.xml",
  "sitemap-categories.xml",
]) {
  addUrls(await readSitemapUrls(fileName), `public/${fileName}`);
}

const originalBuildLog = console.log;
const originalBuildWarn = console.warn;
const originalBuildError = console.error;
const originalBuildInfo = console.info;
console.log = () => {};
console.warn = () => {};
console.error = () => {};
console.info = () => {};
let builtSitemap;
try {
  builtSitemap = await sitemapModule.buildSitemap();
} finally {
  console.log = originalBuildLog;
  console.warn = originalBuildWarn;
  console.error = originalBuildError;
  console.info = originalBuildInfo;
}
for (const [key, value] of Object.entries(builtSitemap)) {
  if (value && typeof value[Symbol.iterator] === "function") {
    addUrls([...value], `buildSitemap.${key}`);
  }
}

const allTours = toursModule.tours ?? [];
addUrls(
  allTours.map(tour => tour.seo?.canonicalPath).filter(Boolean),
  "src/data/tours.ts seo.canonicalPath"
);
for (const tour of allTours) {
  addUrl(
    toursModule.getCityTourDetailPath?.(tour),
    "getCityTourDetailPath(tour)"
  );
  addUrl(toursModule.getTourDetailPath?.(tour), "getTourDetailPath(tour)");
}

addUrls(
  engine2Module
    .getAllEngine2Tours?.()
    .map(tour => tour.seo?.canonicalPath)
    .filter(Boolean),
  "Engine2 seo.canonicalPath"
);

const activityDefinitions =
  activityDiscoveryModule.getActivityDiscoveryRouteDefinitions?.() ?? [];
const activityDefinitionPaths = new Set(
  activityDefinitions.map(route => route.path)
);
const isKnownActivitySlug = slug =>
  Boolean(activityDiscoveryModule.getActivityDiscoveryPage?.(slug)) ||
  Boolean(
    (tourCatalogModule.ADVENTURE_ACTIVITY_PAGES ?? []).some(
      activity => activity.slug === slug
    )
  );
addUrls(
  activityDefinitions.map(route => route.path),
  "getActivityDiscoveryRouteDefinitions()"
);

for (const state of destinationsModule.states ?? []) {
  addUrl(`/destinations/${state.slug}`, "src/data/destinations.ts states[]");
  addUrl(`/destinations/${state.slug}/tours`, "state tours helper");
  for (const city of state.cities ?? []) {
    addUrl(
      `/destinations/${state.slug}/${city.slug}`,
      "src/data/destinations.ts states[].cities[]"
    );
    addUrl(
      `/destinations/${state.slug}/${city.slug}/tours`,
      "city tours helper"
    );
  }
}

const cityToursCache = new Map();
const getCityTours = (stateSlug, citySlug) => {
  const key = `${stateSlug}/${citySlug}`;
  if (!cityToursCache.has(key)) {
    const entries = toursModule.getToursByCityUnified
      ? toursModule
          .getToursByCityUnified(stateSlug, citySlug)
          .map(entry => entry.tour)
      : (toursModule.getToursByCity?.(stateSlug, citySlug) ?? []);
    cityToursCache.set(key, entries);
  }
  return cityToursCache.get(key);
};

const stateToursCache = new Map();
const getStateTourCount = stateSlug => {
  if (!stateToursCache.has(stateSlug)) {
    stateToursCache.set(
      stateSlug,
      toursModule.getToursByState?.(stateSlug)?.length ?? 0
    );
  }
  return stateToursCache.get(stateSlug);
};

const activityEntryCache = new Map();
const getActivityEntryCount = ({ activitySlug, stateSlug, citySlug }) => {
  const key = `${activitySlug}/${stateSlug ?? ""}/${citySlug ?? ""}`;
  if (!activityEntryCache.has(key)) {
    const entries =
      activityDiscoveryModule.getActivityTourEntriesByLocation?.({
        activitySlug,
        stateSlug,
        citySlug,
      }) ?? [];
    activityEntryCache.set(key, entries.length);
  }
  return activityEntryCache.get(key);
};

const getCanonicalUsEquivalent = url => {
  const match = url.match(
    /^\/destinations\/united-states\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/
  );
  if (!match) return null;
  return `/destinations/${match[1]}/${match[2]}/tours/${match[3]}`;
};

const hasCanonicalEquivalent = url => {
  const canonical = getCanonicalUsEquivalent(url);
  if (!canonical) return false;
  const [, stateSlug, citySlug, tourSlug] =
    canonical.match(/^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/) ?? [];
  return Boolean(
    engine6RegistryModule.getEngine6NativeTourByCanonicalPath?.(canonical) ||
    legacyEngine6Module.getLegacyFhMigratedTourBySlugs?.(
      stateSlug,
      citySlug,
      tourSlug
    ) ||
    toursModule.getTourBySlugs?.(stateSlug, citySlug, tourSlug) ||
    engine2Module.getEngine2TourBySlug?.(stateSlug, citySlug, tourSlug) ||
    engine3Module.getEngine3TourBySlugs?.(stateSlug, citySlug, tourSlug) ||
    engine4Module.getEngine4TourBySlugs?.(stateSlug, citySlug, tourSlug)
  );
};

const resolveDestinationTour = (
  stateSlug,
  citySlug,
  tourSlug,
  requestedPath
) => {
  const productCode = tourSlug.split("-").at(-1)?.toUpperCase() ?? null;
  if (invalidPlaceholderToursModule.isInvalidPlaceholderTourSlug?.(tourSlug)) {
    return {
      ok: false,
      category: "tour-soft-404",
      reason: "invalid placeholder tour slug",
    };
  }
  if (
    productCode &&
    excludedProductCodesModule.isExcludedProductCode?.(productCode)
  ) {
    return {
      ok: false,
      category: "tour-soft-404",
      reason: "excluded product code",
    };
  }
  if (removedToursModule.isRemovedTourSlug?.(tourSlug)) {
    return {
      ok: false,
      category: "tour-soft-404",
      reason: "removed tour route",
    };
  }

  if (
    engine6RegistryModule.getEngine6NativeTourByCanonicalPath?.(requestedPath)
  ) {
    return { ok: true, resolver: "engine6-native" };
  }
  if (
    legacyEngine6Module.getLegacyFhMigratedTourBySlugs?.(
      stateSlug,
      citySlug,
      tourSlug
    )
  ) {
    return { ok: true, resolver: "engine6-migrated" };
  }
  if (toursModule.getTourBySlugs?.(stateSlug, citySlug, tourSlug)) {
    return { ok: true, resolver: "engine1" };
  }
  if (engine2Module.getEngine2TourBySlug?.(stateSlug, citySlug, tourSlug)) {
    return { ok: true, resolver: "engine2-us" };
  }
  if (engine3Module.getEngine3TourBySlugs?.(stateSlug, citySlug, tourSlug)) {
    return { ok: true, resolver: "engine3" };
  }
  if (engine4Module.getEngine4TourBySlugs?.(stateSlug, citySlug, tourSlug)) {
    return { ok: true, resolver: "engine4" };
  }
  return { ok: false, category: "tour-soft-404", reason: "Tour not found" };
};

const classifyUrl = url => {
  if (
    url === "/" ||
    url === "/tours" ||
    url === "/tours/catalog" ||
    url === "/tours/day" ||
    url === "/tours/day/cycling" ||
    url === "/tours/day/hiking" ||
    url === "/tours/day/paddle" ||
    url === "/tours/multi-day" ||
    url === "/tours/canoeing" ||
    url.startsWith("/tours/activities/") ||
    url === "/activities" ||
    url === "/destinations" ||
    url === "/destinations/europe" ||
    url.startsWith("/destinations/europe/") ||
    url.startsWith("/destinations/world/") ||
    url.startsWith("/guides") ||
    url === "/united-kingdom" ||
    [
      "/faqs",
      "/refund-policy",
      "/journeys",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/cookies",
      "/disclosure",
    ].includes(url) ||
    engine6RoutesModule.isEngine6CanonicalPath?.(url)
  ) {
    return {
      status: "ok",
      routeFamily: "static-or-dynamic",
      resolver: "route-pattern",
    };
  }

  let match = url.match(
    /^\/destinations\/world\/canada\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/
  );
  if (match) {
    const [, provinceSlug, citySlug, tourSlug] = match;
    const tour = engine2Module.getEngine2CanadaTourBySlug?.(
      provinceSlug,
      citySlug,
      tourSlug
    );
    return tour
      ? {
          status: "ok",
          routeFamily: "engine2-canada-tour",
          resolver: "engine2-canada",
        }
      : {
          status: "tour-soft-404",
          routeFamily: "engine2-canada-tour",
          reason: "Tour not found",
        };
  }

  match = url.match(
    /^\/destinations\/(?:united-states\/)?([^/]+)\/([^/]+)\/tours\/([^/]+)$/
  );
  if (match) {
    const [, stateSlug, citySlug, tourSlug] = match;
    const resolved = resolveDestinationTour(stateSlug, citySlug, tourSlug, url);
    if (!resolved.ok) {
      return {
        status: resolved.category,
        routeFamily: "destination-tour",
        reason: resolved.reason,
      };
    }
    if (
      url.startsWith("/destinations/united-states/") &&
      hasCanonicalEquivalent(url)
    ) {
      return {
        status: "noncanonical-legacy",
        routeFamily: "destination-tour",
        resolver: resolved.resolver,
        canonicalEquivalent: getCanonicalUsEquivalent(url),
      };
    }
    return {
      status: "ok",
      routeFamily: "destination-tour",
      resolver: resolved.resolver,
    };
  }

  match = url.match(/^\/tours\/([^/]+)(?:\/([^/]+)(?:\/([^/]+))?)?$/);
  if (match && isKnownActivitySlug(match[1])) {
    const [, activitySlug, stateOrScope, citySlug] = match;
    const stateSlug = stateOrScope === "us" ? citySlug : stateOrScope;
    const resolvedCitySlug = stateOrScope === "us" ? undefined : citySlug;
    const count = activityDefinitionPaths.has(url)
      ? getActivityEntryCount({
          activitySlug,
          stateSlug,
          citySlug: resolvedCitySlug,
        })
      : 0;
    return count > 0
      ? {
          status: "ok",
          routeFamily: resolvedCitySlug
            ? "activity-city"
            : stateSlug
              ? "activity-state"
              : "activity-category",
          resolver: "activity-discovery",
          count,
        }
      : {
          status: "empty-activity-category",
          routeFamily: resolvedCitySlug
            ? "activity-city"
            : stateSlug
              ? "activity-state"
              : "activity-category",
          reason: activityDefinitionPaths.has(url)
            ? "zero tours"
            : "not backed by activity discovery route definition",
        };
  }

  match = url.match(/^\/tours\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (match) {
    const [, stateSlug, citySlug, tourSlug] = match;
    const resolved = resolveDestinationTour(
      stateSlug,
      citySlug,
      tourSlug,
      `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
    );
    return resolved.ok
      ? {
          status: "noncanonical-legacy",
          routeFamily: "legacy-tour-detail",
          resolver: resolved.resolver,
          canonicalEquivalent: `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`,
        }
      : {
          status: "tour-soft-404",
          routeFamily: "legacy-tour-detail",
          reason: resolved.reason,
        };
  }

  match = url.match(/^\/tours\/([^/]+)$/);
  if (
    match &&
    !["catalog", "day", "multi-day", "canoeing"].includes(match[1])
  ) {
    const slug = match[1];
    if (activityDefinitionPaths.has(url)) {
      const count = getActivityEntryCount({ activitySlug: slug });
      return count > 0
        ? {
            status: "ok",
            routeFamily: "activity-category",
            resolver: "activity-discovery",
            count,
          }
        : {
            status: "empty-activity-category",
            routeFamily: "activity-category",
            reason: "zero tours",
          };
    }
    if (flagstaffModule.getFlagstaffTourBySlug?.(slug)) {
      return {
        status: "noncanonical-legacy",
        routeFamily: "slug-only-tour",
        resolver: "flagstaff-slug",
      };
    }
    return {
      status: "tour-soft-404",
      routeFamily: "slug-only-tour",
      reason: "Tour not found",
    };
  }

  match = url.match(/^\/tours\/([^/]+)\/us\/([^/]+)$/);
  if (match) {
    const [, activitySlug, stateSlug] = match;
    const count = getActivityEntryCount({ activitySlug, stateSlug });
    return count > 0
      ? {
          status: "ok",
          routeFamily: "activity-state",
          resolver: "activity-discovery",
          count,
        }
      : {
          status: "empty-activity-category",
          routeFamily: "activity-state",
          reason: "zero tours",
        };
  }

  match = url.match(/^\/tours\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/);
  if (match) {
    const [, activitySlug, stateSlug, citySlug] = match;
    if (activityDefinitionPaths.has(url)) {
      const count = getActivityEntryCount({
        activitySlug,
        stateSlug,
        citySlug,
      });
      return count > 0
        ? {
            status: "ok",
            routeFamily: citySlug ? "activity-city" : "activity-state",
            resolver: "activity-discovery",
            count,
          }
        : {
            status: "empty-activity-category",
            routeFamily: citySlug ? "activity-city" : "activity-state",
            reason: "zero tours",
          };
    }
    return {
      status: "empty-activity-category",
      routeFamily: "activity-category",
      reason: "not backed by activity discovery route definition",
    };
  }

  match = url.match(/^\/destinations\/states\/([^/]+)$/);
  if (match) {
    return {
      status: "noncanonical-legacy",
      routeFamily: "state-guide-redirect",
      resolver: "DestinationStateGuideRedirect",
    };
  }

  match = url.match(/^\/destinations\/states\/([^/]+)\/tours$/);
  if (match) {
    const stateSlug = match[1];
    const count = getStateTourCount(stateSlug);
    return count > 0
      ? {
          status: "ok",
          routeFamily: "state-tours",
          resolver: "state-tours-template",
          count,
        }
      : {
          status: "empty-destination-city",
          routeFamily: "state-tours",
          reason: "zero public tours",
        };
  }

  match = url.match(
    /^\/destinations\/(?:united-states\/)?([^/]+)\/([^/]+)\/tours$/
  );
  if (match) {
    const [, stateSlug, citySlug] = match;
    const count = getCityTours(stateSlug, citySlug).length;
    return count > 0
      ? {
          status: "ok",
          routeFamily: "city-tours",
          resolver: "city-tours-template",
          count,
        }
      : {
          status: "empty-destination-city",
          routeFamily: "city-tours",
          reason: "zero public tours",
        };
  }

  match = url.match(/^\/destinations\/(?:united-states\/)?([^/]+)\/tours$/);
  if (match) {
    const stateSlug = match[1];
    const count = getStateTourCount(stateSlug);
    return count > 0
      ? {
          status: "ok",
          routeFamily: "state-tours",
          resolver: "state-tours-template",
          count,
        }
      : {
          status: "empty-destination-city",
          routeFamily: "state-tours",
          reason: "zero public tours",
        };
  }

  match = url.match(
    /^\/destinations\/(?:states\/)?([^/]+)(?:\/cities)?\/([^/]+)$/
  );
  if (match) {
    const [, stateSlug, citySlug] = match;
    const state =
      destinationsModule.getStateBySlug?.(stateSlug) ??
      fallbackModule.getFallbackStateBySlug?.(stateSlug);
    const city =
      destinationsModule.getCityBySlugs?.(stateSlug, citySlug) ??
      fallbackModule.getFallbackCityBySlugs?.(stateSlug, citySlug);
    if (!state || !city) {
      return {
        status: "empty-destination-city",
        routeFamily: "city",
        reason: "City/Destination not found",
      };
    }
    const count = getCityTours(state.slug, city.slug).length;
    return count > 0
      ? { status: "ok", routeFamily: "city", resolver: "city-template", count }
      : {
          status: "empty-destination-city",
          routeFamily: "city",
          reason: "zero public tours",
        };
  }

  match = url.match(/^\/destinations\/(?:states\/)?([^/]+)$/);
  if (match) {
    const stateSlug = match[1];
    const state =
      destinationsModule.getStateBySlug?.(stateSlug) ??
      fallbackModule.getFallbackStateBySlug?.(stateSlug);
    if (!state)
      return {
        status: "empty-destination-city",
        routeFamily: "state",
        reason: "Destination not found",
      };
    const count = getStateTourCount(state.slug);
    return count > 0
      ? {
          status: "ok",
          routeFamily: "state",
          resolver: "state-template",
          count,
        }
      : {
          status: "empty-destination-city",
          routeFamily: "state",
          reason: "zero public tours",
        };
  }

  if (
    url === "/" ||
    url === "/tours" ||
    url === "/tours/catalog" ||
    url === "/tours/day" ||
    url === "/tours/day/cycling" ||
    url === "/tours/day/hiking" ||
    url === "/tours/day/paddle" ||
    url === "/tours/multi-day" ||
    url === "/tours/canoeing" ||
    url.startsWith("/tours/activities/") ||
    url === "/activities" ||
    url === "/destinations" ||
    url === "/destinations/europe" ||
    url.startsWith("/destinations/europe/") ||
    url.startsWith("/destinations/world/") ||
    url.startsWith("/guides") ||
    url === "/united-kingdom" ||
    [
      "/faqs",
      "/refund-policy",
      "/journeys",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/cookies",
      "/disclosure",
    ].includes(url) ||
    engine6RoutesModule.isEngine6CanonicalPath?.(url)
  ) {
    return {
      status: "ok",
      routeFamily: "static-or-dynamic",
      resolver: "route-pattern",
    };
  }

  return {
    status: "hard-unresolved",
    routeFamily: "unknown",
    reason: "no recognized public route family",
  };
};

const rows = [...emitted.entries()]
  .map(([url, origins]) => ({
    url,
    origins: [...origins].sort(),
    ...classifyUrl(url),
  }))
  .sort((a, b) => a.url.localeCompare(b.url));

const countStatus = status => rows.filter(row => row.status === status).length;
const byStatus = rows.reduce((counts, row) => {
  counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}, {});
const byRouteFamily = rows.reduce((counts, row) => {
  const key = `${row.status}:${row.routeFamily}`;
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

const duplicateFamilies = rows
  .filter(
    row => row.status === "noncanonical-legacy" && row.canonicalEquivalent
  )
  .map(row => ({
    legacy: row.url,
    canonical: row.canonicalEquivalent,
    origins: row.origins,
  }));

const examplesFor = status =>
  rows.filter(row => row.status === status).slice(0, 25);
const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    emittedUrlsAudited: rows.length,
    hardUnresolved: countStatus("hard-unresolved"),
    tourSoft404: countStatus("tour-soft-404"),
    emptyActivityCategory: countStatus("empty-activity-category"),
    emptyDestinationCity: countStatus("empty-destination-city"),
    noncanonicalLegacy: countStatus("noncanonical-legacy"),
    duplicateUrlFamilies: duplicateFamilies.length,
  },
  byStatus,
  byRouteFamily,
  examples: {
    hardUnresolved: examplesFor("hard-unresolved"),
    tourSoft404: examplesFor("tour-soft-404"),
    emptyActivityCategory: examplesFor("empty-activity-category"),
    emptyDestinationCity: examplesFor("empty-destination-city"),
    noncanonicalLegacy: examplesFor("noncanonical-legacy"),
  },
  duplicateFamilies: duplicateFamilies.slice(0, 100),
};

const formatExampleTable = rowsForTable => {
  if (!rowsForTable.length) return "_None._\n";
  return (
    [
      "| URL | Family | Reason / Resolver | Origins |",
      "|---|---|---|---|",
      ...rowsForTable.map(
        row =>
          `| \`${row.url}\` | ${row.routeFamily} | ${row.reason ?? row.resolver ?? ""} | ${row.origins.slice(0, 3).join("<br>")} |`
      ),
    ].join("\n") + "\n"
  );
};

const markdown = `# Emitted URL Integrity Audit\n\nGenerated: ${report.generatedAt}\n\n## Totals\n\n| Metric | Count |\n|---|---:|\n| Emitted URLs audited | ${report.totals.emittedUrlsAudited} |\n| Hard unresolved routes | ${report.totals.hardUnresolved} |\n| Tour soft-404 candidates | ${report.totals.tourSoft404} |\n| Empty activity/category pages | ${report.totals.emptyActivityCategory} |\n| Empty destination/city pages | ${report.totals.emptyDestinationCity} |\n| Noncanonical resolving legacy paths | ${report.totals.noncanonicalLegacy} |\n| Duplicate URL families | ${report.totals.duplicateUrlFamilies} |\n\n## Top examples: hard unresolved\n\n${formatExampleTable(report.examples.hardUnresolved)}\n## Top examples: tour soft-404 candidates\n\n${formatExampleTable(report.examples.tourSoft404)}\n## Top examples: empty activity/category pages\n\n${formatExampleTable(report.examples.emptyActivityCategory)}\n## Top examples: empty destination/city pages\n\n${formatExampleTable(report.examples.emptyDestinationCity)}\n## Top examples: noncanonical resolving legacy paths\n\n${formatExampleTable(report.examples.noncanonicalLegacy)}\n`;

await mkdir(path.dirname(REPORT_JSON), { recursive: true });
await writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(REPORT_MD, markdown);

process.stdout.write(`${JSON.stringify(report.totals, null, 2)}
`);
process.stdout
  .write(`Wrote ${path.relative(repoRoot, REPORT_JSON)} and ${path.relative(repoRoot, REPORT_MD)}
`);
