import { fetchViator } from "./client";

type ViatorSearchRequest = {
  destinationId: number;
  count: number;
  currency?: string;
  language?: string;
  sortOrder?: string;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "VIATOR_API_KEY is not configured" });
    return;
  }

  const destinationId = Number(req.query?.destinationId ?? 684);
  const count = Number(req.query?.limit ?? 12);

  const body: ViatorSearchRequest = {
    destinationId,
    count,
    currency: "USD",
    language: "en",
    sortOrder: "POPULARITY",
  };

  try {
    const data = await fetchViator(apiKey, "/products/search", {
      method: "POST",
      body: JSON.stringify(body),
    });

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=86400"
    );
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Viator request failed" });
  }
}
