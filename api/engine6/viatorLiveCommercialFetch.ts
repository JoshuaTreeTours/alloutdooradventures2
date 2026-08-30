import { fetchViatorWithCurl } from "../../lib/viator.js";

import type { Engine6Extracted } from "./viatorExtractors.js";
import { isUsdCurrency, normalizeIsoCurrency } from "../../src/engine6/priceCurrency.js";

const VIATOR_FETCH_TIMEOUT_SECONDS = 25;

export const buildViatorApiHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const parseViatorJsonPayload = (status: number, rawBody: string) => {
  if (status < 200 || status >= 300) {
    return { status, payload: null as unknown | null };
  }

  try {
    return { status, payload: JSON.parse(rawBody) as unknown };
  } catch {
    return { status, payload: null as unknown | null };
  }
};

export const fetchViatorLiveJson = async (args: {
  apiKey: string;
  url: string;
  method?: "GET" | "POST";
  body?: string;
}): Promise<{ status: number; payload: unknown | null }> => {
  const method = args.method ?? "GET";
  const headers = buildViatorApiHeaders(args.apiKey);

  try {
    const response = await fetch(args.url, {
      method,
      headers,
      ...(args.body ? { body: args.body } : {}),
    });
    const contentType = String(
      response.headers.get("content-type") ?? ""
    ).toLowerCase();

    if (response.ok && contentType.includes("json")) {
      const raw = await response.text();
      return parseViatorJsonPayload(response.status, raw);
    }
  } catch {
    // fall through to curl
  }

  try {
    const { status, body } = await fetchViatorWithCurl(args.url, args.apiKey, {
      method,
      body: args.body,
      timeoutSeconds: VIATOR_FETCH_TIMEOUT_SECONDS,
    });
    return parseViatorJsonPayload(status, body);
  } catch {
    return { status: 0, payload: null };
  }
};

export const extractAvailabilitySummaryPrice = (
  payload: unknown
): number | null => {
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

export const fetchAvailabilitySummaryPrice = async (args: {
  apiKey: string;
  baseUrl: string;
  productCode: string;
}): Promise<number | null> => {
  const url = `${args.baseUrl}/availability/schedules/${encodeURIComponent(args.productCode)}?currency=USD`;
  const { payload } = await fetchViatorLiveJson({
    apiKey: args.apiKey,
    url,
  });

  return extractAvailabilitySummaryPrice(payload);
};

const formatAvailabilitySearchDate = (input: Date) =>
  input.toISOString().slice(0, 10);

export const extractAvailabilitySearchPrice = (
  payload: unknown
): number | null => {
  const candidates: unknown[] = [];

  const collect = (value: unknown) => {
    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    const node = value as Record<string, unknown>;
    candidates.push(
      node.recommendedRetailPrice,
      node.recommendedRetailPriceFrom,
      node.fromPrice,
      node.price,
      node.lowestPrice,
      node.amount,
      node.original,
      node.partnerNet
    );

    Object.values(node).forEach(collect);
  };

  collect(payload);

  for (const candidate of candidates) {
    const numeric =
      typeof candidate === "number"
        ? candidate
        : typeof candidate === "string"
          ? Number.parseFloat(candidate)
          : candidate && typeof candidate === "object"
            ? Number.parseFloat(
                String((candidate as Record<string, unknown>).amount ?? "")
              )
            : Number.NaN;

    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return null;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export const readViatorPricingCurrency = (
  payload: unknown
): string | null => {
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const product = asRecord(root.product) ?? root;
  const candidates = [
    asRecord(product.pricing)?.currency,
    asRecord(product.pricingInfo)?.currency,
    product.currency,
    asRecord(root.pricing)?.currency,
    root.currency,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      /^[A-Z]{3}$/i.test(candidate.trim())
    ) {
      return candidate.trim().toUpperCase();
    }
  }

  return null;
};

const formatUsdFromPriceLabel = (amount: number) =>
  `From $${amount.toFixed(2)}`;

export const fetchAvailabilitySearchPrice = async (args: {
  apiKey: string;
  baseUrl: string;
  productCode: string;
}): Promise<number | null> => {
  const nextWeek = new Date();
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const { payload } = await fetchViatorLiveJson({
    apiKey: args.apiKey,
    url: `${args.baseUrl}/availability/schedules/search`,
    method: "POST",
    body: JSON.stringify({
      productCode: args.productCode,
      currency: "USD",
      travelDate: formatAvailabilitySearchDate(nextWeek),
      paxMix: [{ ageBand: "ADULT", numberOfTravelers: 1 }],
    }),
  });

  return extractAvailabilitySearchPrice(payload);
};

export const applyAvailabilitySummaryPrice = async (args: {
  apiKey: string;
  baseUrl: string;
  productCode: string;
  extracted: Engine6Extracted;
  livePayload?: unknown;
}): Promise<Engine6Extracted> => {
  const pricingCurrency = readViatorPricingCurrency(args.livePayload);
  const needsUsdOverlay =
    args.livePayload != null && pricingCurrency !== "USD";

  if (needsUsdOverlay) {
    const usdPrice = await fetchAvailabilitySearchPrice({
      apiKey: args.apiKey,
      baseUrl: args.baseUrl,
      productCode: args.productCode,
    });

    if (typeof usdPrice === "number") {
      return {
        ...args.extracted,
        priceAmount: usdPrice,
        priceFormatted: formatUsdFromPriceLabel(usdPrice),
      };
    }

    if (pricingCurrency && pricingCurrency !== "USD") {
      return {
        ...args.extracted,
        priceAmount: null,
        priceFormatted: "Check latest price",
      };
    }

    return args.extracted;
  }

  if (typeof args.extracted.priceAmount === "number") {
  const extractedCurrency = normalizeIsoCurrency(args.extracted.priceCurrency);
  if (
    typeof args.extracted.priceAmount === "number" &&
    (!extractedCurrency || isUsdCurrency(extractedCurrency))
  ) {
    return args.extracted;
  }

  const applyUsdAvailabilityPrice = (
    amount: number
  ): Engine6Extracted => ({
    ...args.extracted,
    priceAmount: amount,
    priceFormatted: `From $${amount.toFixed(2)}`,
    priceCurrency: "USD",
  });

  const schedulePrice = await fetchAvailabilitySummaryPrice({
    apiKey: args.apiKey,
    baseUrl: args.baseUrl,
    productCode: args.productCode,
  });

  if (typeof schedulePrice === "number") {
    return {
      ...args.extracted,
      priceAmount: schedulePrice,
      priceFormatted: formatUsdFromPriceLabel(schedulePrice),
    };
    return applyUsdAvailabilityPrice(schedulePrice);
  }

  const searchPrice = await fetchAvailabilitySearchPrice({
    apiKey: args.apiKey,
    baseUrl: args.baseUrl,
    productCode: args.productCode,
  });

  if (typeof searchPrice !== "number") {
    return args.extracted;
  }

  return {
    ...args.extracted,
    priceAmount: searchPrice,
    priceFormatted: formatUsdFromPriceLabel(searchPrice),
  };
  return applyUsdAvailabilityPrice(searchPrice);
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

const weightedAverageFromReviewCountTotals = (
  value: unknown
): number | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  let weightedSum = 0;
  let totalCount = 0;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const rating = Number((entry as Record<string, unknown>).rating);
    const count = Number((entry as Record<string, unknown>).count);
    if (Number.isFinite(rating) && Number.isFinite(count) && count > 0) {
      weightedSum += rating * count;
      totalCount += count;
    }
  }

  if (totalCount <= 0) {
    return null;
  }

  return weightedSum / totalCount;
};

const extractReviewsProductCommercial = (
  payload: unknown
): { aggregateRating: number | null; reviewCount: number | null } => {
  if (!payload || typeof payload !== "object") {
    return { aggregateRating: null, reviewCount: null };
  }

  const summary = (payload as Record<string, unknown>).totalReviewsSummary;
  if (!summary || typeof summary !== "object") {
    return { aggregateRating: null, reviewCount: null };
  }

  const summaryRecord = summary as Record<string, unknown>;
  const combinedAverageRating =
    typeof summaryRecord.combinedAverageRating === "number" &&
    Number.isFinite(summaryRecord.combinedAverageRating) &&
    summaryRecord.combinedAverageRating > 0
      ? summaryRecord.combinedAverageRating
      : weightedAverageFromReviewCountTotals(
          summaryRecord.reviewCountTotals
        );

  const reviewCountFromTotals = sumReviewCountTotals(
    summaryRecord.reviewCountTotals
  );
  const reviewCount =
    typeof summaryRecord.totalReviews === "number" &&
    Number.isFinite(summaryRecord.totalReviews) &&
    summaryRecord.totalReviews > 0
      ? Math.trunc(summaryRecord.totalReviews)
      : reviewCountFromTotals;

  return {
    aggregateRating: combinedAverageRating,
    reviewCount,
  };
};

export const fetchReviewsProductCommercial = async (args: {
  apiKey: string;
  baseUrl: string;
  productCode: string;
}): Promise<{ aggregateRating: number | null; reviewCount: number | null }> => {
  const { payload } = await fetchViatorLiveJson({
    apiKey: args.apiKey,
    url: `${args.baseUrl}/reviews/product`,
    method: "POST",
    body: JSON.stringify({
      productCode: args.productCode,
      provider: "ALL",
      count: 1,
      start: 1,
      sortBy: "MOST_RECENT",
    }),
  });

  return extractReviewsProductCommercial(payload);
};

const hasPositiveCommercialNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

export const applyLiveReviewsCommercial = async (args: {
  apiKey: string;
  baseUrl: string;
  productCode: string;
  extracted: Engine6Extracted;
}): Promise<Engine6Extracted> => {
  const liveReviews = await fetchReviewsProductCommercial({
    apiKey: args.apiKey,
    baseUrl: args.baseUrl,
    productCode: args.productCode,
  });

  return {
    ...args.extracted,
    aggregateRating: hasPositiveCommercialNumber(liveReviews.aggregateRating)
      ? liveReviews.aggregateRating
      : args.extracted.aggregateRating,
    reviewCount: hasPositiveCommercialNumber(liveReviews.reviewCount)
      ? liveReviews.reviewCount
      : args.extracted.reviewCount,
  };
};
