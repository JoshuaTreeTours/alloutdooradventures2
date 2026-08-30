/**
 * Live Viator public-page discovery for Kyoto (d332).
 * Run: npx tsx scripts/discover-kyoto-viator-catalog.ts
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
  "https://www.viator.com/Kyoto/d332-ttd",
  "https://www.viator.com/Kyoto-tours/Private-and-Custom-Tours/d332-g26",
  "https://www.viator.com/Kyoto-tours/Bike-Tours-Product-Tours-and-Sightseeing/d332-tag21702",
  "https://www.viator.com/Kyoto-tours/Hiking-and-Camping/d332-g9-c35",
  "https://www.viator.com/Kyoto-tours/Sake-Tasting-and-Brewery-Tours/d332-g6-c5635",
  "https://www.viator.com/Kyoto-tours/Helicopter-Tours/d332-g1-c2",
  "https://www.viator.com/Kyoto-tours/Full-day-Tours/d332-g12-c94",
  "https://www.viator.com/Kyoto-tours/Day-Trips-and-Excursions/d332-g5",
  "https://www.viator.com/Kyoto-tours/Cultural-and-Theme-Tours/d332-g6",
  "https://www.viator.com/Kyoto-tours/Walking-Tours/d332-g16-c56",
];

const SEEDED_PRODUCTS: Array<{ productCode: string; sourceUrl: string }> = [
  {
    productCode: "92136P37",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Half-day-Private-Custom-Tour-with-National-Licensed-Guide/d332-92136P37",
  },
  {
    productCode: "92136P55",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Full-day-Private-Custom-Tour-with-National-Licensed-Guide/d332-92136P55",
  },
  {
    productCode: "92136P49",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Private-Kyoto-Tour/d332-92136P49",
  },
  {
    productCode: "92136P349",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Early-Morning-Private-Tour-with-Government-Licensed-Guide/d332-92136P349",
  },
  {
    productCode: "21490P11",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Full-Day-Kyoto-Private-Custom-Walking-Tour/d332-21490P11",
  },
  {
    productCode: "285124P1",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/The-10-must-see-spots-in-Kyoto-one-day-private-tour/d332-285124P1",
  },
  {
    productCode: "2142KYO_N100",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Full-Day-Sightseeing-Tour-including-Nijo-Castle-and-Kiyomizu-Temple/d332-2142KYO_N100",
  },
  {
    productCode: "28575P18",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Perfect-Tour-Fushimi-Inari-Shrine-Kiyomizu-dera-Temple-and-More/d332-28575P18",
  },
  {
    productCode: "5522662P20",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Highlights-with-Nijo-Castle-Ticket-and-Bamboo-Forest/d332-5522662P20",
  },
  {
    productCode: "103013P3",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Best-of-Kyoto-Bike-Tour/d332-103013P3",
  },
  {
    productCode: "74401P5",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Mount-Takao-Hiking-Tour/d332-74401P5",
  },
  {
    productCode: "63670P15",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Sake-Brewery-and-Tasting-Tour-in-Kyoto/d332-63670P15",
  },
  {
    productCode: "374485P1",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Photography-Tour/d332-374485P1",
  },
  {
    productCode: "92281P2",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Your-Private-Vacation-Photography-Session-In-Kyoto/d332-92281P2",
  },
  {
    productCode: "102848P24",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Authentic-Japanese-Tea-Ceremony-with-certificated-teacher/d332-102848P24",
  },
  {
    productCode: "19221P4",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Private-Tea-Ceremony-Experience-and-Japanese-Lunch-in-Kyoto/d332-19221P4",
  },
  {
    productCode: "407697P2",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Nara-Private-tour-w-Hotel-pick-up-and-Drop-off-from-Kyoto/d332-407697P2",
  },
  {
    productCode: "374249P4",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Best-Day-trip-from-Kyoto-Ancient-Temples-and-Dreamy-Lantern-Shrines-Private-Car/d332-374249P4",
  },
  {
    productCode: "420350P4",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/KYOTO-Highlights-with-English-Speaking-Driver-Max-6-pax/d332-420350P4",
  },
  {
    productCode: "392082P1",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-city-tours-with-unlimited-sightseeing-per-day/d332-392082P1",
  },
  {
    productCode: "87343P19",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Kyoto-Day-Trip-using-Private-Car-with-English-Driver/d332-87343P19",
  },
  {
    productCode: "63670P28",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/Fushimi-Inari-Hidden-Hiking-Tour/d332-63670P28",
  },
  {
    productCode: "379832P2",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/A-Guided-Photoshoot-of-Fushimi-Inari-Shrine-and-Secret-Bamboo-Grove/d332-379832P2",
  },
  {
    productCode: "92136P21",
    sourceUrl:
      "https://www.viator.com/tours/Kyoto/1-Hour-Fushimi-Inari-taisha-Shrine-Guided-Walking-Tour/d332-92136P21",
  },
];

const PRODUCT_URL_PATTERNS = [
  /https:\/\/www\.viator\.com\/tours\/Kyoto\/[^"'\s]+?\/d332-([A-Z0-9_]+)/gi,
  /\/tours\/Kyoto\/[^"'\s]+?\/d332-([A-Z0-9_]+)/gi,
];

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only/i;

const PREFERRED_PATTERN =
  /private|jeep|4x4|off[- ]?road|helicopter|wine|sake|photography|photo|stargaz|hike|hiking|bike|cycling|kimono|tea|cultural|nara|arashiyama|fushimi/i;

const PREMIUM_PATTERN =
  /private|luxury|helicopter|jeep|4x4|off[- ]?road|wine|sake|photography|photo|stargaz|full[- ]?day|licensed/i;

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

const decodeJsonString = (value: string) =>
  value
    .replace(/\\n/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .trim();

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

  const usdPriceMatch =
    html.match(/From\s*US\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/From\s*\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i);
  const priceFrom = usdPriceMatch
    ? parseFloat(usdPriceMatch[1].replace(/,/g, ""))
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

  const currencyMatch =
    html.match(/"currency"\s*:\s*"([A-Z]{3})"/i) ??
    html.match(/From\s*(US\$|\$|€|£)/);
  const currencySymbol = currencyMatch?.[1] ?? null;
  const currency =
    currencySymbol === "US$" || currencySymbol === "$"
      ? "USD"
      : currencySymbol === "€"
        ? "EUR"
        : currencySymbol === "£"
          ? "GBP"
          : currencySymbol;

  const usdConfirmed =
    /From\s*US\$/i.test(html) ||
    (/\bUSD\b/.test(html) && priceFrom != null) ||
    (/From\s*\$/.test(html) && !/From\s*(?:€|£|CA\$|AU\$|A\$)/.test(html));

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
    overview,
    currency,
    usdConfirmed,
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
      console.log(`  ${found.length} product codes (${catalogPage.httpStatus})`);
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
            unavailable: !availability.available,
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
    "scripts/kyoto-viator-discovery-results.json",
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
    "scripts/kyoto-live-product-data.raw.json",
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
