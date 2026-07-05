/**
 * One-off discovery: live Viator public page data for Rocky Mountain National Park catalog.
 * Run: npx tsx scripts/discover-rocky-mountain-national-park-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

const CATALOG_URL =
  "https://www.viator.com/Rocky-Mountain-National-Park/d51194-ttd";

const REJECT_TITLE_PATTERN =
  /\b(audio\s+tour|self[- ]?guided|gps\s+guide|mobile\s+app|smartphone|downloadable)\b/i;

const extractCatalogProducts = (html: string) => {
  const products = new Map<string, string>();

  for (const match of html.matchAll(
    /https:\/\/www\.viator\.com\/tours\/[^"'\s]+?\/d51194-([A-Z0-9_]+)/gi
  )) {
    products.set(match[1].toUpperCase(), match[0]);
  }

  for (const match of html.matchAll(
    /\/tours\/[^"'\s]+?\/d51194-([A-Z0-9_]+)/gi
  )) {
    const code = match[1].toUpperCase();
    if (!products.has(code)) {
      products.set(code, `https://www.viator.com${match[0]}`);
    }
  }

  return [...products.entries()].map(([productCode, sourceUrl]) => ({
    productCode,
    sourceUrl,
  }));
};

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

  const priceMatch =
    html.match(/From[\s$€£]*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i) ??
    html.match(/"price"\s*:\s*([0-9.]+)/i);
  const priceFrom = priceMatch
    ? parseFloat(priceMatch[1].replace(/,/g, ""))
    : null;

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
  for (const match of html.matchAll(
    /"pointOfInterestName"\s*:\s*"([^"]+)"/gi
  )) {
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
  console.log(`Fetching catalog: ${CATALOG_URL}`);
  const catalogPage = await fetchViatorPublicPage(CATALOG_URL);
  const candidates = extractCatalogProducts(catalogPage.html);
  console.log(`Found ${candidates.length} catalog product codes`);

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
        ...candidate,
        available: availability.available,
        availabilityReason: availability.reason,
        httpStatus: page.httpStatus,
        finalUrl: page.finalUrl,
        ...extracted,
      };

      const titleRejected =
        extracted.title && REJECT_TITLE_PATTERN.test(extracted.title);
      const priceRejected =
        extracted.priceFrom !== null && extracted.priceFrom < 50;

      if (
        availability.available &&
        extracted.title &&
        extracted.priceFrom &&
        extracted.priceFrom >= 50 &&
        !titleRejected
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom}, ${extracted.reviewCount ?? "?"} reviews)`
        );
      } else {
        rejected.push({
          ...entry,
          rejectReason: titleRejected
            ? "weak-commercial-title"
            : priceRejected
              ? "under-50"
              : "unavailable-or-incomplete",
        });
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} title=${!!extracted.title} price=${extracted.priceFrom}`
        );
      }
    } catch (error) {
      rejected.push({
        ...candidate,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`ERR ${candidate.productCode}: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 400));
  }

  results.sort((a, b) => (b.priceFrom as number) - (a.priceFrom as number));

  writeFileSync(
    "scripts/rocky-mountain-national-park-viator-discovery-results.json",
    `${JSON.stringify({ catalogCount: candidates.length, available: results, rejected }, null, 2)}\n`
  );
  writeFileSync(
    "scripts/rocky-mountain-national-park-live-product-data.json",
    `${JSON.stringify(results, null, 2)}\n`
  );
  console.log(`\nAvailable: ${results.length}, Rejected: ${rejected.length}`);
  console.log(
    `Over $100: ${results.filter(r => (r.priceFrom as number) >= 100).length}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
