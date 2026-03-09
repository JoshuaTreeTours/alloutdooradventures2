import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";
const ENGINE5_EXACT_PAYLOAD_PRODUCT_CODE = "132218P209";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const getBundledExactProductPayload = async (productCode: string) => {
  if (productCode !== ENGINE5_EXACT_PAYLOAD_PRODUCT_CODE) {
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
  if (!key && bundledPayload) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=1800"
    );
    res.setHeader("X-Engine5-Source", "bundled-exact-product-payload");
    res.status(200).json({ product: bundledPayload });
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
      if (bundledPayload) {
        res.setHeader(
          "Cache-Control",
          "public, s-maxage=300, stale-while-revalidate=1800"
        );
        res.setHeader("X-Engine5-Source", "bundled-exact-product-payload");
        res.status(200).json({ product: bundledPayload });
        return;
      }

      const body = await response.text();
      res.status(response.status).json({
        error: `Viator API error ${response.status}: ${response.statusText}`,
        details: body,
      });
      return;
    }

    const payload = await response.json();
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=1800"
    );
    res.status(200).json(payload);
  } catch (error: any) {
    if (bundledPayload) {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=1800"
      );
      res.setHeader("X-Engine5-Source", "bundled-exact-product-payload");
      res.status(200).json({ product: bundledPayload });
      return;
    }

    res.status(500).json({ error: error?.message ?? "Viator request failed" });
  }
}
