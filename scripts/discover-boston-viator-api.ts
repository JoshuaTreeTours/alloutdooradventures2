/**
 * One-off: search Viator partner API for Boston (d678) products.
 * Run: npx tsx scripts/discover-boston-viator-api.ts
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";

import { fetchViatorProduct, fetchViatorWithCurl } from "../lib/viator";

const VIATOR_BASE_URL = "https://api.viator.com/partner";
const DESTINATION_ID = 678;

const getApiKey = () => {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) {
    throw new Error("VIATOR_API_KEY is required");
  }
  return apiKey;
};

const searchBostonProducts = async (apiKey: string, count: number) => {
  const body = JSON.stringify({
    destinationId: DESTINATION_ID,
    count,
    currency: "USD",
    language: "en",
    sortOrder: "POPULARITY",
  });

  const { status, body: responseBody } = await fetchViatorWithCurl(
    `${VIATOR_BASE_URL}/products/search`,
    apiKey,
    { method: "POST", body }
  );

  if (status < 200 || status >= 300) {
    throw new Error(`Viator search error ${status}: ${responseBody.slice(0, 500)}`);
  }

  const data = JSON.parse(responseBody) as {
    products?: Array<{ productCode?: string }>;
  };
  return data.products ?? [];
};

const extractHeroUrl = (product: Record<string, unknown>) => {
  const images = product.images as
    | Array<{ isCover?: boolean; variants?: Array<{ url?: string; height?: number }> }>
    | undefined;
  if (!images?.length) return null;

  const cover = images.find(img => img.isCover) ?? images[0];
  const variants = cover.variants ?? [];
  const preferred =
    variants.find(v => v.height === 446 || v.height === 674) ??
    variants.find(v => v.url?.includes("attractions-splice")) ??
    variants[0];
  return preferred?.url ?? null;
};

const main = async () => {
  const apiKey = getApiKey();
  const searchResults = await searchBostonProducts(apiKey, 100);
  const productCodes = searchResults
    .map(p => p.productCode)
    .filter((code): code is string => Boolean(code));

  console.log(`Found ${productCodes.length} product codes from search`);

  const enriched = [];
  for (const productCode of productCodes.slice(0, 60)) {
    try {
      const raw = (await fetchViatorProduct(productCode)) as Record<string, unknown>;
      const title = String(raw.title ?? "");
      const productUrl = String(raw.productUrl ?? "");
      const reviews = raw.reviews as
        | { combinedAverageRating?: number; totalReviews?: number }
        | undefined;
      const pricing = raw.pricing as
        | { summary?: { fromPrice?: number } }
        | undefined;
      const duration = String(raw.duration ?? "");
      const heroUrl = extractHeroUrl(raw);
      const description = (raw.description as { text?: string } | undefined)?.text ?? "";
      const titleLower = title.toLowerCase();
      const descLower = description.toLowerCase();

      const rejectReasons: string[] = [];
      if (/audio tour|self[- ]guided|gps tour|app tour|smartphone/i.test(titleLower + descLower)) {
        rejectReasons.push("audio/self-guided");
      }
      if (!heroUrl || !heroUrl.includes("attractions-splice")) {
        rejectReasons.push("no product-specific hero");
      }
      if (!productUrl.includes("/Boston/") && !productUrl.includes("/Boston-")) {
        rejectReasons.push("non-Boston URL");
      }

      enriched.push({
        productCode,
        productUrl,
        title,
        priceFrom: pricing?.summary?.fromPrice ?? null,
        rating: reviews?.combinedAverageRating ?? null,
        reviewCount: reviews?.totalReviews ?? 0,
        duration,
        heroUrl,
        rejectReasons,
        categories: ((raw.tags as Array<{ tagName?: string }> | undefined) ?? [])
          .map(t => t.tagName)
          .filter(Boolean)
          .slice(0, 5),
      });
      console.log(`${productCode}: ${title.slice(0, 60)}... hero=${heroUrl ? "yes" : "no"}`);
    } catch (error) {
      console.warn(`Failed ${productCode}:`, error instanceof Error ? error.message : error);
    }
  }

  writeFileSync(
    "scripts/boston-viator-api-discovery.json",
    JSON.stringify({ productCodes, enriched }, null, 2)
  );
  console.log(`Wrote scripts/boston-viator-api-discovery.json (${enriched.length} enriched)`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
