const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";
const ENGINE6_PILOT_PRODUCT_CODE = "421920P2";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const getBundledPayload = async (productCode: string) => {
  if (productCode !== ENGINE6_PILOT_PRODUCT_CODE) {
    return null;
  }

  try {
    const module = await import("../../data/engine6/viator/421920P2.product");
    const payload = module.default;
    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
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

  const bundledPayload = await getBundledPayload(productCode);
  const key = process.env.VIATOR_API_KEY;

  if (!key && bundledPayload) {
    res.setHeader("X-Engine6-Source", "bundled-product-payload");
    res.status(200).json({ product: bundledPayload });
    return;
  }

  if (!key) {
    res.status(500).json({ error: "VIATOR_API_KEY is not configured" });
    return;
  }

  try {
    const baseUrl = process.env.VIATOR_BASE_URL ?? DEFAULT_VIATOR_BASE_URL;
    const response = await fetch(`${baseUrl}/products/${productCode}`, {
      method: "GET",
      headers: buildHeaders(key),
    });

    if (!response.ok) {
      if (bundledPayload) {
        res.setHeader("X-Engine6-Source", "bundled-product-payload");
        res.status(200).json({ product: bundledPayload });
        return;
      }

      res.status(response.status).json({ error: await response.text() });
      return;
    }

    res.setHeader("X-Engine6-Source", "viator-api");
    res.status(200).json(await response.json());
  } catch (error: any) {
    if (bundledPayload) {
      res.setHeader("X-Engine6-Source", "bundled-product-payload");
      res.status(200).json({ product: bundledPayload });
      return;
    }

    res.status(500).json({ error: error?.message ?? "Viator request failed" });
  }
}
