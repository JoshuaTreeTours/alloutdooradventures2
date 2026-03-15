const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
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
  if (!key) {
    res
      .status(500)
      .json({ error: "VIATOR_API_KEY is not configured for Engine6" });
    return;
  }

  const baseUrl = process.env.VIATOR_BASE_URL ?? DEFAULT_VIATOR_BASE_URL;

  try {
    const response = await fetch(`${baseUrl}/products/${productCode}`, {
      method: "GET",
      headers: buildHeaders(key),
    });

    if (!response.ok) {
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
      "public, s-maxage=300, stale-while-revalidate=1200"
    );
    res.status(200).json(payload);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Viator request failed" });
  }
}
