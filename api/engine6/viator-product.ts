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
});

const buildEmptyEnvelope = (productCode: string) => ({
  rawProductCode: productCode,
  rawProduct: null,
  extracted: extractEngine6Product(null).extracted,
});

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

const respondWithBundledFallback = (
  res: any,
  productCode: string,
  bundledPayload: Record<string, unknown>,
  diagnostics: ReturnType<typeof buildDiagnostics>
) => {
  const extraction = extractEngine6Product(bundledPayload);
  Object.assign(diagnostics, extraction.diagnostics, {
    source: "bundled-fallback",
  });

  respondWithNormalizedEnvelope(res, {
    statusCode: 200,
    source: "bundled-fallback",
    diagnostics,
    productCode,
    rawProduct: extraction.product,
    extracted: extraction.extracted,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      "X-Engine6-Source": "bundled-exact-product-payload",
    },
  });
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const productCode = String(req.query?.productCode ?? "")
    .trim()
    .toUpperCase();
  if (!productCode) {
    res.status(400).json({ error: "productCode query param is required" });
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

    const extraction = extractEngine6Product(payload);
    Object.assign(diagnostics, extraction.diagnostics, { source: "live-api" });

    if (bundledPayload && extraction.extracted.priceAmount === null) {
      diagnostics.source = "bundled-fallback";
      diagnostics.usedBundledFallbackBecause = "live-price-missing-or-zero";
      respondWithBundledFallback(res, productCode, bundledPayload, diagnostics);
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
