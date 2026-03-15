import fallbackProduct11069P1 from "../../data/engine6/viator/11069P1.product";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

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

  const baseUrl = process.env.VIATOR_BASE_URL ?? DEFAULT_VIATOR_BASE_URL;
  const key = process.env.VIATOR_API_KEY;

  if (!key) {
    res.status(500).json({
      error: "VIATOR_API_KEY is not configured",
      productCode,
    });
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/products/${productCode}`, {
      method: "GET",
      headers: buildHeaders(key),
    });

    if (!response.ok) {
      const details = await response.text();
      res.status(response.status).json({
        error: `Viator API error ${response.status}: ${response.statusText}`,
        details,
      });
      return;
    }

    const payload = await response.json();
    const product =
      asRecord((payload as Record<string, unknown>).product) ??
      asRecord(payload) ??
      null;

    if (!product) {
      res.status(502).json({
        error: "Viator API payload was not an object",
      });
      return;
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=1800"
    );
    res.status(200).json({ product, source: "api" });
  } catch (error: any) {
    if (
      productCode === "11069P1" &&
      process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1 === "true"
    ) {
      res.setHeader("X-Engine6-Source", "bundled-module-fallback");
      res.status(200).json({
        product: fallbackProduct11069P1,
        source: "bundled-module",
      });
      return;
    }

    res.status(500).json({
      error: error?.message ?? "Engine6 Viator request failed",
      productCode,
    });
  }
}
