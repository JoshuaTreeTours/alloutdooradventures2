import { extractEngine6Product } from "./viatorExtractors.js";

const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const buildDiagnostics = (hasViatorApiKey: boolean) => ({
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

  const key = process.env.VIATOR_API_KEY;
  const diagnostics = buildDiagnostics(Boolean(key));

  if (!key) {
    diagnostics.usedBundledFallbackBecause = "missing-api-key";
    res.status(500).json({
      source: "live-api",
      diagnostics,
      rawProductCode: productCode,
      rawProduct: null,
      extracted: extractEngine6Product(null).extracted,
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
    diagnostics.upstreamContentType = response.headers.get("content-type");
    diagnostics.upstreamOk = response.ok;

    if (!response.ok) {
      const details = await response.text();
      res.status(response.status).json({
        source: "live-api",
        diagnostics,
        rawProductCode: productCode,
        rawProduct: null,
        extracted: extractEngine6Product(null).extracted,
        error: `Viator API error ${response.status}: ${response.statusText}`,
        details: details.slice(0, 500),
      });
      return;
    }

    const rawBody = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      res.status(502).json({
        source: "live-api",
        diagnostics,
        rawProductCode: productCode,
        rawProduct: null,
        extracted: extractEngine6Product(null).extracted,
        error: "Viator API returned non-JSON payload",
        details: rawBody.slice(0, 500),
      });
      return;
    }

    const extraction = extractEngine6Product(payload);
    Object.assign(diagnostics, extraction.diagnostics);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=1800"
    );
    res.status(200).json({
      source: "live-api",
      diagnostics,
      rawProductCode: productCode,
      rawProduct: extraction.product,
      extracted: extraction.extracted,
    });
  } catch (error: any) {
    res.status(500).json({
      source: "live-api",
      diagnostics,
      rawProductCode: productCode,
      rawProduct: null,
      extracted: extractEngine6Product(null).extracted,
      error: error?.message ?? "Viator request failed",
    });
  }
}
