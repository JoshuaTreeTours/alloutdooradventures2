import { readFile } from "node:fs/promises";
import path from "node:path";

import { extractEngine6Product } from "./viatorExtractors.js";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";
const ENGINE6_BUNDLED_PRODUCT_CODE = "163873P16";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const getBundledExactProductPayload = async (productCode: string) => {
  if (productCode !== ENGINE6_BUNDLED_PRODUCT_CODE) {
    return null;
  }

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

const buildDiagnostics = (
  source: "live-api" | "bundled-fallback",
  hasViatorApiKey: boolean
) => ({
  source,
  hasViatorApiKey,
  attemptedLiveFetch: false,
  upstreamStatus: null as number | null,
  upstreamContentType: null as string | null,
  upstreamOk: null as boolean | null,
  usedBundledFallbackBecause: "",
  commercialPriceFieldPath: null as string | null,
  commercialPriceRawValue: null as string | number | null,
  priceSourceUsed: "fallback" as const,
  heroImageFieldPath: null as string | null,
  heroVariantFieldPath: null as string | null,
  selectedHeroWidth: null as number | null,
  selectedHeroHeight: null as number | null,
  imageSourceUsed: "fallback" as const,
  productUrlFieldPath: null as string | null,
  bookingUrlSource: "generated:viator-search-product-code" as const,
  ratingFieldPath: null as string | null,
  reviewCountFieldPath: null as string | null,
  overviewFieldPath: null as string | null,
  highlightsFieldPath: null as string | null,
  itineraryFieldPath: null as string | null,
  itineraryItemCount: 0,
  itinerarySourceUsed: null as string | null,
  meetingPointFieldPath: null as string | null,
  faqsFieldPath: null as string | null,
  faqFieldPath: null as string | null,
  faqCount: 0,
  faqSourceUsed: null as string | null,
  requirementsFieldPath: null as string | null,
  highlightClassificationReason: null as string | null,
  classificationFieldPath: null as string | null,
  fieldLevelFallbackUsed: false,
  fallbackFieldNames: [] as string[],
});

const EMPTY_EXTRACTED_PRODUCT = {
  title: null,
  seoTitle: null,
  seoDescription: null,
  city: null,
  state: null,
  heroImageUrl: null,
  cardImageUrl: null,
  productUrl: null,
  priceAmount: null,
  priceFormatted: null,
  aggregateRating: null,
  reviewCount: null,
  meetingPointText: null,
  overviewText: null,
  highlights: [] as string[],
  itinerary: [] as Array<{
    title: string;
    description?: string;
    duration?: string;
  }>,
  faqs: [] as Array<{ question: string; answer: string }>,
  requirements: [] as string[],
  primaryCategory: null,
  categories: [] as string[],
};

const buildEmptyEnvelope = (productCode: string) => ({
  rawProductCode: productCode,
  rawProduct: null,
  extracted: EMPTY_EXTRACTED_PRODUCT,
});

const safeExtractEngine6Product = (payload: unknown) => {
  try {
    return extractEngine6Product(payload);
  } catch {
    return {
      extracted: EMPTY_EXTRACTED_PRODUCT,
      diagnostics: buildDiagnostics("live-api", false),
      product: null,
    };
  }
};

const respondWithNormalizedEnvelope = (
  res: any,
  args: {
    statusCode: number;
    source: "live-api" | "bundled-fallback";
    diagnostics: ReturnType<typeof buildDiagnostics>;
    productCode: string;
    rawProduct: Record<string, unknown> | null;
    extracted: ReturnType<typeof extractEngine6Product>["extracted"];
    headers?: Record<string, string>;
    error?: string;
    details?: string;
  }
) => {
  for (const [name, value] of Object.entries(args.headers ?? {})) {
    res.setHeader(name, value);
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  res.status(args.statusCode).json({
    source: args.source,
    diagnostics: args.diagnostics,
    rawProductCode: args.productCode,
    rawProduct: args.rawProduct,
    extracted: args.extracted,
    ...(args.error ? { error: args.error } : {}),
    ...(args.details ? { details: args.details } : {}),
  });
};

const respondWithErrorEnvelope = (
  res: any,
  args: {
    statusCode: number;
    productCode: string;
    error: string;
    source?: "live-api" | "bundled-fallback";
    diagnostics?: ReturnType<typeof buildDiagnostics>;
    details?: string;
  }
) =>
  respondWithNormalizedEnvelope(res, {
    statusCode: args.statusCode,
    source: args.source ?? "live-api",
    diagnostics:
      args.diagnostics ?? buildDiagnostics(args.source ?? "live-api", false),
    productCode: args.productCode,
    ...buildEmptyEnvelope(args.productCode),
    error: args.error,
    ...(args.details ? { details: args.details } : {}),
  });

const applyResolvedHero = (args: {
  baseExtraction: ReturnType<typeof extractEngine6Product>;
  preferredHeroExtraction?: ReturnType<typeof extractEngine6Product> | null;
  fallbackHeroExtraction?: ReturnType<typeof extractEngine6Product> | null;
}) => {
  const heroSource = args.preferredHeroExtraction?.extracted.heroImageUrl
    ? args.preferredHeroExtraction
    : args.fallbackHeroExtraction?.extracted.heroImageUrl
      ? args.fallbackHeroExtraction
      : args.baseExtraction;

  return {
    extracted: {
      ...args.baseExtraction.extracted,
      heroImageUrl: heroSource.extracted.heroImageUrl,
      cardImageUrl:
        heroSource.extracted.cardImageUrl ?? heroSource.extracted.heroImageUrl,
    },
    diagnostics: {
      ...args.baseExtraction.diagnostics,
      heroImageFieldPath: heroSource.diagnostics.heroImageFieldPath,
      heroVariantFieldPath: heroSource.diagnostics.heroVariantFieldPath,
      selectedHeroWidth: heroSource.diagnostics.selectedHeroWidth,
      selectedHeroHeight: heroSource.diagnostics.selectedHeroHeight,
      imageSourceUsed: heroSource.diagnostics.imageSourceUsed,
    },
  };
};

const respondWithBundledFallback = (
  res: any,
  productCode: string,
  bundledPayload: Record<string, unknown>,
  diagnostics: ReturnType<typeof buildDiagnostics>,
  liveExtraction?: ReturnType<typeof extractEngine6Product> | null
) => {
  const bundledExtraction = safeExtractEngine6Product(bundledPayload);
  const merged = applyResolvedHero({
    baseExtraction: bundledExtraction,
    preferredHeroExtraction: liveExtraction,
    fallbackHeroExtraction: bundledExtraction,
  });
  Object.assign(diagnostics, merged.diagnostics, {
    source: "bundled-fallback",
  });

  respondWithNormalizedEnvelope(res, {
    statusCode: 200,
    source: "bundled-fallback",
    diagnostics,
    productCode,
    rawProduct: bundledExtraction.product,
    extracted: merged.extracted,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      "X-Engine6-Source": "bundled-exact-product-payload",
    },
  });
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    respondWithErrorEnvelope(res, {
      statusCode: 405,
      productCode: "UNKNOWN",
      error: "Method not allowed",
    });
    return;
  }

  const productCode = String(req.query?.productCode ?? "")
    .trim()
    .toUpperCase();
  if (!productCode) {
    respondWithErrorEnvelope(res, {
      statusCode: 400,
      productCode: "UNKNOWN",
      error: "productCode query param is required",
    });
    return;
  }

  const bundledPayload = await getBundledExactProductPayload(productCode);
  const key = process.env.VIATOR_API_KEY;
  const diagnostics = buildDiagnostics("live-api", Boolean(key));

  if (!key && bundledPayload) {
    diagnostics.source = "bundled-fallback";
    diagnostics.usedBundledFallbackBecause = "missing-api-key";
    respondWithBundledFallback(res, productCode, bundledPayload, diagnostics);
    return;
  }

  if (!key) {
    respondWithNormalizedEnvelope(res, {
      statusCode: 500,
      source: "live-api",
      diagnostics,
      productCode,
      ...buildEmptyEnvelope(productCode),
      error: "VIATOR_API_KEY is not configured",
    });
    return;
  }

  const baseUrl =
    process.env.VIATOR_API_BASE_URL ??
    process.env.VIATOR_BASE_URL ??
    DEFAULT_VIATOR_BASE_URL;

  try {
    diagnostics.attemptedLiveFetch = true;
    const response = await fetch(`${baseUrl}/products/${productCode}`, {
      method: "GET",
      headers: buildHeaders(key),
    });

    diagnostics.upstreamStatus = response.status;
    diagnostics.upstreamOk = response.ok;
    diagnostics.upstreamContentType = response.headers.get("content-type");

    if (!response.ok) {
      if (bundledPayload) {
        diagnostics.source = "bundled-fallback";
        diagnostics.usedBundledFallbackBecause = "upstream-not-ok";
        respondWithBundledFallback(
          res,
          productCode,
          bundledPayload,
          diagnostics
        );
        return;
      }

      const body = await response.text();
      respondWithNormalizedEnvelope(res, {
        statusCode: response.status,
        source: "live-api",
        diagnostics,
        productCode,
        ...buildEmptyEnvelope(productCode),
        error: `Viator API error ${response.status}: ${response.statusText}`,
        details: body.slice(0, 500),
      });
      return;
    }

    const rawBody = await response.text();
    let payload: Record<string, unknown>;

    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      if (bundledPayload) {
        diagnostics.source = "bundled-fallback";
        diagnostics.usedBundledFallbackBecause = "upstream-non-json";
        respondWithBundledFallback(
          res,
          productCode,
          bundledPayload,
          diagnostics
        );
        return;
      }

      respondWithNormalizedEnvelope(res, {
        statusCode: 502,
        source: "live-api",
        diagnostics,
        productCode,
        ...buildEmptyEnvelope(productCode),
        error: "Viator API returned non-JSON payload",
        details: rawBody.slice(0, 500),
      });
      return;
    }

    const extraction = safeExtractEngine6Product(payload);
    Object.assign(diagnostics, extraction.diagnostics, { source: "live-api" });

    if (bundledPayload && extraction.extracted.priceAmount === null) {
      diagnostics.source = "bundled-fallback";
      diagnostics.usedBundledFallbackBecause = "live-price-missing-or-zero";
      respondWithBundledFallback(
        res,
        productCode,
        bundledPayload,
        diagnostics,
        extraction
      );
      return;
    }

    respondWithNormalizedEnvelope(res, {
      statusCode: 200,
      source: "live-api",
      diagnostics,
      productCode,
      rawProduct: extraction.product,
      extracted: extraction.extracted,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      },
    });
  } catch (error: any) {
    if (bundledPayload) {
      diagnostics.source = "bundled-fallback";
      diagnostics.usedBundledFallbackBecause = "request-failed";
      respondWithBundledFallback(res, productCode, bundledPayload, diagnostics);
      return;
    }

    respondWithNormalizedEnvelope(res, {
      statusCode: 500,
      source: "live-api",
      diagnostics,
      productCode,
      ...buildEmptyEnvelope(productCode),
      error: error?.message ?? "Viator request failed",
    });
  }
}
