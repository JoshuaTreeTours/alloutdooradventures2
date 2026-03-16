import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";
const ENGINE5_EXACT_PAYLOAD_PRODUCT_CODE = "132218P209";
const ENGINE5_BRIDGE_PRODUCT_CODE = "421920P2";

type BridgeDiagnostics = {
  hasViatorApiKey: boolean;
  attemptedLiveFetch: boolean;
  upstreamStatus: number | null;
  upstreamContentType: string | null;
  upstreamOk: boolean | null;
  usedBundledFallbackBecause: string;
};

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const getBundledExactProductPayload = async (productCode: string) => {
  if (
    productCode !== ENGINE5_EXACT_PAYLOAD_PRODUCT_CODE &&
    productCode !== ENGINE5_BRIDGE_PRODUCT_CODE
  ) {
    return null;
  }

  const payloadPath = path.join(
    process.cwd(),
    "data",
    "engine5",
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

const parsePriceAmount = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const readNested = (root: unknown, path: string[]): unknown => {
  let cursor = root;
  for (const key of path) {
    if (typeof cursor !== "object" || cursor === null) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
};

const readCommercialPrice = (
  payload: Record<string, unknown>
): { amount?: number; fieldPath?: string } => {
  const product =
    (payload.product as Record<string, unknown> | undefined) ?? payload;

  const candidatePaths = [
    ["priceFrom"],
    ["fromPrice"],
    ["pricing", "summary", "fromPrice"],
    ["pricing", "summary", "fromPriceBeforeDiscount"],
    ["pricing", "fromPrice"],
    ["pricing", "fromPriceBeforeDiscount"],
  ];

  for (const path of candidatePaths) {
    const amount = parsePriceAmount(readNested(product, path));
    if (typeof amount === "number") {
      return { amount, fieldPath: `product.${path.join(".")}` };
    }
  }

  return { amount: undefined, fieldPath: undefined };
};

const buildInitialBridgeDiagnostics = (hasViatorApiKey: boolean): BridgeDiagnostics => ({
  hasViatorApiKey,
  attemptedLiveFetch: false,
  upstreamStatus: null,
  upstreamContentType: null,
  upstreamOk: null,
  usedBundledFallbackBecause: "",
});

const respondWithBundledPayload = (
  res: any,
  bundledPayload: Record<string, unknown>,
  diagnostics?: Record<string, unknown>
) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=1800"
  );
  res.setHeader("X-Engine5-Source", "bundled-exact-product-payload");
  res.status(200).json(
    diagnostics
      ? { product: bundledPayload, diagnostics }
      : { product: bundledPayload }
  );
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
  const isBridgeProduct = productCode === ENGINE5_BRIDGE_PRODUCT_CODE;

  const key = process.env.VIATOR_API_KEY;
  const bridgeDiagnostics = buildInitialBridgeDiagnostics(Boolean(key));

  if (!key && bundledPayload) {
    bridgeDiagnostics.usedBundledFallbackBecause = "missing-api-key";
    respondWithBundledPayload(res, bundledPayload, {
      source: "bundled-fallback",
      reason: "missing-api-key",
      ...bridgeDiagnostics,
    });
    return;
  }

  if (!key) {
    res.status(500).json({ error: "VIATOR_API_KEY is not configured" });
    return;
  }

  const baseUrl = process.env.VIATOR_BASE_URL ?? DEFAULT_VIATOR_BASE_URL;

  try {
    bridgeDiagnostics.attemptedLiveFetch = true;
    const response = await fetch(`${baseUrl}/products/${productCode}`, {
      method: "GET",
      headers: buildHeaders(key),
    });

    bridgeDiagnostics.upstreamStatus = response.status;
    bridgeDiagnostics.upstreamOk = response.ok;
    bridgeDiagnostics.upstreamContentType = response.headers.get("content-type");

    if (!response.ok) {
      if (bundledPayload && isBridgeProduct) {
        bridgeDiagnostics.usedBundledFallbackBecause = "upstream-not-ok";
        respondWithBundledPayload(res, bundledPayload, {
          source: "bundled-fallback",
          reason: "upstream-not-ok",
          status: response.status,
          statusText: response.statusText,
          ...bridgeDiagnostics,
        });
        return;
      }

      const body = await response.text();
      res.status(response.status).json({
        error: `Viator API error ${response.status}: ${response.statusText}`,
        details: body,
      });
      return;
    }

    const rawBody = await response.text();
    let payload: Record<string, unknown>;

    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      if (bundledPayload && isBridgeProduct) {
        bridgeDiagnostics.usedBundledFallbackBecause = "upstream-non-json";
        respondWithBundledPayload(res, bundledPayload, {
          source: "bundled-fallback",
          reason: "upstream-non-json",
          upstreamBody: rawBody.slice(0, 500),
          ...bridgeDiagnostics,
        });
        return;
      }

      res.status(502).json({
        error: "Viator API returned non-JSON payload",
        details: rawBody.slice(0, 500),
      });
      return;
    }

    const livePrice = readCommercialPrice(payload);
    if (
      bundledPayload &&
      isBridgeProduct &&
      !(typeof livePrice.amount === "number" && livePrice.amount > 0)
    ) {
      bridgeDiagnostics.usedBundledFallbackBecause = "live-price-missing-or-zero";
      respondWithBundledPayload(res, bundledPayload, {
        source: "bundled-fallback",
        reason: "live-price-missing-or-zero",
        livePayloadPrice: livePrice.amount ?? null,
        livePriceFieldPath: livePrice.fieldPath ?? null,
        ...bridgeDiagnostics,
      });
      return;
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=1800"
    );
    res.status(200).json(payload);
  } catch (error: any) {
    if (bundledPayload && isBridgeProduct) {
      bridgeDiagnostics.usedBundledFallbackBecause = "request-failed";
      respondWithBundledPayload(res, bundledPayload, {
        source: "bundled-fallback",
        reason: "request-failed",
        error: error?.message ?? "unknown-error",
        ...bridgeDiagnostics,
      });
      return;
    }

    res.status(500).json({ error: error?.message ?? "Viator request failed" });
  }
}
