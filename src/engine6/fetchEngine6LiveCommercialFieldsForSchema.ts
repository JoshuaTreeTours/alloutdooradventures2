import { readFile } from "node:fs/promises";
import path from "node:path";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import type { Engine6LiveProductFields } from "./liveProductFields";
import { resolveEngine6TourForProductSchema } from "./resolveEngine6TourForProductSchema";
import type { Engine6Tour } from "./types";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const readBundledExactProductPayload = async (productCode: string) => {
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

const toLiveCommercialFields = (
  extracted: ReturnType<typeof extractEngine6Product>["extracted"]
): Partial<Engine6LiveProductFields> => ({
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
});

const mergeLiveCommercialFields = (
  bundled: Partial<Engine6LiveProductFields>,
  live: Partial<Engine6LiveProductFields> | null
): Partial<Engine6LiveProductFields> => {
  if (!live) {
    return bundled;
  }

  return {
    priceAmount:
      live.priceAmount !== null && live.priceAmount !== undefined
        ? live.priceAmount
        : (bundled.priceAmount ?? null),
    priceFormatted: live.priceFormatted ?? bundled.priceFormatted ?? null,
    aggregateRating:
      live.aggregateRating !== null && live.aggregateRating !== undefined
        ? live.aggregateRating
        : (bundled.aggregateRating ?? null),
    reviewCount:
      live.reviewCount !== null && live.reviewCount !== undefined
        ? live.reviewCount
        : (bundled.reviewCount ?? null),
  };
};

/**
 * Resolves the same live commercial overlay the product page applies via
 * /api/engine6/viator-product before Product JSON-LD is rendered.
 */
export const fetchEngine6LiveCommercialFieldsForSchema = async (
  productCode: string
): Promise<Partial<Engine6LiveProductFields>> => {
  const normalizedProductCode = productCode.trim().toUpperCase();
  const bundledPayload =
    await readBundledExactProductPayload(normalizedProductCode);
  const bundledFields = bundledPayload
    ? toLiveCommercialFields(extractEngine6Product(bundledPayload).extracted)
    : {};

  const apiKey =
    process.env.VIATOR_API_KEY ||
    process.env.ENGINE6_VIATOR_API_KEY ||
    process.env.VIATOR_PARTNER_API_KEY;
  if (!apiKey) {
    return bundledFields;
  }

  const baseUrl = (
    process.env.VIATOR_API_BASE_URL ||
    process.env.VIATOR_BASE_URL ||
    DEFAULT_VIATOR_BASE_URL
  ).replace(/\/$/, "");

  try {
    const response = await fetch(
      `${baseUrl}/products/${encodeURIComponent(normalizedProductCode)}`,
      {
        method: "GET",
        headers: buildHeaders(apiKey),
      }
    );

    if (!response.ok) {
      return bundledFields;
    }

    const contentType = String(
      response.headers.get("content-type") ?? ""
    ).toLowerCase();
    if (!contentType.includes("json")) {
      return bundledFields;
    }

    const payload = (await response.json()) as unknown;
    const liveFields = toLiveCommercialFields(
      extractEngine6Product(payload).extracted
    );
    return mergeLiveCommercialFields(bundledFields, liveFields);
  } catch {
    return bundledFields;
  }
};

export const resolveEngine6ToursForProductSchema = async (
  tours: Engine6Tour[]
): Promise<Engine6Tour[]> =>
  Promise.all(
    tours.map(async tour => {
      const liveFields = await fetchEngine6LiveCommercialFieldsForSchema(
        tour.productCode
      );
      return resolveEngine6TourForProductSchema(tour, liveFields);
    })
  );
