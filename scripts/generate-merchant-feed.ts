import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { fetchViatorWithCurl } from "../lib/viator";
import { DEFAULT_CURRENCY } from "../src/constants/merchantDefaults";
import { resolveMerchantDescription } from "../src/engine6/merchantDescriptions";
import {
  auditEngine6MerchantFeedParity,
  buildMerchantFeedCanonicalCommercialExpectation,
} from "../src/engine6/merchantFeedParity";
import { getEngine6TourRatingSourceOfTruth } from "../src/engine6/ratingSourceOfTruth";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";
import { engine6ResolvedTours } from "../src/engine6/registry";
import type { Engine6Tour } from "../src/engine6/types";
import { formatMerchantPrice } from "../src/utils/merchantPricing";

const OUTPUT_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const DOMAIN = "https://www.alloutdooradventures.com";
const DEFAULT_AVAILABILITY = "in stock";
const DEFAULT_BRAND = "Outdoor Adventures";
const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

const OUTPUT_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

const REQUIRED_MERCHANT_FIELDS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
] as const satisfies readonly OutputHeader[];

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type MerchantRow = Record<OutputHeader, string>;

type Engine6FeedHydration = {
  priceAmount: number | null;
  currency: string | null;
  averageRating: number | null;
  ratingCount: number | null;
  reviewCount: number | null;
  viatorApiDescription: string | null;
};

type MerchantFeedBlankCounts = {
  totalRows: number;
  blankPriceRows: number;
  blankAverageRatingRows: number;
  blankRatingCountRows: number;
  blankReviewCountRows: number;
  blankRequiredFieldRows: number;
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: MerchantRow[]) => {
  const headerLine = OUTPUT_HEADERS.join(",");
  const body = rows
    .map(row => OUTPUT_HEADERS.map(header => escapeCsv(row[header])).join(","))
    .join("\n");
  return `${headerLine}\n${body}\n`;
};

const parseCsv = (content: string): MerchantRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );
  return bodyRows.map(values => {
    const record = {} as MerchantRow;
    OUTPUT_HEADERS.forEach(header => {
      const headerIndex = headers.indexOf(header);
      record[header] = headerIndex >= 0 ? (values[headerIndex] ?? "") : "";
    });
    return record;
  });
};

export const countMerchantFeedBlankFields = (
  rows: MerchantRow[]
): MerchantFeedBlankCounts => {
  const isBlank = (value: string | undefined) => !value?.trim();

  let blankRequiredFieldRows = 0;
  for (const row of rows) {
    if (REQUIRED_MERCHANT_FIELDS.some(field => isBlank(row[field]))) {
      blankRequiredFieldRows += 1;
    }
  }

  return {
    totalRows: rows.length,
    blankPriceRows: rows.filter(row => isBlank(row.price)).length,
    blankAverageRatingRows: rows.filter(row => isBlank(row.average_rating))
      .length,
    blankRatingCountRows: rows.filter(row => isBlank(row.rating_count)).length,
    blankReviewCountRows: rows.filter(row => isBlank(row.review_count)).length,
    blankRequiredFieldRows,
  };
};

export const validateMerchantFeedRows = (rows: MerchantRow[]) => {
  const report = countMerchantFeedBlankFields(rows);
  const failures: string[] = [];

  for (const row of rows) {
    for (const field of REQUIRED_MERCHANT_FIELDS) {
      if (!row[field]?.trim()) {
        failures.push(
          `Required field "${field}" is blank for product ${row.id || "(missing id)"}`
        );
      }
    }
  }

  if (report.blankPriceRows > 0) {
    failures.push(
      `Merchant feed validation failed: ${report.blankPriceRows} row(s) have blank price.`
    );
  }

  return {
    report,
    pass: failures.length === 0,
    failures,
  };
};

const logMerchantFeedReport = (
  label: string,
  report: MerchantFeedBlankCounts,
  pass?: boolean
) => {
  console.log(`\nMerchant Feed ${label}:`);
  console.log(`  Total rows: ${report.totalRows}`);
  console.log(`  Blank price rows: ${report.blankPriceRows}`);
  console.log(`  Blank average_rating rows: ${report.blankAverageRatingRows}`);
  console.log(`  Blank rating_count rows: ${report.blankRatingCountRows}`);
  console.log(`  Blank review_count rows: ${report.blankReviewCountRows}`);
  console.log(`  Blank required-field rows: ${report.blankRequiredFieldRows}`);
  if (typeof pass === "boolean") {
    console.log(`  Pass/Fail: ${pass ? "PASS" : "FAIL"}`);
  }
};

const isValidHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const extractAvailabilitySummaryPrice = (payload: unknown): number | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const summary = (payload as Record<string, unknown>).summary;
  if (!summary || typeof summary !== "object") {
    return null;
  }

  const fromPrice = (summary as Record<string, unknown>).fromPrice;
  if (
    typeof fromPrice !== "number" ||
    !Number.isFinite(fromPrice) ||
    fromPrice <= 0
  ) {
    return null;
  }

  return fromPrice;
};

const fetchAvailabilitySummaryPrice = async (args: {
  apiKey: string;
  baseUrl: string;
  productCode: string;
}): Promise<number | null> => {
  const url = `${args.baseUrl}/availability/schedules/${encodeURIComponent(args.productCode)}?currency=USD`;
  const { status, body } = await fetchViatorWithCurl(url, args.apiKey);
  if (status < 200 || status >= 300) {
    return null;
  }

  try {
    return extractAvailabilitySummaryPrice(JSON.parse(body));
  } catch {
    return null;
  }
};

const normalizeReviewCount = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : null;

const normalizePriceAmount = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;

const normalizeAggregateRating = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const resolveCanonicalFeedHydrationFromTour = (
  tour: Engine6Tour
): Engine6FeedHydration => {
  const reviewCount = normalizeReviewCount(tour.reviewCount);

  return {
    priceAmount: normalizePriceAmount(tour.priceAmount),
    currency: DEFAULT_CURRENCY,
    averageRating: normalizeAggregateRating(tour.aggregateRating),
    ratingCount: reviewCount,
    reviewCount,
    viatorApiDescription: tour.overviewText ?? null,
  };
};

const loadBundledAvailabilitySummaryPrice = async (
  productCode: string
): Promise<number | null> => {
  const payloadPath = path.join(
    process.cwd(),
    "data",
    "engine6",
    "viator",
    `${productCode.trim().toUpperCase()}.availability-summary.json`
  );

  try {
    const body = await readFile(payloadPath, "utf8");
    return extractAvailabilitySummaryPrice(JSON.parse(body));
  } catch {
    return null;
  }
};

export const resolveCanonicalFeedHydration = async (
  tour: Engine6Tour
): Promise<Engine6FeedHydration> => {
  const canonical = resolveCanonicalFeedHydrationFromTour(tour);
  if (canonical.priceAmount !== null) {
    return canonical;
  }

  const bundledAvailabilityPrice = await loadBundledAvailabilitySummaryPrice(
    tour.productCode
  );
  if (bundledAvailabilityPrice === null) {
    return canonical;
  }

  return {
    ...canonical,
    priceAmount: bundledAvailabilityPrice,
  };
};

const pickFirstNumber = (...values: Array<number | null | undefined>) => {
  for (const value of values) {
    const normalized = normalizePriceAmount(value ?? null);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
};

const pickFirstRating = (...values: Array<number | null | undefined>) => {
  for (const value of values) {
    const normalized = normalizeAggregateRating(value ?? null);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
};

const pickFirstReviewCount = (...values: Array<number | null | undefined>) => {
  for (const value of values) {
    const normalized = normalizeReviewCount(value ?? null);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
};

export const mergeFeedHydration = (
  canonical: Engine6FeedHydration,
  live: Engine6FeedHydration | null
): Engine6FeedHydration => {
  if (!live) {
    return canonical;
  }

  const reviewCount = pickFirstReviewCount(
    canonical.reviewCount,
    canonical.ratingCount,
    live.reviewCount,
    live.ratingCount
  );

  return {
    priceAmount: pickFirstNumber(canonical.priceAmount, live.priceAmount),
    currency: canonical.currency ?? live.currency ?? DEFAULT_CURRENCY,
    averageRating: pickFirstRating(
      canonical.averageRating,
      live.averageRating
    ),
    ratingCount: reviewCount,
    reviewCount,
    viatorApiDescription:
      canonical.viatorApiDescription ?? live.viatorApiDescription,
  };
};

const fetchLiveEngine6FeedHydration = async (
  productCode: string
): Promise<Engine6FeedHydration | null> => {
  const apiKey = process.env.VIATOR_API_KEY || process.env.VITE_VIATOR_API_KEY;
  if (!apiKey) {
    return null;
  }

  const normalizedProductCode = productCode.trim().toUpperCase();
  const baseUrl = (
    process.env.VIATOR_API_BASE_URL ||
    process.env.VIATOR_BASE_URL ||
    DEFAULT_VIATOR_BASE_URL
  ).replace(/\/$/, "");
  const url = `${baseUrl}/products/${encodeURIComponent(normalizedProductCode)}`;

  const { status, body } = await fetchViatorWithCurl(url, apiKey);
  if (status < 200 || status >= 300) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return null;
  }

  const extraction = extractEngine6Product(payload);
  const extractedProductCode =
    typeof extraction.product?.productCode === "string"
      ? extraction.product.productCode.trim().toUpperCase()
      : null;

  if (extractedProductCode !== normalizedProductCode) {
    return null;
  }

  const availabilityPrice =
    extraction.extracted.priceAmount === null
      ? await fetchAvailabilitySummaryPrice({
          apiKey,
          baseUrl,
          productCode: normalizedProductCode,
        })
      : null;
  const priceAmount = availabilityPrice ?? extraction.extracted.priceAmount;
  const reviewCount = normalizeReviewCount(extraction.extracted.reviewCount);

  return {
    priceAmount: normalizePriceAmount(priceAmount),
    currency: DEFAULT_CURRENCY,
    averageRating: normalizeAggregateRating(
      extraction.extracted.aggregateRating
    ),
    ratingCount: reviewCount,
    reviewCount,
    viatorApiDescription: extraction.extracted.overviewText,
  };
};

const formatMerchantRating = (value: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "";

const formatMerchantCount = (value: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? String(Math.trunc(value))
    : "";

const resolveEngine6ProductDescription = (tour: Engine6Tour) => {
  const product = (
    buildEngine6SchemaGraph(tour)["@graph"] as Array<Record<string, unknown>>
  ).find(node => node["@type"] === "Product");

  return typeof product?.description === "string" ? product.description : null;
};

export const buildMerchantRow = (
  tour: Engine6Tour,
  hydration: Engine6FeedHydration
): MerchantRow => {
  const imageLink = [
    tour.resolvedHero?.url,
    tour.heroImageUrl,
    tour.resolvedImageUrl,
  ]
    .map(value => value?.trim())
    .find(isValidHttpUrl);
  const canonicalCommercial =
    buildMerchantFeedCanonicalCommercialExpectation(
      tour,
      hydration.priceAmount
    );
  const ratingSourceOfTruth = getEngine6TourRatingSourceOfTruth(tour);

  return {
    id: tour.productCode,
    title: canonicalCommercial.title,
    description: resolveMerchantDescription({
      productCode: tour.productCode,
      title: tour.title,
      city: tour.city,
      categoryLabel: tour.categoryLabel,
      productOverviewDescription: tour.overviewText,
      pageMetadataDescription: tour.metaDescription || tour.seoDescription,
      jsonLdProductDescription: resolveEngine6ProductDescription(tour),
      viatorApiDescription: tour.overviewText ?? null,
      itineraryStops: tour.itinerary,
      highlights: tour.highlights,
      included: tour.included,
      durationText: tour.durationText,
    }),
    link: canonicalCommercial.link,
    image_link: imageLink ?? "",
    availability: DEFAULT_AVAILABILITY,
    price: canonicalCommercial.price,
    condition: "new",
    brand: DEFAULT_BRAND,
    average_rating:
      ratingSourceOfTruth.aggregateRating !== null
        ? formatMerchantRating(ratingSourceOfTruth.aggregateRating)
        : "",
    rating_count:
      ratingSourceOfTruth.reviewCount !== null
        ? formatMerchantCount(ratingSourceOfTruth.reviewCount)
        : "",
    review_count:
      ratingSourceOfTruth.reviewCount !== null
        ? formatMerchantCount(ratingSourceOfTruth.reviewCount)
        : "",
  };
};

const readExistingMerchantFeedRows = async (): Promise<MerchantRow[]> => {
  try {
    const content = await readFile(OUTPUT_PATH, "utf8");
    return parseCsv(content);
  } catch {
    return [];
  }
};

const main = async () => {
  const existingRows = await readExistingMerchantFeedRows();
  if (existingRows.length > 0) {
    logMerchantFeedReport("Before", countMerchantFeedBlankFields(existingRows));
  } else {
    console.log("\nMerchant Feed Before: no existing merchantFeed.csv rows.");
  }

  const outputRows: MerchantRow[] = [];
  const resolvedPriceByProductCode = new Map<string, number | null>();
  let warningCount = 0;

  for (const tour of engine6ResolvedTours) {
    const hydration = await resolveCanonicalFeedHydration(tour);
    resolvedPriceByProductCode.set(tour.productCode, hydration.priceAmount);

    if (hydration.priceAmount === null) {
      warningCount += 1;
      console.warn(
        `Merchant price unavailable for ${tour.productCode}: canonical fixture/product data lacked a price.`
      );
    }

    if (hydration.averageRating === null || hydration.reviewCount === null) {
      warningCount += 1;
      console.warn(
        `Merchant rating fields unavailable for ${tour.productCode}: source JSON has no review data.`
      );
    }

    outputRows.push(buildMerchantRow(tour, hydration));
  }

  const validation = validateMerchantFeedRows(outputRows);
  logMerchantFeedReport("After", validation.report, validation.pass);

  if (!validation.pass) {
    for (const failure of validation.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (validation.failures.length > 20) {
      console.error(
        `...and ${validation.failures.length - 20} additional validation failures.`
      );
    }
    throw new Error("Merchant feed validation failed before write.");
  }

  const parityAudit = auditEngine6MerchantFeedParity(
    engine6ResolvedTours,
    new Map(outputRows.map(row => [row.id, row])),
    tour => resolvedPriceByProductCode.get(tour.productCode) ?? tour.priceAmount
  );

  if (!parityAudit.pass) {
    for (const failure of parityAudit.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (parityAudit.failures.length > 20) {
      console.error(
        `...and ${parityAudit.failures.length - 20} additional merchant feed parity failures.`
      );
    }
    throw new Error(
      "Merchant feed canonical parity validation failed before write."
    );
  }

  await writeFile(OUTPUT_PATH, toCsv(outputRows), "utf8");

  console.log(`Processed ${engine6ResolvedTours.length} Engine6 products.`);
  console.log(
    `Wrote ${outputRows.length} merchant feed rows to ${OUTPUT_PATH}.`
  );
  console.log(`Logged ${warningCount} warnings.`);
};

if (process.argv[1]?.includes("generate-merchant-feed")) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
