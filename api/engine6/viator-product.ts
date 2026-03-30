import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  resolveProductScopedHero,
  type Engine6HeroCandidate,
} from "./heroResolver.js";
import { extractEngine6Product } from "./viatorExtractors.js";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const getBundledExactProductPayload = async (productCode: string) => {
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
  imageSourceUsed: "approved-placeholder" as const,
  heroSourceType: "approved-placeholder" as const,
  finalHeroUrl: null as string | null,
  heroFallbackTriggered: false,
  rejectedForeignHeroCandidates: [] as Array<{
    url: string;
    sourceType: "api-primary" | "api-gallery" | "approved-placeholder";
    reason: string;
    candidateProductCode: string | null;
    candidateSourceProductUrl: string | null;
    fieldPath: string | null;
  }>,
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
  productUrl: null,
  priceAmount: null,
  priceFormatted: null,
  aggregateRating: null,
  reviewCount: null,
  meetingPointText: null,
  durationText: null,
  overviewText: null,
  highlights: [] as string[],
  itinerary: [] as Array<{
    title: string;
    description?: string;
    duration?: string;
    admissionNote?: string;
  }>,
  faqs: [] as Array<{ question: string; answer: string }>,
  included: [] as string[],
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

const toHeroCandidate = (args: {
  extraction: ReturnType<typeof extractEngine6Product>;
  productCode: string;
}): Engine6HeroCandidate | null => {
  const heroUrl = args.extraction.extracted.heroImageUrl;
  if (!heroUrl) {
    return null;
  }

  return {
    url: heroUrl,
    sourceType: args.extraction.diagnostics.heroSourceType,
    candidateProductCode:
      typeof args.extraction.product?.productCode === "string"
        ? args.extraction.product.productCode
        : args.extraction.extracted.productUrl
          ? args.productCode
          : null,
    candidateSourceProductUrl: args.extraction.extracted.productUrl,
    fieldPath: args.extraction.diagnostics.heroImageFieldPath,
    variantPath: args.extraction.diagnostics.heroVariantFieldPath,
    width: args.extraction.diagnostics.selectedHeroWidth,
    height: args.extraction.diagnostics.selectedHeroHeight,
  };
};

const applyResolvedHero = (args: {
  productCode: string;
  baseExtraction: ReturnType<typeof extractEngine6Product>;
  preferredHeroExtraction?: ReturnType<typeof extractEngine6Product> | null;
  fallbackHeroExtraction?: ReturnType<typeof extractEngine6Product> | null;
}) => {
  const preferredCandidate = args.preferredHeroExtraction
    ? toHeroCandidate({
        extraction: args.preferredHeroExtraction,
        productCode: args.productCode,
      })
    : null;
  const fallbackCandidate = args.fallbackHeroExtraction
    ? toHeroCandidate({
        extraction: args.fallbackHeroExtraction,
        productCode: args.productCode,
      })
    : null;

  const heroDecision = resolveProductScopedHero({
    currentProductCode: args.productCode,
    currentSourceProductUrl:
      args.baseExtraction.extracted.productUrl ??
      args.fallbackHeroExtraction?.extracted.productUrl ??
      args.preferredHeroExtraction?.extracted.productUrl,
    candidates: [
      ...(preferredCandidate &&
      preferredCandidate.sourceType !== "approved-placeholder"
        ? [preferredCandidate]
        : []),
      ...(fallbackCandidate && fallbackCandidate.sourceType !== "approved-placeholder"
        ? [fallbackCandidate]
        : []),
      ...(preferredCandidate &&
      preferredCandidate.sourceType === "approved-placeholder"
        ? [preferredCandidate]
        : []),
      ...(fallbackCandidate && fallbackCandidate.sourceType === "approved-placeholder"
        ? [fallbackCandidate]
        : []),
    ],
  });

  return {
    extracted: {
      ...args.baseExtraction.extracted,
      heroImageUrl: heroDecision.heroUrl,
    },
    diagnostics: {
      ...args.baseExtraction.diagnostics,
      heroImageFieldPath: heroDecision.finalCandidate.fieldPath ?? null,
      heroVariantFieldPath: heroDecision.finalCandidate.variantPath ?? null,
      selectedHeroWidth: heroDecision.finalCandidate.width ?? null,
      selectedHeroHeight: heroDecision.finalCandidate.height ?? null,
      imageSourceUsed: heroDecision.heroSourceType,
      heroSourceType: heroDecision.heroSourceType,
      finalHeroUrl: heroDecision.heroUrl,
      heroFallbackTriggered: heroDecision.fallbackTriggered,
      rejectedForeignHeroCandidates: heroDecision.rejectedForeignCandidates,
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
    productCode,
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

  if (!key) {
    if (bundledPayload) {
      diagnostics.usedBundledFallbackBecause = "missing-api-key";
      respondWithBundledFallback(res, productCode, bundledPayload, diagnostics);
      return;
    }

    respondWithErrorEnvelope(res, {
      statusCode: 500,
      productCode,
      error: "VIATOR_API_KEY is not configured",
      diagnostics,
    });
    return;
  }

  const baseUrl =
    process.env.VIATOR_API_BASE_URL ||
    process.env.VIATOR_BASE_URL ||
    DEFAULT_VIATOR_BASE_URL;
  const requestUrl = `${baseUrl.replace(/\/$/, "")}/products/${encodeURIComponent(productCode)}`;

  diagnostics.attemptedLiveFetch = true;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(requestUrl, {
      method: "GET",
      headers: buildHeaders(key),
    });
  } catch (error) {
    if (bundledPayload) {
      diagnostics.usedBundledFallbackBecause = "live-fetch-threw";
      respondWithBundledFallback(res, productCode, bundledPayload, diagnostics);
      return;
    }

    respondWithErrorEnvelope(res, {
      statusCode: 502,
      productCode,
      error: "Failed to reach Viator API",
      diagnostics,
      details: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  diagnostics.upstreamStatus = upstreamResponse.status;
  diagnostics.upstreamContentType = upstreamResponse.headers.get("content-type");
  diagnostics.upstreamOk = upstreamResponse.ok;

  const rawText = await upstreamResponse.text();

  if (!upstreamResponse.ok) {
    if (bundledPayload) {
      diagnostics.usedBundledFallbackBecause = "upstream-not-ok";
      const liveExtraction = safeExtractEngine6Product({
        product: { productCode, productUrl: null },
      });
      respondWithBundledFallback(
        res,
        productCode,
        bundledPayload,
        diagnostics,
        liveExtraction
      );
      return;
    }

    respondWithErrorEnvelope(res, {
      statusCode: 502,
      productCode,
      error: "Viator API returned an error response",
      diagnostics,
      details: rawText.slice(0, 500),
    });
    return;
  }

  if (!diagnostics.upstreamContentType?.includes("json")) {
    if (bundledPayload) {
      diagnostics.usedBundledFallbackBecause = "upstream-non-json";
      respondWithBundledFallback(res, productCode, bundledPayload, diagnostics);
      return;
    }

    respondWithErrorEnvelope(res, {
      statusCode: 502,
      productCode,
      error: "Viator API returned non-JSON payload",
      diagnostics,
      details: rawText.slice(0, 500),
    });
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawText);
  } catch {
    if (bundledPayload) {
      diagnostics.usedBundledFallbackBecause = "upstream-invalid-json";
      respondWithBundledFallback(res, productCode, bundledPayload, diagnostics);
      return;
    }

    respondWithErrorEnvelope(res, {
      statusCode: 502,
      productCode,
      error: "Viator API returned invalid JSON",
      diagnostics,
      details: rawText.slice(0, 500),
    });
    return;
  }

  const extracted = safeExtractEngine6Product(payload);

  const extractedProductCode =
    typeof extracted.product?.productCode === "string"
      ? extracted.product.productCode.trim().toUpperCase()
      : null;

  if (
    bundledPayload &&
    extractedProductCode &&
    extractedProductCode !== productCode
  ) {
    diagnostics.usedBundledFallbackBecause = "live-product-code-mismatch";
    respondWithBundledFallback(
      res,
      productCode,
      bundledPayload,
      diagnostics,
      extracted
    );
    return;
  }

  if (bundledPayload && extracted.extracted.priceAmount === null) {
    diagnostics.usedBundledFallbackBecause = "live-price-missing-or-zero";
    respondWithBundledFallback(
      res,
      productCode,
      bundledPayload,
      diagnostics,
      extracted
    );
    return;
  }

  if (bundledPayload && extracted.diagnostics.heroFallbackTriggered) {
    diagnostics.usedBundledFallbackBecause = "live-hero-missing-or-foreign";
    respondWithBundledFallback(
      res,
      productCode,
      bundledPayload,
      diagnostics,
      extracted
    );
    return;
  }

  Object.assign(diagnostics, extracted.diagnostics, {
    source: "live-api",
  });

  respondWithNormalizedEnvelope(res, {
    statusCode: 200,
    source: "live-api",
    diagnostics,
    productCode,
    rawProduct: extracted.product,
    extracted: extracted.extracted,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      "X-Engine6-Source": "live-api",
    },
  });
}
