const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";
const ENGINE6_HILO_PRODUCT_CODE = "11069P1";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

const sendJson = (
  res: any,
  status: number,
  payload: Record<string, unknown>
) => {
  try {
    res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  } catch {
    // best effort
  }
  res.status(status).json(payload);
};

const isValidProductCode = (value: string) => /^[A-Z0-9_]+$/.test(value);

const maybeSendBundledFallback = async (productCode: string, res: any) => {
  if (
    productCode !== ENGINE6_HILO_PRODUCT_CODE ||
    process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1 !== "true"
  ) {
    return false;
  }

  try {
    const module = await import("../../data/engine6/viator/11069P1.product");
    const fallbackProduct = asRecord(module.default);

    if (!fallbackProduct) {
      sendJson(res, 500, {
        error: "Engine6 bundled fallback payload is invalid",
        productCode,
        code: "ENGINE6_BUNDLED_FALLBACK_INVALID",
      });
      return true;
    }

    res.setHeader("X-Engine6-Source", "bundled-module-fallback");
    sendJson(res, 200, {
      product: fallbackProduct,
      source: "bundled-module",
      fallback: true,
    });
    return true;
  } catch (error: any) {
    sendJson(res, 500, {
      error: "Engine6 bundled fallback import failed",
      details: error?.message ?? "unknown",
      productCode,
      code: "ENGINE6_BUNDLED_FALLBACK_IMPORT_FAILED",
    });
    return true;
  }
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      sendJson(res, 405, {
        error: "Method not allowed",
        code: "METHOD_NOT_ALLOWED",
      });
      return;
    }

    const productCode = String(req.query?.productCode ?? "")
      .trim()
      .toUpperCase();

    if (!productCode) {
      sendJson(res, 400, {
        error: "productCode query param is required",
        code: "PRODUCT_CODE_REQUIRED",
      });
      return;
    }

    if (!isValidProductCode(productCode)) {
      sendJson(res, 400, {
        error: "productCode must contain only A-Z, 0-9, and underscore",
        productCode,
        code: "PRODUCT_CODE_INVALID",
      });
      return;
    }

    const baseUrl = process.env.VIATOR_BASE_URL ?? DEFAULT_VIATOR_BASE_URL;
    const key = process.env.VIATOR_API_KEY;

    if (!key) {
      sendJson(res, 500, {
        error: "VIATOR_API_KEY is not configured",
        productCode,
        code: "VIATOR_API_KEY_MISSING",
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/products/${productCode}`, {
        method: "GET",
        headers: buildHeaders(key),
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");

        const usedFallback = await maybeSendBundledFallback(productCode, res);
        if (usedFallback) {
          return;
        }

        sendJson(res, response.status, {
          error: `Viator API error ${response.status}: ${response.statusText}`,
          details,
          productCode,
          code: "VIATOR_API_ERROR",
        });
        return;
      }

      const payload = await response.json();
      const payloadRecord = asRecord(payload);
      const product =
        (payloadRecord && asRecord(payloadRecord.product)) ??
        payloadRecord ??
        null;

      if (!product) {
        const usedFallback = await maybeSendBundledFallback(productCode, res);
        if (usedFallback) {
          return;
        }

        sendJson(res, 502, {
          error: "Viator API payload was not an object",
          productCode,
          code: "VIATOR_PAYLOAD_INVALID",
        });
        return;
      }

      res.setHeader(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=1800"
      );
      sendJson(res, 200, { product, source: "api", fallback: false });
    } catch (error: any) {
      const usedFallback = await maybeSendBundledFallback(productCode, res);
      if (usedFallback) {
        return;
      }

      sendJson(res, 500, {
        error: "Engine6 Viator request failed",
        details: error?.message ?? "unknown",
        productCode,
        code: "VIATOR_FETCH_FAILED",
      });
    }
  } catch (error: any) {
    sendJson(res, 500, {
      error: "Unhandled Engine6 endpoint failure",
      details: error?.message ?? "unknown",
      code: "ENGINE6_HANDLER_UNHANDLED",
    });
  }
}
