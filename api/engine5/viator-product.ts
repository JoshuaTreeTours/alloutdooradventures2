import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";
const ENGINE5_EXACT_PAYLOAD_PRODUCT_CODE = "132218P209";
const ENGINE5_BRIDGE_PRODUCT_CODE = "421920P2";

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
  if (typeof value !== "string") {
    return undefined;
  }
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const hasNonZeroPrice = (payload: Record<string, unknown>): boolean => {
  const product =
    (payload.product as Record<string, unknown> | undefined) ?? payload;
  const amount =
    parsePriceAmount(product.priceFrom) ?? parsePriceAmount(product.fromPrice);
  return typeof amount === "number" && amount > 0;
};

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
  if (!key && bundledPayload) {
    respondWithBundledPayload(res, bundledPayload, {
      source: "bundled-fallback",
      reason: "missing-api-key",
    });
    return;
  }

  if (!key) {
    res.status(500).json({ error: "VIATOR_API_KEY is not configured" });
    return;
  }

  const baseUrl = process.env.VIATOR_BASE_URL ?? DEFAULT_VIATOR_BASE_URL;

  try {
    const response = await fetch(`${baseUrl}/products/${productCode}`, {
      method: "GET",
      headers: buildHeaders(key),
    });

    if (!response.ok) {
      if (bundledPayload && isBridgeProduct) {
        respondWithBundledPayload(res, bundledPayload, {
          source: "bundled-fallback",
          reason: "upstream-not-ok",
          status: response.status,
          statusText: response.statusText,
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
        respondWithBundledPayload(res, bundledPayload, {
          source: "bundled-fallback",
          reason: "upstream-non-json",
          upstreamBody: rawBody.slice(0, 500),
        });
        return;
      }

      res.status(502).json({
        error: "Viator API returned non-JSON payload",
        details: rawBody.slice(0, 500),
      });
      return;
    }

    if (bundledPayload && isBridgeProduct && !hasNonZeroPrice(payload)) {
      respondWithBundledPayload(res, bundledPayload, {
        source: "bundled-fallback",
        reason: "live-price-missing-or-zero",
        livePayloadPrice:
          (payload.product as Record<string, unknown> | undefined)?.priceFrom ??
          (payload.product as Record<string, unknown> | undefined)?.fromPrice ??
          payload.priceFrom ??
          payload.fromPrice ??
          null,
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
      respondWithBundledPayload(res, bundledPayload, {
        source: "bundled-fallback",
        reason: "request-failed",
        error: error?.message ?? "unknown-error",
      });
      return;
    }

    res.status(500).json({ error: error?.message ?? "Viator request failed" });
  }
}
