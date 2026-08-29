/**
 * Live Viator public-page discovery for Mexico City (d76).
 * Run: npx tsx scripts/discover-mexico-city-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

const CATALOG_URLS = [
  "https://www.viator.com/Mexico-tours/City-Tours/d76-g12-c5330",
  "https://www.viator.com/Mexico-City/d76-ttd",
  "https://www.viator.com/Mexico-tours/Day-Trips-and-Excursions/d76-g5",
  "https://www.viator.com/Mexico-tours/Outdoor-Activities/d76-g12",
  "https://www.viator.com/Mexico-tours/Private-and-Luxury/d76-g29",
  "https://www.viator.com/Mexico-tours/Air-Helicopter-and-Balloon-Tours/d76-g12-c2",
  "https://www.viator.com/Mexico-tours/Walking-and-Biking-Tours/d76-g21",
  "https://www.viator.com/Mexico-tours/Cultural-and-Theme-Tours/d76-g6",
  "https://www.viator.com/Mexico-tours/Food-Wine-and-Nightlife/d76-g6-c80",
];

const PRODUCT_URL_PATTERNS = [
  /https:\/\/www\.viator\.com\/tours\/Mexico-City\/[^"'\s]+?\/d76-([A-Z0-9_]+)/gi,
  /https:\/\/www\.viator\.com\/tours\/Mexico\/[^"'\s]+?\/d76-([A-Z0-9_]+)/gi,
  /\/tours\/Mexico-City\/[^"'\s]+?\/d76-([A-Z0-9_]+)/gi,
  /\/tours\/Mexico\/[^"'\s]+?\/d76-([A-Z0-9_]+)/gi,
];

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only/i;

const PREFERRED_PATTERN =
  /private|jeep|4x4|off[- ]?road|helicopter|balloon|wine|photography|stargaz|hike|hiking|bike|cycling|indigenous|native|teotihuacan|xochimilco|chapultepec|coyoac[aá]n/i;

const PREMIUM_PATTERN =
  /private|luxury|helicopter|balloon|jeep|4x4|off[- ]?road|wine|photography|stargaz|full[- ]?day/i;

const extractCatalogProducts = (html: string) => {
  const products = new Map<string, string>();

  for (const pattern of PRODUCT_URL_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of html.matchAll(pattern)) {
      const code = match[1].toUpperCase();
      const raw = match[0];
      const url = raw.startsWith("http")
        ? raw.replace(/[?#].*$/, "")
        : `https://www.viator.com${raw.replace(/[?#].*$/, "")}`;
      if (!products.has(code)) {
        products.set(code, url);
      }
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
    html.match(/From\s*US\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
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
  for (const match of html.matchAll(/"pointOfInterestName"\s*:\s*"([^"]+)"/gi)) {
    if (!itineraryStops.includes(match[1])) {
      itineraryStops.push(match[1]);
    }
  }

  const overviewMatch =
    html.match(/"overview"\s*:\s*"((?:\\.|[^"\\]){50,})"/i) ??
    html.match(/"description"\s*:\s*"((?:\\.|[^"\\]){80,})"/i);
  const overview = overviewMatch?.[1]
    ?.replace(/\\n/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .trim();

  const currencyMatch =
    html.match(/"currency"\s*:\s*"([A-Z]{3})"/i) ??
    html.match(/\b(USD|AUD|CAD|GBP|EUR|MXN|SGD|DKK|BRL)\b/);
  const currency = currencyMatch?.[1] ?? null;

  return {
    title,
    priceFrom,
    rating,
    reviewCount,
    duration,
    heroUrl,
    itineraryStops,
    categories,
    overview: overview ?? null,
    currency,
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const products = new Map<string, string>();

  for (const catalogUrl of CATALOG_URLS) {
    console.log(`Fetching catalog: ${catalogUrl}`);
    try {
      const catalogPage = await fetchViatorPublicPage(catalogUrl);
      const found = extractCatalogProducts(catalogPage.html);
      console.log(`  ${found.length} product codes (${catalogPage.httpStatus})`);
      for (const item of found) {
        if (!products.has(item.productCode)) {
          products.set(item.productCode, item.sourceUrl);
        }
      }
    } catch (error) {
      console.log(`  ERR catalog: ${error}`);
    }
    await sleep(500);
  }

  const candidates = [...products.entries()].map(([productCode, sourceUrl]) => ({
    productCode,
    sourceUrl,
  }));
  console.log(`\nUnique catalog product codes: ${candidates.length}`);

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
      const haystack = `${extracted.title ?? ""} ${extracted.categories.join(" ")}`;
      const titleRejected = Boolean(
        extracted.title && REJECT_TITLE_PATTERN.test(extracted.title)
      );
      const usdRejected = extracted.currency != null && extracted.currency !== "USD";
      const priceRejected =
        extracted.priceFrom === null || extracted.priceFrom <= 50;
      const heroRejected = !extracted.heroUrl;
      const ratingRejected =
        extracted.rating == null || extracted.reviewCount == null;

      const entry = {
        ...candidate,
        available: availability.available,
        availabilityReason: availability.reason,
        httpStatus: page.httpStatus,
        finalUrl: page.finalUrl,
        preferred: PREFERRED_PATTERN.test(haystack),
        premium: PREMIUM_PATTERN.test(haystack) || (extracted.priceFrom ?? 0) >= 150,
        ...extracted,
      };

      if (
        availability.available &&
        extracted.title &&
        !titleRejected &&
        !usdRejected &&
        !priceRejected &&
        !heroRejected &&
        !ratingRejected
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom}, ${extracted.rating}/${extracted.reviewCount})`
        );
      } else {
        rejected.push({
          ...entry,
          rejectReasons: {
            titleRejected,
            usdRejected,
            priceRejected,
            heroRejected,
            ratingRejected,
          },
        });
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} title=${extracted.title ?? "n/a"} price=${extracted.priceFrom} currency=${extracted.currency}`
        );
      }
    } catch (error) {
      rejected.push({
        ...candidate,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`ERR ${candidate.productCode}: ${error}`);
    }

    await sleep(400);
  }

  results.sort((a, b) => {
    const preferredDelta =
      Number(Boolean(b.preferred)) - Number(Boolean(a.preferred));
    if (preferredDelta) {
      return preferredDelta;
    }
    return ((b.reviewCount as number) ?? 0) - ((a.reviewCount as number) ?? 0);
  });

  writeFileSync(
    "scripts/mexico-city-viator-discovery-results.json",
    `${JSON.stringify(
      {
        catalogCount: candidates.length,
        availableCount: results.length,
        rejectedCount: rejected.length,
        available: results,
        rejected,
      },
      null,
      2
    )}\n`
  );
  writeFileSync(
    "scripts/mexico-city-live-product-data.json",
    `${JSON.stringify(results, null, 2)}\n`
  );

  console.log(
    `\nAvailable: ${results.length}, Rejected: ${rejected.length}, Premium-flagged: ${results.filter(r => r.premium).length}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
