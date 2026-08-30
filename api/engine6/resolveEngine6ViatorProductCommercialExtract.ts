import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  extractEngine6Product,
  type Engine6Extracted,
} from "./viatorExtractors.js";
import {
  applyAvailabilitySummaryPrice,
  applyLiveReviewsCommercial,
  fetchViatorLiveJson,
} from "./viatorLiveCommercialFetch.js";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

export type Engine6ViatorProductCommercialExtract = Pick<
  Engine6Extracted,
  "priceAmount" | "priceFormatted" | "aggregateRating" | "reviewCount"
> & {
  source: "live-api" | "bundled-fallback";
};

export type Engine6ViatorProductCommercialFailureReason =
  | "missing-api-key"
  | "upstream-not-ok"
  | "upstream-fetch-failed"
  | "upstream-non-json"
  | "live-extraction-failed"
  | "live-product-code-mismatch"
  | "live-price-missing-or-zero"
  | "live-rating-extraction-failed"
  | "live-api-success"
  | "bundled-fixture-only";

export type Engine6ViatorProductCommercialDiagnostic = {
  productCode: string;
  commercial: Engine6ViatorProductCommercialExtract;
  hasViatorApiKey: boolean;
  attemptedLiveFetch: boolean;
  upstreamStatus: number | null;
  upstreamOk: boolean | null;
  failureReason: Engine6ViatorProductCommercialFailureReason;
  pricingAvailable: boolean;
  ratingAvailable: boolean;
  reviewCountAvailable: boolean;
  /** True when the live Viator product payload includes rating/review metadata. */
  ratingMetadataPresent: boolean;
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
  priceCurrency: null,
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

const sumReviewCountTotals = (value: unknown): number | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  let total = 0;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const count = Number((entry as Record<string, unknown>).count);
    if (Number.isFinite(count) && count > 0) {
      total += Math.trunc(count);
    }
  }

  return total > 0 ? total : null;
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

export const resolveViatorApiConfig = () => {
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

/** Build-time diagnostic only: never logs secret values. */
export const describeViatorApiConfigEnvVisibility = () => {
  const { apiKey, baseUrl } = resolveViatorApiConfig();

  return {
    rawEnvSet: {
      VIATOR_API_KEY: Boolean(process.env.VIATOR_API_KEY),
      ENGINE6_VIATOR_API_KEY: Boolean(process.env.ENGINE6_VIATOR_API_KEY),
      VIATOR_PARTNER_API_KEY: Boolean(process.env.VIATOR_PARTNER_API_KEY),
    },
    resolvedApiKeyVisible: Boolean(apiKey),
    resolvedBaseUrl: baseUrl,
  };
};

const buildCommercialDiagnostic = (args: {
  productCode: string;
  commercial: Engine6ViatorProductCommercialExtract;
  hasViatorApiKey: boolean;
  attemptedLiveFetch: boolean;
  upstreamStatus: number | null;
  upstreamOk: boolean | null;
  failureReason: Engine6ViatorProductCommercialFailureReason;
  ratingMetadataPresent?: boolean;
}): Engine6ViatorProductCommercialDiagnostic => ({
  productCode: args.productCode,
  commercial: args.commercial,
  hasViatorApiKey: args.hasViatorApiKey,
  attemptedLiveFetch: args.attemptedLiveFetch,
  upstreamStatus: args.upstreamStatus,
  upstreamOk: args.upstreamOk,
  failureReason: args.failureReason,
  pricingAvailable: typeof args.commercial.priceAmount === "number",
  ratingAvailable: typeof args.commercial.aggregateRating === "number",
  reviewCountAvailable: typeof args.commercial.reviewCount === "number",
  ratingMetadataPresent: args.ratingMetadataPresent ?? false,
});

const hasPositiveNumericField = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const liveReviewSectionHasMetadata = (section: unknown) => {
  if (!section || typeof section !== "object") {
    return false;
  }

  const record = section as Record<string, unknown>;
  if (
    hasPositiveNumericField(record.combinedAverageRating) ||
    hasPositiveNumericField(record.averageRating) ||
    hasPositiveNumericField(record.totalReviews) ||
    hasPositiveNumericField(record.operatorReviewCount) ||
    hasPositiveNumericField(record.reviewCount) ||
    hasPositiveNumericField(record.count)
  ) {
    return true;
  }

  return sumReviewCountTotals(record.reviewCountTotals) !== null;
};

/** Detects whether the live Viator product payload includes rating/review metadata. */
export const detectLiveViatorProductRatingMetadata = (
  product: Record<string, unknown> | null | undefined
): boolean => {
  if (!product || typeof product !== "object") {
    return false;
  }

  if (
    hasPositiveNumericField(product.combinedAverageRating) ||
    liveReviewSectionHasMetadata(product.reviews) ||
    liveReviewSectionHasMetadata(product.operatorReviews) ||
    liveReviewSectionHasMetadata(product.reviewSummary) ||
    sumReviewCountTotals(product.reviewCountTotals) !== null
  ) {
    return true;
  }

  return false;
};

export const passesMerchantFeedLiveCommercialGuard = (
  diagnostic: Engine6ViatorProductCommercialDiagnostic
): { pass: boolean; reason?: string } => {
  if (diagnostic.commercial.source !== "live-api") {
    return {
      pass: false,
      reason: `bundled commercial fallback forbidden (source=${diagnostic.commercial.source})`,
    };
  }

  if (diagnostic.failureReason !== "live-api-success") {
    return {
      pass: false,
      reason: `${diagnostic.failureReason} (upstream HTTP ${diagnostic.upstreamStatus ?? "n/a"})`,
    };
  }

  if (!diagnostic.pricingAvailable) {
    return {
      pass: false,
      reason: `missing live price (price=${diagnostic.commercial.priceAmount ?? "null"})`,
    };
  }

  if (
    diagnostic.ratingMetadataPresent &&
    (!diagnostic.ratingAvailable || !diagnostic.reviewCountAvailable)
  ) {
    return {
      pass: false,
      reason: `live rating metadata present but extraction incomplete (rating=${diagnostic.commercial.aggregateRating ?? "null"}, reviews=${diagnostic.commercial.reviewCount ?? "null"})`,
    };
  }

  return { pass: true };
};

export const diagnoseEngine6ViatorProductCommercialExtract = async (
  productCode: string
): Promise<Engine6ViatorProductCommercialDiagnostic> => {
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
    const commercial = bundledExtraction
      ? toCommercialExtract(bundledExtracted, "bundled-fallback")
      : EMPTY_COMMERCIAL_EXTRACT;
    return buildCommercialDiagnostic({
      productCode: normalizedProductCode,
      commercial,
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamOk: null,
      failureReason: bundledExtraction
        ? "bundled-fixture-only"
        : "missing-api-key",
    });
  }

  const requestUrl = `${baseUrl}/products/${encodeURIComponent(normalizedProductCode)}`;

  let livePayload: unknown = null;
  let upstreamStatus: number | null = null;
  let upstreamOk: boolean | null = null;

  const productResponse = await fetchViatorLiveJson({
    apiKey,
    url: requestUrl,
  });
  upstreamStatus = productResponse.status;
  upstreamOk =
    productResponse.status >= 200 && productResponse.status < 300;

  if (productResponse.payload !== null) {
    livePayload = productResponse.payload;
  } else if (!upstreamOk) {
    const commercial = toCommercialExtract(
      mergeLiveDynamicCommercialExtract(bundledExtracted, null),
      "bundled-fallback"
    );
    return buildCommercialDiagnostic({
      productCode: normalizedProductCode,
      commercial,
      hasViatorApiKey: true,
      attemptedLiveFetch: true,
      upstreamStatus,
      upstreamOk,
      failureReason: "upstream-not-ok",
    });
  } else {
    const commercial = toCommercialExtract(bundledExtracted, "bundled-fallback");
    return buildCommercialDiagnostic({
      productCode: normalizedProductCode,
      commercial,
      hasViatorApiKey: true,
      attemptedLiveFetch: true,
      upstreamStatus,
      upstreamOk,
      failureReason: "upstream-non-json",
    });
  }

  const liveExtraction = safeExtractEngine6Product(livePayload);
  if (!liveExtraction) {
    const commercial = toCommercialExtract(bundledExtracted, "bundled-fallback");
    return buildCommercialDiagnostic({
      productCode: normalizedProductCode,
      commercial,
      hasViatorApiKey: true,
      attemptedLiveFetch: true,
      upstreamStatus,
      upstreamOk,
      failureReason: "live-extraction-failed",
    });
  }

  const liveWithAvailabilityPrice = await applyAvailabilitySummaryPrice({
    apiKey,
    baseUrl,
    productCode: normalizedProductCode,
    extracted: liveExtraction.extracted,
  });

  const liveWithReviews = await applyLiveReviewsCommercial({
    apiKey,
    baseUrl,
    productCode: normalizedProductCode,
    extracted: liveWithAvailabilityPrice,
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
    const commercial = toCommercialExtract(
      mergeLiveDynamicCommercialExtract(
        bundledExtracted,
        liveWithReviews
      ),
      "bundled-fallback"
    );
    return buildCommercialDiagnostic({
      productCode: normalizedProductCode,
      commercial,
      hasViatorApiKey: true,
      attemptedLiveFetch: true,
      upstreamStatus,
      upstreamOk,
      failureReason: "live-product-code-mismatch",
    });
  }

  if (typeof liveWithReviews.priceAmount === "number") {
    const ratingMetadataPresent = detectLiveViatorProductRatingMetadata(
      liveExtraction.product
    );
    const commercial = toCommercialExtract(liveWithReviews, "live-api");
    const ratingExtracted = typeof liveWithReviews.aggregateRating === "number";
    const reviewCountExtracted =
      typeof liveWithReviews.reviewCount === "number";

    if (
      ratingMetadataPresent &&
      (!ratingExtracted || !reviewCountExtracted)
    ) {
      return buildCommercialDiagnostic({
        productCode: normalizedProductCode,
        commercial,
        hasViatorApiKey: true,
        attemptedLiveFetch: true,
        upstreamStatus,
        upstreamOk,
        failureReason: "live-rating-extraction-failed",
        ratingMetadataPresent,
      });
    }

    return buildCommercialDiagnostic({
      productCode: normalizedProductCode,
      commercial,
      hasViatorApiKey: true,
      attemptedLiveFetch: true,
      upstreamStatus,
      upstreamOk,
      failureReason: "live-api-success",
      ratingMetadataPresent,
    });
  }

  if (bundledExtraction) {
    const commercial = toCommercialExtract(
      mergeLiveDynamicCommercialExtract(
        bundledExtracted,
        liveWithReviews
      ),
      "bundled-fallback"
    );
    return buildCommercialDiagnostic({
      productCode: normalizedProductCode,
      commercial,
      hasViatorApiKey: true,
      attemptedLiveFetch: true,
      upstreamStatus,
      upstreamOk,
      failureReason: "live-price-missing-or-zero",
    });
  }

  const commercial = toCommercialExtract(liveWithReviews, "live-api");
  return buildCommercialDiagnostic({
    productCode: normalizedProductCode,
    commercial,
    hasViatorApiKey: true,
    attemptedLiveFetch: true,
    upstreamStatus,
    upstreamOk,
    failureReason: "live-price-missing-or-zero",
  });
};

/**
 * Canonical commercial extract used by /api/engine6/viator-product and
 * merchant-feed generation before Product JSON-LD is built.
 */
export const resolveEngine6ViatorProductCommercialExtract = async (
  productCode: string
): Promise<Engine6ViatorProductCommercialExtract> => {
  const diagnostic =
    await diagnoseEngine6ViatorProductCommercialExtract(productCode);
  return diagnostic.commercial;
};
