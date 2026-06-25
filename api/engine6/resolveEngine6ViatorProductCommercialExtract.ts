import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  extractEngine6Product,
  type Engine6Extracted,
} from "./viatorExtractors.js";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

export type Engine6ViatorProductCommercialExtract = Pick<
  Engine6Extracted,
  "priceAmount" | "priceFormatted" | "aggregateRating" | "reviewCount"
> & {
  source: "live-api" | "bundled-fallback";
};

const EMPTY_COMMERCIAL_EXTRACT: Engine6ViatorProductCommercialExtract = {
  priceAmount: null,
  priceFormatted: null,
  aggregateRating: null,
  reviewCount: null,
  source: "bundled-fallback",
};

const EMPTY_ENGINE6_EXTRACTED: Engine6Extracted = {
  title: null,
  seoTitle: null,
  seoDescription: null,
  city: null,
  state: null,
  heroImageUrl: null,
  productUrl: null,
  priceAmount: null,
  priceFormatted: null,
  durationText: null,
  aggregateRating: null,
  reviewCount: null,
  meetingPointText: null,
  overviewText: null,
  highlights: [],
  itinerary: [],
  itinerarySummaryText: null,
  faqs: [],
  included: [],
  requirements: [],
  primaryCategory: null,
  categories: [],
  primaryDisplayCategory: null,
  activityCategories: [],
};

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

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
  const response = await fetch(url, {
    headers: buildHeaders(args.apiKey),
  });
  if (!response.ok) {
    return null;
  }

  const contentType = String(
    response.headers.get("content-type") ?? ""
  ).toLowerCase();
  if (!contentType.includes("json")) {
    return null;
  }

  const payload = (await response.json()) as unknown;
  return extractAvailabilitySummaryPrice(payload);
};

export const readEngine6BundledExactProductPayload = async (
  productCode: string
) => {
  const payloadPath = path.join(
    process.cwd(),
    "data",
    "engine6",
    "viator",
    `${productCode}.exact-product.json`
  );

  try {
    const body = await readFile(payloadPath, "utf8");
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const safeExtractEngine6Product = (payload: unknown) => {
  try {
    return extractEngine6Product(payload);
  } catch {
    return null;
  }
};

const toCommercialExtract = (
  extracted: Engine6Extracted,
  source: Engine6ViatorProductCommercialExtract["source"]
): Engine6ViatorProductCommercialExtract => ({
  priceAmount:
    typeof extracted.priceAmount === "number" ? extracted.priceAmount : null,
  priceFormatted:
    typeof extracted.priceFormatted === "string"
      ? extracted.priceFormatted
      : null,
  aggregateRating:
    typeof extracted.aggregateRating === "number"
      ? extracted.aggregateRating
      : null,
  reviewCount:
    typeof extracted.reviewCount === "number" ? extracted.reviewCount : null,
  source,
});

const mergeLiveDynamicCommercialExtract = (
  bundled: Engine6Extracted,
  live: Engine6Extracted | null
): Engine6Extracted => {
  if (!live) {
    return bundled;
  }

  return {
    ...bundled,
    priceAmount:
      typeof live.priceAmount === "number"
        ? live.priceAmount
        : bundled.priceAmount,
    priceFormatted:
      typeof live.priceFormatted === "string" && live.priceFormatted.trim()
        ? live.priceFormatted
        : bundled.priceFormatted,
    aggregateRating:
      typeof live.aggregateRating === "number"
        ? live.aggregateRating
        : bundled.aggregateRating,
    reviewCount:
      typeof live.reviewCount === "number"
        ? live.reviewCount
        : bundled.reviewCount,
  };
};

const applyAvailabilitySummaryPrice = async (args: {
  apiKey: string;
  baseUrl: string;
  productCode: string;
  extracted: Engine6Extracted;
}): Promise<Engine6Extracted> => {
  if (typeof args.extracted.priceAmount === "number") {
    return args.extracted;
  }

  const liveAvailabilityPrice = await fetchAvailabilitySummaryPrice({
    apiKey: args.apiKey,
    baseUrl: args.baseUrl,
    productCode: args.productCode,
  });

  if (typeof liveAvailabilityPrice !== "number") {
    return args.extracted;
  }

  return {
    ...args.extracted,
    priceAmount: liveAvailabilityPrice,
    priceFormatted: `From $${liveAvailabilityPrice.toFixed(2)}`,
  };
};

const resolveViatorApiConfig = () => {
  const apiKey =
    process.env.VIATOR_API_KEY ||
    process.env.ENGINE6_VIATOR_API_KEY ||
    process.env.VIATOR_PARTNER_API_KEY ||
    null;
  const baseUrl = (
    process.env.VIATOR_API_BASE_URL ||
    process.env.VIATOR_BASE_URL ||
    DEFAULT_VIATOR_BASE_URL
  ).replace(/\/$/, "");

  return { apiKey, baseUrl };
};

/**
 * Canonical commercial extract used by /api/engine6/viator-product and
 * merchant-feed generation before Product JSON-LD is built.
 */
export const resolveEngine6ViatorProductCommercialExtract = async (
  productCode: string
): Promise<Engine6ViatorProductCommercialExtract> => {
  const normalizedProductCode = productCode.trim().toUpperCase();
  const bundledPayload =
    await readEngine6BundledExactProductPayload(normalizedProductCode);
  const bundledExtraction = bundledPayload
    ? safeExtractEngine6Product(bundledPayload)
    : null;
  const bundledExtracted =
    bundledExtraction?.extracted ?? EMPTY_ENGINE6_EXTRACTED;

  const { apiKey, baseUrl } = resolveViatorApiConfig();
  if (!apiKey) {
    return bundledExtraction
      ? toCommercialExtract(bundledExtracted, "bundled-fallback")
      : EMPTY_COMMERCIAL_EXTRACT;
  }

  const requestUrl = `${baseUrl}/products/${encodeURIComponent(normalizedProductCode)}`;

  let livePayload: unknown = null;
  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: buildHeaders(apiKey),
    });

    if (
      response.ok &&
      String(response.headers.get("content-type") ?? "")
        .toLowerCase()
        .includes("json")
    ) {
      livePayload = await response.json();
    }
  } catch {
    livePayload = null;
  }

  if (!livePayload) {
    return toCommercialExtract(
      bundledExtracted,
      bundledExtraction ? "bundled-fallback" : "bundled-fallback"
    );
  }

  const liveExtraction = safeExtractEngine6Product(livePayload);
  if (!liveExtraction) {
    return toCommercialExtract(bundledExtracted, "bundled-fallback");
  }

  const liveWithAvailabilityPrice = await applyAvailabilitySummaryPrice({
    apiKey,
    baseUrl,
    productCode: normalizedProductCode,
    extracted: liveExtraction.extracted,
  });

  const extractedProductCode =
    typeof liveExtraction.product?.productCode === "string"
      ? liveExtraction.product.productCode.trim().toUpperCase()
      : null;

  if (
    bundledExtraction &&
    extractedProductCode &&
    extractedProductCode !== normalizedProductCode
  ) {
    return toCommercialExtract(
      mergeLiveDynamicCommercialExtract(
        bundledExtracted,
        liveWithAvailabilityPrice
      ),
      "bundled-fallback"
    );
  }

  if (bundledExtraction && liveWithAvailabilityPrice.priceAmount === null) {
    return toCommercialExtract(
      mergeLiveDynamicCommercialExtract(
        bundledExtracted,
        liveWithAvailabilityPrice
      ),
      "bundled-fallback"
    );
  }

  return toCommercialExtract(liveWithAvailabilityPrice, "live-api");
};
