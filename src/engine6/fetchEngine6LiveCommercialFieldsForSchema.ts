import {
  diagnoseEngine6ViatorProductCommercialExtract,
  describeViatorApiConfigEnvVisibility,
  resolveEngine6ViatorProductCommercialExtract,
  resolveViatorApiConfig,
} from "../../api/engine6/resolveEngine6ViatorProductCommercialExtract";
import type { Engine6LiveProductFields } from "./liveProductFields";
import { resolveEngine6TourForProductSchema } from "./resolveEngine6TourForProductSchema";
import type { Engine6Tour } from "./types";

const DEFAULT_RUNTIME_BASE_URL = "https://www.alloutdooradventures.com";

export const requireLiveMerchantCommercial = () =>
  process.env.REQUIRE_LIVE_MERCHANT_COMMERCIAL === "1" ||
  process.env.VERCEL_ENV === "production";

const toLiveCommercialFields = (
  commercial: Awaited<
    ReturnType<typeof resolveEngine6ViatorProductCommercialExtract>
  >
): Partial<Engine6LiveProductFields> => ({
  priceAmount: commercial.priceAmount,
  priceFormatted: commercial.priceFormatted,
  aggregateRating: commercial.aggregateRating,
  reviewCount: commercial.reviewCount,
});

export const resolveRuntimeCommercialBaseUrl = () =>
  (
    process.env.MERCHANT_FEED_RUNTIME_BASE_URL ??
    process.env.ENGINE6_RUNTIME_BASE_URL ??
    ""
  ).replace(/\/$/, "");

const fetchProductionRuntimeCommercialFields = async (
  productCode: string
): Promise<Partial<Engine6LiveProductFields>> => {
  const baseUrl = resolveRuntimeCommercialBaseUrl() || DEFAULT_RUNTIME_BASE_URL;
  const response = await fetch(
    `${baseUrl}/api/engine6/viator-product?productCode=${encodeURIComponent(productCode)}`
  );

  if (!response.ok) {
    return toLiveCommercialFields(
      await resolveEngine6ViatorProductCommercialExtract(productCode)
    );
  }

  const body = (await response.json()) as {
    extracted?: Partial<Engine6LiveProductFields>;
  };

  if (!body.extracted) {
    return toLiveCommercialFields(
      await resolveEngine6ViatorProductCommercialExtract(productCode)
    );
  }

  return {
    priceAmount:
      typeof body.extracted.priceAmount === "number"
        ? body.extracted.priceAmount
        : null,
    priceFormatted:
      typeof body.extracted.priceFormatted === "string"
        ? body.extracted.priceFormatted
        : null,
    aggregateRating:
      typeof body.extracted.aggregateRating === "number"
        ? body.extracted.aggregateRating
        : null,
    reviewCount:
      typeof body.extracted.reviewCount === "number"
        ? body.extracted.reviewCount
        : null,
  };
};

/**
 * Resolves the canonical Viator commercial overlay used by the product page
 * (/api/engine6/viator-product) before Product JSON-LD is rendered.
 */
export const fetchEngine6LiveCommercialFieldsForSchema = async (
  productCode: string
): Promise<Partial<Engine6LiveProductFields>> => {
  const { apiKey } = resolveViatorApiConfig();

  if (!apiKey) {
    if (requireLiveMerchantCommercial()) {
      const runtimeBaseUrl = resolveRuntimeCommercialBaseUrl();
      if (!runtimeBaseUrl) {
        throw new Error(
          `Merchant feed requires VIATOR_API_KEY or MERCHANT_FEED_RUNTIME_BASE_URL for live commercial resolution. Env visibility: ${JSON.stringify(
            {
              VERCEL_ENV: process.env.VERCEL_ENV ?? null,
              REQUIRE_LIVE_MERCHANT_COMMERCIAL:
                process.env.REQUIRE_LIVE_MERCHANT_COMMERCIAL ?? null,
              MERCHANT_FEED_RUNTIME_BASE_URL: Boolean(
                process.env.MERCHANT_FEED_RUNTIME_BASE_URL
              ),
              ENGINE6_RUNTIME_BASE_URL: Boolean(
                process.env.ENGINE6_RUNTIME_BASE_URL
              ),
              ...describeViatorApiConfigEnvVisibility(),
            }
          )}`
        );
      }
    }

    if (resolveRuntimeCommercialBaseUrl()) {
      return fetchProductionRuntimeCommercialFields(productCode);
    }
  }

  const commercial =
    await resolveEngine6ViatorProductCommercialExtract(productCode);
  return toLiveCommercialFields(commercial);
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

export {
  diagnoseEngine6ViatorProductCommercialExtract,
  resolveEngine6ViatorProductCommercialExtract,
};
