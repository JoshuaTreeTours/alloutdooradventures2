import { writeFile } from "node:fs/promises";
import path from "node:path";

import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { fetchViatorWithCurl } from "../lib/viator";
import { DEFAULT_CURRENCY } from "../src/constants/merchantDefaults";
import { resolveMerchantDescription } from "../src/engine6/merchantDescriptions";
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

const fetchExactEngine6FeedHydration = async (
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
  const reviewCount =
    typeof extraction.extracted.reviewCount === "number" &&
    Number.isFinite(extraction.extracted.reviewCount)
      ? Math.trunc(extraction.extracted.reviewCount)
      : null;

  return {
    priceAmount,
    currency: DEFAULT_CURRENCY,
    averageRating: extraction.extracted.aggregateRating,
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

const buildMerchantRow = (
  tour: Engine6Tour,
  hydration: Engine6FeedHydration | null
): MerchantRow => {
  const imageLink = [
    tour.resolvedHero?.url,
    tour.heroImageUrl,
    tour.resolvedImageUrl,
  ]
    .map(value => value?.trim())
    .find(isValidHttpUrl);

  return {
    id: tour.productCode,
    title: tour.title,
    description: resolveMerchantDescription({
      productCode: tour.productCode,
      title: tour.title,
      city: tour.city,
      categoryLabel: tour.categoryLabel,
      productOverviewDescription: tour.overviewText,
      pageMetadataDescription: tour.metaDescription || tour.seoDescription,
      jsonLdProductDescription: tour.merchantDescription ?? tour.description,
      viatorApiDescription:
        hydration?.viatorApiDescription ?? tour.overviewText ?? null,
      itineraryStops: tour.itinerary,
      included: tour.included,
      highlights: tour.highlights,
      state: tour.state,
    }),
    link: `${DOMAIN}${tour.canonicalPath}`,
    image_link: imageLink ?? "",
    availability: DEFAULT_AVAILABILITY,
    price: hydration
      ? formatMerchantPrice(hydration.priceAmount, hydration.currency ?? "")
      : "",
    condition: "new",
    brand: DEFAULT_BRAND,
    average_rating: hydration
      ? formatMerchantRating(hydration.averageRating)
      : "",
    rating_count: hydration ? formatMerchantCount(hydration.ratingCount) : "",
    review_count: hydration ? formatMerchantCount(hydration.reviewCount) : "",
  };
};

const main = async () => {
  const outputRows: MerchantRow[] = [];
  let warningCount = 0;

  for (const tour of engine6ResolvedTours) {
    let hydration: Engine6FeedHydration | null = null;
    try {
      hydration = await fetchExactEngine6FeedHydration(tour.productCode);
    } catch (error) {
      warningCount += 1;
      console.warn(
        `Live Viator hydration failed for ${tour.productCode}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    if (!hydration) {
      warningCount += 1;
      console.warn(
        `Live Viator hydration unavailable for ${tour.productCode}: price and rating fields left blank.`
      );
    } else {
      if (hydration.priceAmount === null) {
        warningCount += 1;
        console.warn(
          `Live Viator price unavailable for ${tour.productCode}: merchant price left blank.`
        );
      }
      if (hydration.averageRating === null || hydration.reviewCount === null) {
        warningCount += 1;
        console.warn(
          `Live Viator ratings unavailable for ${tour.productCode}: merchant rating fields left blank.`
        );
      }
    }

    outputRows.push(buildMerchantRow(tour, hydration));
  }

  await writeFile(OUTPUT_PATH, toCsv(outputRows), "utf8");

  console.log(`Processed ${engine6ResolvedTours.length} Engine6 products.`);
  console.log(
    `Wrote ${outputRows.length} merchant feed rows to ${OUTPUT_PATH}.`
  );
  console.log(`Logged ${warningCount} warnings.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
