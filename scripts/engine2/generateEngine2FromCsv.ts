import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ENGINE2_DEFAULT_IMAGE } from "../../src/engine2/config/destinations";
import { buildTourCopy } from "../../src/engine2/content/templates/buildTourCopy";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../../src/engine2/utils/buildFareHarborUrl";
import { parseCsv } from "./csvUtils";
import { readTourEnrichment } from "./readTourEnrichment";

type CsvRow = Record<string, string>;
type SourceKey = "santa-barbara" | "california" | "canada";

type GeneratedTour = {
  id: string;
  sourceCitySlug: string;
  slug: string;
  name: string;
  provider: {
    name: string;
    shortName: string;
    email?: string;
    phone?: string;
  };
  geo: {
    country: string;
    countryCode: string;
    region: string;
    regionSlug: string;
    city: string;
    lat: number | null;
    lng: number | null;
  };
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
    ogImage: string;
  };
  content: {
    experienceText: string;
    highlights: string[];
  };
  images: {
    hero: string | null;
    gallery: string[];
  };
  booking: {
    bookingUrl: string;
    fareharbor?: {
      shortname: string;
      itemId: string;
      refUrl: string;
      backUrl: string;
    };
  };
  pricing?: {
    price?: string;
    currency?: string;
    priceRange?: string;
  };
};

type CityIndexEntry = {
  cityName: string;
  citySlug: string;
  regionSlug: string;
  regionName: string;
  tourCount: number;
  sampleImages: string[];
};

type Diagnostics = {
  totalRows: number;
  activeRows: number;
  inactiveRows: number;
  generatedTours: number;
  generatedBookings: number;
  skippedRows: number;
  skippedReasons: Map<string, number>;
};

const ACTIVE_PATTERNS = new Set(["true", "1", "yes", "active", "published"]);

const LOCATION_ALIAS: Record<string, string> = {
  "santa barbara county": "santa barbara",
  "santa barbara, ca": "santa barbara",
  "santa barbara ca": "santa barbara",
  "los angeles county": "los angeles",
  la: "los angeles",
  "los angeles, ca": "los angeles",
  "los angeles ca": "los angeles",
  "british columbia": "british columbia",
  "bc": "british columbia",
  "québec": "quebec",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[’']/g, "")
    .replace(/[.,]/g, " ")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const uniq = (arr: string[]) => Array.from(new Set(arr));
const clean = (value?: string) => (value ?? "").trim();
const sanitizeTourLabel = (value: string) =>
  value.replace(/\bFood\s+Tour\b/gi, "Guided Tour");

const getStatusValue = (row: CsvRow) =>
  clean(
    row.status || row.active || row.is_active || row.published || row.enabled || ""
  ).toLowerCase();

const isRowActive = (row: CsvRow) => {
  const status = getStatusValue(row);
  if (!status) return true;
  return ACTIVE_PATTERNS.has(status);
};

const parseLatLng = (latRaw: string, lngRaw: string) => {
  let lat = Number.parseFloat(latRaw);
  let lng = Number.parseFloat(lngRaw);
  if (!Number.isFinite(lat)) lat = Number.NaN;
  if (!Number.isFinite(lng)) lng = Number.NaN;

  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    [lat, lng] = [lng, lat];
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { lat: null, lng: null };
  }

  return { lat, lng };
};

type ParsedFareHarbor = {
  shortname: string;
  itemId: string;
  refUrl: string;
  backUrl: string;
};

const parseFareHarborDetails = (url?: string): ParsedFareHarbor | undefined => {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "fareharbor.com") return undefined;

    const match =
      parsed.pathname.match(/\/embeds\/(?:book|calendar)\/([^/]+)\/items\/(\d+)/) ??
      parsed.pathname.match(/\/embeds\/book\/([^/]+)\/items\/(\d+)\/calendar/);

    if (!match?.[1] || !match?.[2]) return undefined;

    const ref = parsed.searchParams.get("ref") ?? "";
    const back = parsed.searchParams.get("back") ?? ref;

    return {
      shortname: match[1],
      itemId: match[2],
      refUrl: /^https?:\/\//.test(ref) ? ref : "https://www.alloutdooradventures.com",
      backUrl: /^https?:\/\//.test(back)
        ? back
        : /^https?:\/\//.test(ref)
          ? ref
          : "https://www.alloutdooradventures.com/",
    };
  } catch {
    return undefined;
  }
};

const normalizeLabel = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const normalizeLocation = (row: CsvRow, sourceKey: SourceKey) => {
  if (sourceKey === "santa-barbara") {
    return {
      country: "usa",
      countryCode: "US",
      region: "California",
      regionSlug: "california",
      city: "Santa Barbara",
      citySlug: "santa-barbara",
      rootPath: "/destinations/california",
      shouldSkip: false,
    };
  }

  const parts = clean(row.location)
    .split("/")
    .map(part => part.trim())
    .filter(Boolean);

  const rawCountry = (parts[0] || row.country || "United States").toLowerCase();
  const rawRegion = parts[1] || row.state || row.province || row.region || "";
  const rawCity = parts[2] || row.city || "";

  if (sourceKey === "canada" && rawCountry !== "canada") {
    return {
      country: "canada",
      countryCode: "CA",
      region: "",
      regionSlug: "",
      city: "",
      citySlug: "",
      rootPath: "/destinations/canada",
      shouldSkip: true,
    };
  }

  const fallbackRegion = sourceKey === "canada" ? "Ontario" : "California";
  const normalizedRegion = LOCATION_ALIAS[rawRegion.toLowerCase()] || rawRegion || fallbackRegion;
  const normalizedCity = LOCATION_ALIAS[rawCity.toLowerCase()] || rawCity;
  const country = sourceKey === "canada" ? "canada" : "usa";

  return {
    country,
    countryCode: sourceKey === "canada" ? "CA" : "US",
    region: normalizeLabel(normalizedRegion || fallbackRegion),
    regionSlug: slugify(normalizedRegion || fallbackRegion),
    city: normalizeLabel(normalizedCity || "Unknown"),
    citySlug: slugify(normalizedCity || "unknown"),
    rootPath: sourceKey === "canada" ? "/destinations/canada" : "/destinations/california",
    shouldSkip: false,
  };
};

const incrementReason = (map: Map<string, number>, reason: string) => {
  map.set(reason, (map.get(reason) ?? 0) + 1);
};

const validateGeneratedTours = (tours: GeneratedTour[]) => {
  const failures: string[] = [];

  for (const tour of tours) {
    if (!clean(tour.seo.title)) failures.push(`${tour.id}: missing SEO title`);
    if (!clean(tour.seo.description)) failures.push(`${tour.id}: missing SEO description`);
    if (!clean(tour.seo.canonicalPath)) failures.push(`${tour.id}: missing canonicalPath`);
    if (!clean(tour.seo.ogImage)) failures.push(`${tour.id}: missing OG image`);

    const seo = buildEngine2Seo(tour);
    const schemaNodes = buildSchemaGraph(tour, seo);
    const hasTouristTrip = schemaNodes.some(node => node["@type"] === "TouristTrip");
    const hasProduct = schemaNodes.some(node => node["@type"] === "Product");

    if (!hasTouristTrip || !hasProduct) {
      failures.push(`${tour.id}: schema missing TouristTrip or Product`);
    }
  }

  if (failures.length) {
    throw new Error(`Engine2 validation failed:\n${failures.slice(0, 20).join("\n")}`);
  }
};

const buildTour = (
  row: CsvRow,
  enrichmentByTourId: Map<string, Record<string, string>>,
  sourceKey: SourceKey,
): GeneratedTour | { skipped: string } => {
  const id = clean(row.item_id);
  if (!id) return { skipped: "missing id" };

  const rawTitle = clean(row.item_name);
  if (!rawTitle) return { skipped: "missing title" };

  const location = normalizeLocation(row, sourceKey);
  if (location.shouldSkip) return { skipped: "outside canada" };
  if (!location.regionSlug || !location.citySlug) return { skipped: "missing geo" };

  const enrichment = enrichmentByTourId.get(id);
  const name = sanitizeTourLabel(clean(enrichment?.title) || rawTitle);

  const fareharbor =
    parseFareHarborDetails(row.regular_link) ??
    parseFareHarborDetails(row.calendar_link) ??
    (row.company_shortname && id
      ? {
          shortname: row.company_shortname,
          itemId: id,
          refUrl: "https://www.alloutdooradventures.com",
          backUrl: "https://www.alloutdooradventures.com/",
        }
      : undefined);

  const bookingUrl = fareharbor
    ? buildFareHarborUrl({
        company: fareharbor.shortname,
        itemId: fareharbor.itemId,
        calendarPath: row.calendar_link || row.regular_link,
      })
    : normalizeFareHarborUrl(row.regular_link || row.calendar_link);

  if (!clean(bookingUrl)) return { skipped: "missing booking config" };

  const providerName = clean(row.company_name) || "Unknown provider";
  const slug = `${slugify(clean(enrichment?.slug) || rawTitle)}-${id}`;
  const canonicalBase =
    sourceKey === "canada"
      ? `${location.rootPath}/${location.regionSlug}/${location.citySlug}/tours`
      : `${location.rootPath}/${location.citySlug}/tours`;
  const canonicalPath = `${canonicalBase}/${slug}`;

  const defaultCopy = buildTourCopy({
    name,
    provider: providerName,
    city: location.city,
    region: location.region,
  });

  const primaryImage =
    clean(enrichment?.image) ||
    clean(row.hero_image_url) ||
    clean(row.og_image_url) ||
    clean(row.image_url) ||
    ENGINE2_DEFAULT_IMAGE;

  const gallery = uniq([clean(row.image_url), clean(row.alt_image_url)]).filter(
    url => Boolean(url) && url !== primaryImage,
  );

  const coords = parseLatLng(row.location_lat, row.location_long);
  const parsedPrice = Number.parseFloat(clean(enrichment?.price));
  const hasNumericPrice = Number.isFinite(parsedPrice);

  const draftTour: GeneratedTour = {
    id,
    sourceCitySlug: location.citySlug,
    slug,
    name,
    provider: {
      name: providerName,
      shortName: clean(row.company_shortname),
      email: clean(row.company_email) || undefined,
      phone: clean(row.company_phone) || undefined,
    },
    geo: {
      country: location.country,
      countryCode: location.countryCode,
      region: location.region,
      regionSlug: location.regionSlug,
      city: location.city,
      lat: coords.lat,
      lng: coords.lng,
    },
    seo: {
      title: "",
      description: sanitizeTourLabel(clean(enrichment?.description) || defaultCopy.metaDescription),
      canonicalPath,
      ogImage: primaryImage,
    },
    content: {
      experienceText: sanitizeTourLabel(defaultCopy.experienceText),
      highlights: defaultCopy.highlights,
    },
    images: {
      hero: primaryImage,
      gallery,
    },
    booking: {
      bookingUrl,
      fareharbor,
    },
    pricing: {
      price: hasNumericPrice ? parsedPrice.toString() : undefined,
      currency: clean(enrichment?.currency) || "USD",
      priceRange: hasNumericPrice ? undefined : clean(enrichment?.priceRange) || undefined,
    },
  };

  const builtSeo = buildEngine2Seo(draftTour);

  return {
    ...draftTour,
    seo: {
      ...draftTour.seo,
      title: builtSeo.title,
      description: builtSeo.description,
    },
  };
};

const buildCityIndex = (tours: GeneratedTour[]): CityIndexEntry[] => {
  const cityMap = new Map<string, CityIndexEntry>();

  for (const tour of tours) {
    const key = `${tour.geo.regionSlug}:${tour.sourceCitySlug}`;
    const existing = cityMap.get(key);
    if (!existing) {
      cityMap.set(key, {
        cityName: tour.geo.city,
        citySlug: tour.sourceCitySlug,
        regionSlug: tour.geo.regionSlug,
        regionName: tour.geo.region,
        tourCount: 1,
        sampleImages: [tour.images.hero || ENGINE2_DEFAULT_IMAGE],
      });
      continue;
    }

    existing.tourCount += 1;
    if (existing.sampleImages.length < 4) {
      existing.sampleImages.push(tour.images.hero || ENGINE2_DEFAULT_IMAGE);
      existing.sampleImages = uniq(existing.sampleImages);
    }
  }

  return Array.from(cityMap.values()).sort((a, b) => b.tourCount - a.tourCount || a.citySlug.localeCompare(b.citySlug));
};

const main = async () => {
  const csvSources = [
    { path: "data/santa-barbara.csv", key: "santa-barbara" as const },
    { path: "data/California.csv", key: "california" as const },
    { path: "data/canada.csv", key: "canada" as const },
  ];

  const enrichmentByTourId = await readTourEnrichment(path.resolve(process.cwd(), "data/tourEnrichment.csv"));

  const diagnosticsBySource = new Map<SourceKey, Diagnostics>();
  const tourById = new Map<string, GeneratedTour>();

  for (const source of csvSources) {
    const diagnostics: Diagnostics = {
      totalRows: 0,
      activeRows: 0,
      inactiveRows: 0,
      generatedTours: 0,
      generatedBookings: 0,
      skippedRows: 0,
      skippedReasons: new Map(),
    };
    diagnosticsBySource.set(source.key, diagnostics);

    const rows = parseCsv(await readFile(path.resolve(process.cwd(), source.path), "utf8"));
    diagnostics.totalRows += rows.length;

    for (const row of rows) {
      if (!isRowActive(row)) {
        diagnostics.inactiveRows += 1;
        continue;
      }
      diagnostics.activeRows += 1;

      const built = buildTour(row, enrichmentByTourId, source.key);
      if ("skipped" in built) {
        diagnostics.skippedRows += 1;
        incrementReason(diagnostics.skippedReasons, built.skipped);
        continue;
      }
      tourById.set(`${source.key}:${built.id}`, built);
    }
  }

  const allTours = Array.from(tourById.values());
  const californiaTours = allTours.filter(tour => tour.geo.country === "usa");
  const canadaTours = allTours.filter(tour => tour.geo.country === "canada");
  const californiaCityIndex = buildCityIndex(californiaTours);
  const canadaCityIndex = buildCityIndex(canadaTours);

  const canadaDiagnostics = diagnosticsBySource.get("canada")!;
  canadaDiagnostics.generatedTours = canadaTours.length;
  canadaDiagnostics.generatedBookings = canadaTours.length;

  if (canadaDiagnostics.activeRows > 0 && canadaTours.length === 0) {
    throw new Error("Active Canada rows found, but no Canada routes were generated.");
  }

  validateGeneratedTours(allTours);

  const sourceRoot = path.resolve(process.cwd(), "src/engine2/data");
  const generatedDir = path.join(sourceRoot, "_generated");
  await mkdir(generatedDir, { recursive: true });

  await writeFile(
    path.join(generatedDir, "canada.generated.ts"),
    `const canadaEngine2Tours = ${JSON.stringify(canadaTours, null, 2)} as const;\n\nexport const canadaEngine2CitiesIndex = ${JSON.stringify(canadaCityIndex, null, 2)} as const;\n\nexport default canadaEngine2Tours;\n`,
    "utf8",
  );

  await writeFile(
    path.join(sourceRoot, "canada.summary.json"),
    `${JSON.stringify({
      rows: canadaDiagnostics.totalRows,
      active: canadaDiagnostics.activeRows,
      provinces: new Set(canadaTours.map(t => t.geo.regionSlug)).size,
      cities: new Set(canadaTours.map(t => `${t.geo.regionSlug}:${t.sourceCitySlug}`)).size,
      tours: canadaTours.length,
      bookings: canadaTours.length,
      generatedAt: new Date().toISOString(),
    }, null, 2)}\n`,
    "utf8",
  );

  const skippedReasons = Array.from(canadaDiagnostics.skippedReasons.entries()).sort((a, b) => b[1] - a[1]);
  console.log("[engine2:canada] total rows:", canadaDiagnostics.totalRows);
  console.log("[engine2:canada] active rows:", canadaDiagnostics.activeRows);
  console.log("[engine2:canada] provinces:", new Set(canadaTours.map(t => t.geo.regionSlug)).size);
  console.log("[engine2:canada] cities:", new Set(canadaTours.map(t => `${t.geo.regionSlug}:${t.sourceCitySlug}`)).size);
  console.log("[engine2:canada] generated tour routes:", canadaDiagnostics.generatedTours);
  console.log("[engine2:canada] generated booking routes:", canadaDiagnostics.generatedBookings);
  console.log("[engine2:canada] skipped rows:", canadaDiagnostics.skippedRows);
  for (const [reason, count] of skippedReasons.slice(0, 10)) {
    console.log(`  - ${reason}: ${count}`);
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
