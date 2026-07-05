/**
 * Fetch live Viator public page data for Moab catalog candidates.
 * Run: npx tsx scripts/fetch-moab-live-product-data.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

type CatalogEntry = {
  productCode: string;
  sourceUrl: string;
};

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

  const priceMatch =
    html.match(/From[\s$€£]*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i) ??
    html.match(/"price"\s*:\s*([0-9.]+)/i);
  const priceFrom = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : null;

  const ratingMatch =
    html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i) ??
    html.match(/"averageRating"\s*:\s*([0-9.]+)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  const reviewMatch =
    html.match(/"totalReviews"\s*:\s*(\d+)/i) ??
    html.match(/"reviewCount"\s*:\s*(\d+)/i) ??
    html.match(/(\d[\d,]*)\s+Reviews/i);
  const reviewCount = reviewMatch
    ? parseInt(reviewMatch[1].replace(/,/g, ""), 10)
    : null;

  const durationMatch = html.match(
    /(\d+(?:\s*to\s*\d+)?\s*(?:hours?|minutes?|days?)(?:\s*\d+\s*minutes?)?(?:\s*\(approx\.\))?)/i
  );
  const duration = durationMatch?.[1] ?? null;

  const heroMatch =
    html.match(
      /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"'\s]+/i
    ) ??
    html.match(
      /https:\/\/dynamic-media\.tacdn\.com\/media\/photo-o\/[^"'\s]+/i
    );
  const heroUrl = heroMatch?.[0] ?? null;

  const categories: string[] = [];
  for (const match of html.matchAll(/"categoryName"\s*:\s*"([^"]+)"/gi)) {
    if (!categories.includes(match[1])) {
      categories.push(match[1]);
    }
  }

  const itineraryStops: string[] = [];
  for (const match of html.matchAll(/"pointOfInterestName"\s*:\s*"([^"]+)"/gi)) {
    if (!itineraryStops.includes(match[1])) {
      itineraryStops.push(match[1]);
    }
  }

  const overviewMatch = html.match(/"overview"\s*:\s*"([^"]{50,})"/i);
  const overview = overviewMatch?.[1]?.replace(/\\n/g, " ").trim() ?? null;

  return {
    title,
    priceFrom,
    rating,
    reviewCount,
    duration,
    heroUrl,
    itineraryStops,
    categories,
    overview,
  };
};

const main = async () => {
  const candidates = JSON.parse(
    readFileSync("scripts/moab-catalog-products.json", "utf8")
  ) as CatalogEntry[];

  const results: Record<string, unknown>[] = [];
  const rejected: Record<string, unknown>[] = [];

  for (const candidate of candidates) {
    try {
      const page = await fetchViatorPublicPage(candidate.sourceUrl);
      const availability = assessViatorPublicPageAvailability({
        productCode: candidate.productCode,
        sourceUrl: candidate.sourceUrl,
        html: page.html,
        finalUrl: page.finalUrl,
        httpStatus: page.httpStatus,
      });

      const extracted = extractFromHtml(page.html);
      const entry = {
        productCode: candidate.productCode,
        productUrl: candidate.sourceUrl,
        priceFrom: extracted.priceFrom
          ? `From $${extracted.priceFrom.toFixed(2)}`
          : null,
        rating: extracted.rating,
        reviewCount: extracted.reviewCount ?? 0,
        duration: extracted.duration ?? "TBD (approx.)",
        heroUrl: extracted.heroUrl ?? "",
        overview: extracted.overview,
        itineraryStops: extracted.itineraryStops,
        categories: extracted.categories,
        title: extracted.title,
        available: availability.available,
        availabilityReason: availability.reason,
      };

      if (
        availability.available &&
        extracted.title &&
        extracted.priceFrom &&
        extracted.priceFrom > 50 &&
        extracted.heroUrl
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom})`
        );
      } else {
        rejected.push(entry);
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} price=${extracted.priceFrom} hero=${!!extracted.heroUrl}`
        );
      }
    } catch (error) {
      rejected.push({
        ...candidate,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`ERR ${candidate.productCode}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  writeFileSync(
    "scripts/moab-live-product-data.json",
    `${JSON.stringify(results, null, 2)}\n`
  );
  writeFileSync(
    "scripts/moab-viator-discovery-results.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );

  const premiumCount = results.filter(
    r => parseFloat(String((r as { priceFrom?: string }).priceFrom).replace(/[^\d.]/g, "")) > 100
  ).length;
  console.log(
    `\nAvailable: ${results.length}, Rejected: ${rejected.length}, Over $100: ${premiumCount}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
