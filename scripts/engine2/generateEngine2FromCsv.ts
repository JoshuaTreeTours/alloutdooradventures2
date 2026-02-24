import { readFile, writeFile } from "node:fs/promises";
import { fetchFhItemDetails } from "../../src/utils/fareharbor/fetchFhItemDetails";
import { generateTourDescriptionFromFacts } from "../../src/utils/tours/generateTourDescriptionFromFacts";
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
    region: string;
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
    heroSummary?: string;
    faqs?: Array<{ question: string; answer: string }>;
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
  "la": "los angeles",
  "los angeles, ca": "los angeles",
  "los angeles ca": "los angeles",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/,\s*ca\b/g, "")
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
  if (!status) {
    return true;
  }
  return ACTIVE_PATTERNS.has(status);
};

const parseLatLng = (latRaw: string, lngRaw: string) => {
  let lat = Number.parseFloat(latRaw);
  let lng = Number.parseFloat(lngRaw);
  if (!Number.isFinite(lat)) lat = Number.NaN;
  if (!Number.isFinite(lng)) lng = Number.NaN;

  const latLooksInvalid = Math.abs(lat) > 90;
  const lngLooksLatitude = Math.abs(lng) <= 90;
  if (latLooksInvalid && lngLooksLatitude) {
    [lat, lng] = [lng, lat];
  }

  const latInRange = Number.isFinite(lat) && Math.abs(lat) <= 90;
  const lngInRange = Number.isFinite(lng) && Math.abs(lng) <= 180;

  if (!latInRange || !lngInRange) {
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
      refUrl: /^https?:\/\//.test(ref)
        ? ref
        : "https://www.alloutdooradventures.com",
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

const normalizeLocation = (row: CsvRow, sourceKey: "santa-barbara" | "california") => {
  if (sourceKey === "santa-barbara") {
    return {
      country: "usa",
      state: "california",
      city: "Santa Barbara",
      citySlug: "santa-barbara",
    };
  }

  const rawLocation = clean(row.location);
  const parts = rawLocation
    .split("/")
    .map(part => part.trim())
    .filter(Boolean);
  const rawCity = parts[2] || row.city || "Unknown";
  const normalizedCity = LOCATION_ALIAS[rawCity.toLowerCase().trim()] || rawCity;

  return {
    country: "usa",
    state: "california",
    city: normalizedCity
      .split(" ")
      .filter(Boolean)
      .map(part => part[0].toUpperCase() + part.slice(1).toLowerCase())
      .join(" "),
    citySlug: slugify(normalizedCity),
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

  if (failures.length > 0) {
    throw new Error(`Engine2 validation failed:\n${failures.slice(0, 20).join("\n")}`);
  }
};

const buildTour = async (
  row: CsvRow,
  enrichmentByTourId: Map<string, Record<string, string>>,
  sourceKey: "santa-barbara" | "california",
  joshuaTreeDescriptions: string[],
  joshuaTreeSummaryLog: Array<{tourSlug:string; factsFound:boolean; usedFallback:boolean}>
): Promise<GeneratedTour | { skipped: string }> => {
  const id = clean(row.item_id);
  if (!id) return { skipped: "missing id" };

  const rawTitle = clean(row.item_name);
  if (!rawTitle) return { skipped: "missing title" };

  const location = normalizeLocation(row, sourceKey);
  if (!location.citySlug) return { skipped: "missing city" };

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
  const canonicalPath = `/destinations/california/${location.citySlug}/tours/${slug}`;

  const defaultCopy = buildTourCopy({
    name,
    provider: providerName,
    city: location.city,
    region: "California",
  });

  const isJoshuaTree = location.citySlug === "joshua-tree";

  const primaryImage =
    clean(enrichment?.image) ||
    clean(row.hero_image_url) ||
    clean(row.og_image_url) ||
    clean(row.image_url) ||
    ENGINE2_DEFAULT_IMAGE;

  const gallery = uniq([clean(row.image_url), clean(row.alt_image_url)]).filter(
    url => Boolean(url) && url !== primaryImage
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
      region: "California",
      city: location.city,
      lat: coords.lat,
      lng: coords.lng,
    },
    seo: {
      title: "",
      description: sanitizeTourLabel(
        clean(enrichment?.description) || defaultCopy.metaDescription
      ),
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


  if (isJoshuaTree && bookingUrl) {
    const fhFacts = await fetchFhItemDetails({
      fhEmbedUrl: bookingUrl,
      cacheKey: `joshua-tree-${id}`,
      cacheTtlHours: 24,
    });

    if (fhFacts) {
      const generated = generateTourDescriptionFromFacts({
        fhFacts: {
          ...fhFacts,
          title: fhFacts.title ?? name,
          operatorName: fhFacts.operatorName ?? providerName,
        },
        destinationContext: {
          city: "Joshua Tree",
          region: "Joshua Tree National Park",
        },
        previousDescriptions: joshuaTreeDescriptions,
      });

      draftTour.content.experienceText = generated.longDescription;
      draftTour.content.highlights = generated.highlights.length
        ? generated.highlights
        : draftTour.content.highlights;
      draftTour.content.heroSummary = generated.heroSummary;
      draftTour.content.faqs = generated.faqs;
      draftTour.seo.description = generated.heroSummary;
      joshuaTreeDescriptions.push(generated.longDescription);
      joshuaTreeSummaryLog.push({
        tourSlug: slug,
        factsFound: true,
        usedFallback: false,
      });
    } else {
      joshuaTreeSummaryLog.push({
        tourSlug: slug,
        factsFound: false,
        usedFallback: true,
      });
    }
  }
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
    const existing = cityMap.get(tour.sourceCitySlug);
    if (!existing) {
      cityMap.set(tour.sourceCitySlug, {
        cityName: tour.geo.city,
        citySlug: tour.sourceCitySlug,
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
    { path: "data/joshua-tree.csv", key: "california" as const },
  ];

  const enrichmentByTourId = await readTourEnrichment(
    path.resolve(process.cwd(), "data/tourEnrichment.csv")
  );

  const diagnostics: Diagnostics = {
    totalRows: 0,
    activeRows: 0,
    inactiveRows: 0,
    generatedTours: 0,
    generatedBookings: 0,
    skippedRows: 0,
    skippedReasons: new Map(),
  };

  const tourById = new Map<string, GeneratedTour>();
  const joshuaTreeDescriptions: string[] = [];
  const joshuaTreeSummaryLog: Array<{tourSlug:string; factsFound:boolean; usedFallback:boolean}> = [];

  for (const source of csvSources) {
    const csvPath = path.resolve(process.cwd(), source.path);
    const csv = await readFile(csvPath, "utf8");
    const rows = parseCsv(csv);

    diagnostics.totalRows += rows.length;

    for (const row of rows) {
      if (!isRowActive(row)) {
        diagnostics.inactiveRows += 1;
        continue;
      }
      diagnostics.activeRows += 1;

      const built = await buildTour(row, enrichmentByTourId, source.key, joshuaTreeDescriptions, joshuaTreeSummaryLog);
      if ("skipped" in built) {
        diagnostics.skippedRows += 1;
        incrementReason(diagnostics.skippedReasons, built.skipped);
        continue;
      }

      tourById.set(built.id, built);
    }
  }

  const tours = Array.from(tourById.values()).sort((a, b) => a.seo.canonicalPath.localeCompare(b.seo.canonicalPath));
  const citiesIndex = buildCityIndex(tours);

  diagnostics.generatedTours = tours.length;
  diagnostics.generatedBookings = tours.length;

  if (diagnostics.activeRows > 0 && diagnostics.generatedTours === 0) {
    throw new Error("Active rows found, but no tour pages were generated.");
  }

  validateGeneratedTours(tours);

  const outPath = path.resolve(process.cwd(), "src/engine2/data/california.generated.ts");
  const fileContents = `const californiaEngine2Tours = ${JSON.stringify(tours, null, 2)} as const;\n\nexport const californiaEngine2CitiesIndex = ${JSON.stringify(citiesIndex, null, 2)} as const;\n\nexport default californiaEngine2Tours;\n`;
  await writeFile(outPath, fileContents, "utf8");

  console.log("[engine2] CSV rows:", diagnostics.totalRows);
  console.log("[engine2] Active rows:", diagnostics.activeRows);
  console.log("[engine2] Inactive rows:", diagnostics.inactiveRows);
  console.log("[engine2] Distinct city slugs:", citiesIndex.length);
  console.log("[engine2] Top 20 city counts:");
  for (const city of citiesIndex.slice(0, 20)) {
    console.log(`  - ${city.citySlug}: ${city.tourCount}`);
  }
  console.log("[engine2] Generated tour pages:", diagnostics.generatedTours);
  console.log("[engine2] Generated booking pages:", diagnostics.generatedBookings);
  console.log("[engine2] Skipped rows:", diagnostics.skippedRows);

  const skippedReasons = Array.from(diagnostics.skippedReasons.entries()).sort((a, b) => b[1] - a[1]);
  if (skippedReasons.length) {
    console.log("[engine2] Top skipped reasons:");
    for (const [reason, count] of skippedReasons.slice(0, 10)) {
      console.log(`  - ${reason}: ${count}`);
    }
  }

  if (joshuaTreeSummaryLog.length) {
    console.log("[joshua-tree-fh] content summary:", JSON.stringify(joshuaTreeSummaryLog));
  }

  console.log(`Generated ${tours.length} Engine2 tours -> ${outPath}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
