/**
 * Live Viator public-page discovery for Singapore (d18 / d60449).
 * Run: npx tsx scripts/discover-singapore-viator-catalog.ts
 *
 * SGD uses "$" / "S$". Bare "$" is NEVER treated as USD.
 * Only US$ or JSON-LD priceCurrency=USD counts as verified USD.
 */
import { writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

const execFileAsync = promisify(execFile);

const CATALOG_URLS = [
  "https://www.viator.com/Singapore/d18-ttd",
  "https://www.viator.com/Singapore/d60449-ttd",
  "https://www.viator.com/Singapore-tours/Private-and-Custom-Tours/d18-g26",
  "https://www.viator.com/Singapore-tours/Private-and-Custom-Tours/d60449-g26",
  "https://www.viator.com/Singapore-tours/Food-Tours/d18-g6-c80",
  "https://www.viator.com/Singapore-tours/Food-Tours/d60449-g6-c80",
  "https://www.viator.com/Singapore-tours/Bike-Tours/d18-g16-c84",
  "https://www.viator.com/Singapore-tours/Hiking-and-Camping/d18-g9-c35",
  "https://www.viator.com/Singapore-tours/Helicopter-Tours/d18-g1-c2",
  "https://www.viator.com/Singapore-tours/Walking-Tours/d18-g16-c56",
  "https://www.viator.com/Singapore-tours/Walking-Tours/d60449-g16-c56",
  "https://www.viator.com/Singapore-tours/Cultural-and-Theme-Tours/d18-g6",
  "https://www.viator.com/Singapore-tours/Day-Trips-and-Excursions/d18-g5",
  "https://www.viator.com/Singapore-tours/Full-day-Tours/d18-g12-c94",
  "https://www.viator.com/Singapore-tours/Half-day-Tours/d18-g12-c95",
  "https://www.viator.com/Singapore-tours/Photography-Tours/d18-g16-c26",
  "https://www.viator.com/Singapore-tours/Water-Sports/d18-g21",
  "https://www.viator.com/Singapore-tours/Boat-Tours-and-Cruises/d18-g8",
  "https://www.viator.com/Singapore-tours/Historical-and-Heritage-Tours/d18-g6-c10",
];

const SEEDED_PRODUCTS: Array<{ productCode: string; sourceUrl: string }> = [
  {
    productCode: "24380P991",
    sourceUrl:
      "https://www.viator.com/tours/Singapore/Singapore-Street-Food-Hawker-Centre-Tastings-Private-Tour/d60449-24380P991",
  },
  {
    productCode: "9592P192",
    sourceUrl:
      "https://www.viator.com/tours/Singapore/Private-Singapore-Customized-Tour-With-Driver-in-small-group/d60449-9592P192",
  },
  {
    productCode: "40856P8",
    sourceUrl:
      "https://www.viator.com/tours/Singapore/Private-Tour-Singapore-Unique-Night-Tour-Including-Trishaw-Ride-and-Bumboat-Ride/d60449-40856P8",
  },
  {
    productCode: "40856P7",
    sourceUrl:
      "https://www.viator.com/tours/Singapore/Private-Night-Sightseeing-Tour-with-River-Cruise-from-Singapore/d60449-40856P7",
  },
  {
    productCode: "57811P2",
    sourceUrl:
      "https://www.viator.com/tours/Singapore/Marina-Bay-Night-Cycling-Tour/d60449-57811P2",
  },
  {
    productCode: "3695NSC",
    sourceUrl:
      "https://www.viator.com/tours/Singapore/Singapore-Night-Safari-with-optional-Buffet-Dinner/d60449-3695NSC",
  },
  {
    productCode: "3695SINFABERDINING",
    sourceUrl:
      "https://www.viator.com/tours/Singapore/Luxury-Sky-Dining-Experience-on-the-Singapore-Cable-Car/d60449-3695SINFABERDINING",
  },
];

const PRODUCT_URL_PATTERNS = [
  /https:\/\/www\.viator\.com\/(?:en-[A-Z]{2}\/)?tours\/Singapore\/[^"'\s]+?\/d(?:18|60449)-([A-Z0-9_]+)/gi,
  /\/tours\/Singapore\/[^"'\s]+?\/d(?:18|60449)-([A-Z0-9_]+)/gi,
];

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only|ticket only|entry ticket|universal studios ticket|skip the line ticket(?!.*tour)/i;

const PREFERRED_PATTERN =
  /private|helicopter|wine|food|hawker|photography|photo|stargaz|hike|hiking|bike|cycling|cultural|heritage|historical|kayak|boat|cruise|night safari|gardens by the bay|marina bay|chinatown|little india|kampong|peranakan|pulau ubin|macritchie|southern ridges|sentosa|cable car|skyline/i;

const PREMIUM_PATTERN =
  /private|luxury|helicopter|photography|photo|full[- ]?day|licensed|sky dining|premium|exclusive|custom/i;

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
      const canonical = url.replace(/\/en-[A-Z]{2}\//i, "/");
      if (!products.has(code)) {
        products.set(code, canonical);
      }
    }
  }

  return [...products.entries()].map(([productCode, sourceUrl]) => ({
    productCode,
    sourceUrl,
  }));
};

const decodeJsonString = (value: string) =>
  value
    .replace(/\\n/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .trim();

const extractIsoCurrencies = (html: string) => {
  const currencies = new Set<string>();
  for (const match of html.matchAll(
    /"priceCurrency"\s*:\s*"([A-Z]{3})"/gi
  )) {
    currencies.add(match[1].toUpperCase());
  }
  for (const match of html.matchAll(/"currency"\s*:\s*"([A-Z]{3})"/gi)) {
    currencies.add(match[1].toUpperCase());
  }
  return [...currencies];
};

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

  const jsonLdUsdAmount =
    html.match(
      /"priceCurrency"\s*:\s*"USD"[\s\S]{0,180}?"price"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]{2})?)"?/i
    ) ??
    html.match(
      /"price"\s*:\s*"?([0-9][0-9,]*(?:\.[0-9]{2})?)"?[\s\S]{0,180}?"priceCurrency"\s*:\s*"USD"/i
    );
  const usDollarFromMatch = html.match(
    /From\s*US\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const jsonFromPrice = html.match(/"fromPrice"\s*:\s*([0-9.]+)/i);

  const isoCurrencies = extractIsoCurrencies(html);
  const displayedFromIsSgd = /From\s*(?:S\$|SG\$|SGD)\s*[0-9]/i.test(html);
  const displayedFromIsUsDollar = /From\s*US\$\s*[0-9]/i.test(html);
  const jsonLdHasUsd = /"priceCurrency"\s*:\s*"USD"/i.test(html);
  const jsonLdHasSgd = /"priceCurrency"\s*:\s*"SGD"/i.test(html);

  const hasExplicitUsd = displayedFromIsUsDollar || jsonLdHasUsd;

  // CRITICAL: never treat bare "$" / SGD as USD.
  const usdConfirmed =
    hasExplicitUsd && !displayedFromIsSgd && !(jsonLdHasSgd && !displayedFromIsUsDollar);

  const priceFromRaw = usdConfirmed
    ? usDollarFromMatch?.[1] ??
      jsonLdUsdAmount?.[1] ??
      jsonFromPrice?.[1] ??
      null
    : null;
  const priceFrom = priceFromRaw
    ? parseFloat(priceFromRaw.replace(/,/g, ""))
    : null;

  const ratingMatch =
    html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i) ??
    html.match(/"averageRating"\s*:\s*([0-9.]+)/i) ??
    html.match(/([0-9]\.[0-9])\s+based on/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  const reviewMatch =
    html.match(/"totalReviews"\s*:\s*(\d+)/i) ??
    html.match(/"reviewCount"\s*:\s*(\d+)/i) ??
    html.match(/(\d[\d,]*)\s+Reviews/i) ??
    html.match(/based on\s+(\d[\d,]*)\s+reviews/i);
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
  const fallbackHero = html.match(
    /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-360x240\/([^"'\s]+)/i
  );
  const heroUrl =
    heroMatch?.[0] ??
    (fallbackHero
      ? `https://media.tacdn.com/media/attractions-splice-spp-674x446/${fallbackHero[1]}`
      : null);

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
  for (const match of html.matchAll(/"attractionName"\s*:\s*"([^"]+)"/gi)) {
    if (!itineraryStops.includes(match[1])) {
      itineraryStops.push(match[1]);
    }
  }

  const overviewMatch =
    html.match(/"overview"\s*:\s*"((?:\\.|[^"\\]){50,})"/i) ??
    html.match(/"description"\s*:\s*"((?:\\.|[^"\\]){80,})"/i);
  const overview = overviewMatch?.[1]
    ? decodeJsonString(overviewMatch[1])
    : null;

  const inclusions: string[] = [];
  for (const match of html.matchAll(/"inclusion"\s*:\s*"([^"]+)"/gi)) {
    if (!inclusions.includes(match[1])) {
      inclusions.push(match[1]);
    }
  }

  const highlights: string[] = [];
  for (const match of html.matchAll(/"highlight"\s*:\s*"([^"]+)"/gi)) {
    if (!highlights.includes(match[1])) {
      highlights.push(match[1]);
    }
  }

  const startMatch =
    html.match(/"startLocation"[\s\S]{0,400}?"description"\s*:\s*"([^"]+)"/i) ??
    html.match(/Meeting point[\s\S]{0,200}?<[^>]+>([^<]{12,180})/i);
  const startDescription = startMatch?.[1]
    ? decodeJsonString(startMatch[1])
    : null;

  return {
    title,
    priceFrom,
    rating,
    reviewCount,
    duration,
    heroUrl,
    itineraryStops,
    categories,
    inclusions,
    highlights,
    overview,
    startDescription,
    isoCurrencies,
    displayedFromIsSgd,
    displayedFromIsUsDollar,
    jsonLdHasUsd,
    jsonLdHasSgd,
    hasExplicitUsd,
    usdConfirmed,
    currency: usdConfirmed ? "USD" : isoCurrencies[0] ?? null,
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithCurl = async (url: string) => {
  const { stdout } = await execFileAsync(
    "curl",
    [
      "-sL",
      "--max-time",
      "40",
      "-A",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "-H",
      "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "-H",
      "Accept-Language: en-US,en;q=0.9",
      "-H",
      "Cache-Control: no-cache",
      "--compressed",
      url,
    ],
    { maxBuffer: 12 * 1024 * 1024 }
  );
  return stdout;
};

const fetchPage = async (sourceUrl: string) => {
  const usdUrl = sourceUrl.includes("?")
    ? `${sourceUrl}&currency=USD`
    : `${sourceUrl}?currency=USD`;

  try {
    const page = await fetchViatorPublicPage(usdUrl);
    if (
      page.httpStatus < 400 &&
      page.html.length > 4000 &&
      !/datadome|captcha/i.test(page.html)
    ) {
      return page;
    }
  } catch {
    // fall through to curl
  }

  const html = await fetchWithCurl(usdUrl);
  return {
    html,
    finalUrl: usdUrl,
    httpStatus: html.length > 2000 ? 200 : 0,
  };
};

const main = async () => {
  const products = new Map<string, string>();
  for (const seeded of SEEDED_PRODUCTS) {
    products.set(seeded.productCode, seeded.sourceUrl);
  }

  for (const catalogUrl of CATALOG_URLS) {
    console.log(`Fetching catalog: ${catalogUrl}`);
    try {
      const catalogPage = await fetchPage(catalogUrl);
      const found = extractCatalogProducts(catalogPage.html);
      console.log(
        `  ${found.length} product codes (http ${catalogPage.httpStatus}, ${catalogPage.html.length} bytes)`
      );
      for (const item of found) {
        if (!products.has(item.productCode)) {
          products.set(item.productCode, item.sourceUrl);
        }
      }
    } catch (error) {
      console.log(`  ERR catalog: ${error}`);
    }
    await sleep(400);
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
      const page = await fetchPage(candidate.sourceUrl);
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
      const usdRejected = !extracted.usdConfirmed || extracted.priceFrom == null;
      const priceRejected =
        extracted.priceFrom === null || extracted.priceFrom <= 40;
      const heroRejected = !extracted.heroUrl;
      const ratingRejected =
        extracted.rating == null || extracted.reviewCount == null;

      const entry = {
        ...candidate,
        available: availability.available,
        availabilityReason: availability.reason,
        httpStatus: page.httpStatus,
        htmlBytes: page.html.length,
        finalUrl: page.finalUrl,
        preferred: PREFERRED_PATTERN.test(haystack),
        premium:
          PREMIUM_PATTERN.test(haystack) || (extracted.priceFrom ?? 0) >= 150,
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
          `OK ${candidate.productCode}: ${extracted.title} (USD ${extracted.priceFrom}, ${extracted.rating}/${extracted.reviewCount})`
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
            unavailable: !availability.available,
          },
        });
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} title=${extracted.title ?? "n/a"} price=${extracted.priceFrom} currency=${extracted.currency} usd=${extracted.usdConfirmed} html=${page.html.length}`
        );
      }
    } catch (error) {
      rejected.push({
        ...candidate,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`ERR ${candidate.productCode}: ${error}`);
    }

    await sleep(350);
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
    "scripts/singapore-viator-discovery-results.json",
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
    "scripts/singapore-live-product-data.raw.json",
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
