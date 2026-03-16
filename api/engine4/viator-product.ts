import { getEngine4ViatorTourData } from "../../src/engine4/viator/viatorApi";

const STRICT_PRODUCT_CODE = "421920P2";

const toPositivePrice = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^0-9.\-]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
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

  try {
    const tour = await getEngine4ViatorTourData(productCode);

    if (!tour) {
      res.status(502).json({
        error: "Viator product data unavailable",
        productCode,
        runtimePath: "/api/engine4/viator-product",
      });
      return;
    }

    if (
      productCode === STRICT_PRODUCT_CODE &&
      tour.provenance?.apiFetchSucceeded !== true
    ) {
      res.status(502).json({
        error: "Live Viator API fetch failed for strict production product",
        productCode,
        details: {
          apiFetchAttempted: tour.provenance?.apiFetchAttempted ?? false,
          apiFetchSucceeded: tour.provenance?.apiFetchSucceeded ?? false,
          fallbackUsed: tour.provenance?.fallbackUsed ?? false,
        },
        runtimePath: "/api/engine4/viator-product",
      });
      return;
    }

    if (
      productCode === STRICT_PRODUCT_CODE &&
      !toPositivePrice(tour.fromPrice)
    ) {
      res.status(422).json({
        error: "Live Viator API price is missing or invalid",
        productCode,
        receivedFromPrice: tour.fromPrice ?? null,
        runtimePath: "/api/engine4/viator-product",
      });
      return;
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=1800"
    );
    res.status(200).json({
      productCode,
      runtimePath: "/api/engine4/viator-product",
      tour,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Viator product request failed",
      productCode,
      details: error?.message ?? String(error),
      runtimePath: "/api/engine4/viator-product",
    });
  }
}
