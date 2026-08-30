/**
 * Live Viator public-page discovery for Bangkok (d343).
 * Run: npx tsx scripts/discover-bangkok-viator-catalog.ts
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
  "https://www.viator.com/Bangkok/d343-ttd",
  "https://www.viator.com/Bangkok-tours/Private-and-Custom-Tours/d343-g26",
  "https://www.viator.com/Bangkok-tours/Bike-Tours/d343-g16-c57",
  "https://www.viator.com/Bangkok-tours/Walking-Tours/d343-g16-c56",
  "https://www.viator.com/Bangkok-tours/Food-Tours/d343-g6-c80",
  "https://www.viator.com/Bangkok-tours/Day-Trips-and-Excursions/d343-g5",
  "https://www.viator.com/Bangkok-tours/Full-day-Tours/d343-g12-c94",
  "https://www.viator.com/Bangkok-tours/Cultural-and-Theme-Tours/d343-g6",
  "https://www.viator.com/Bangkok-tours/Helicopter-Tours/d343-g1-c2",
  "https://www.viator.com/Bangkok-tours/Cruises-Sailing-and-Water-Tours/d343-g4",
  "https://www.viator.com/Bangkok-tours/Photography-Tours/d343-g12-c9",
  "https://www.viator.com/Bangkok-tours/Hiking-and-Camping/d343-g9-c35",
  "https://www.viator.com/Bangkok-tours/Adventure-Tours/d343-g12-c13",
  "https://www.viator.com/Bangkok-tours/Half-day-Tours/d343-g12-c95",
  "https://www.viator.com/Bangkok-tours/Historical-and-Heritage-Tours/d343-g6-c15",
  "https://www.viator.com/Bangkok-tours/Night-Tours/d343-g12-c96",
];

const SEEDED_PRODUCTS: Array<{ productCode: string; sourceUrl: string }> = [
  {
    productCode: "24380P161",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Private-Day-Trip-to-Ayutthaya-from-Bangkok/d343-24380P161",
  },
  {
    productCode: "35944P21",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Full-Day-Floating-Market-Grand-Palace-and-Temple-Tour-from-Bangkok/d343-35944P21",
  },
  {
    productCode: "3841THAILAND",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Bangkok-Temple-and-Grand-Palace-Tour/d343-3841THAILAND",
  },
  {
    productCode: "2280BKKTEMPLE",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Bangkok-Temples-and-Grand-Palace-Tour/d343-2280BKKTEMPLE",
  },
  {
    productCode: "2280FLOAT",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Floating-Markets-and-Thai-Countryside-Tour/d343-2280FLOAT",
  },
  {
    productCode: "2280AYU",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Ayutthaya-Day-Trip-from-Bangkok/d343-2280AYU",
  },
  {
    productCode: "5643P1",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Bangkok-Old-City-Bicycle-Tour/d343-5643P1",
  },
  {
    productCode: "5643P2",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Bangkok-Backstreets-Bicycle-Tour/d343-5643P2",
  },
  {
    productCode: "5643P5",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Bangkok-Green-Lung-Bicycle-Tour/d343-5643P5",
  },
  {
    productCode: "22115P1",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Bangkok-Food-Tour/d343-22115P1",
  },
  {
    productCode: "14515P1",
    sourceUrl:
      "https://www.viator.com/tours/Bangkok/Chinatown-Food-Tour/d343-14515P1",
  },
];

const PRODUCT_URL_PATTERNS = [
  /https:\/\/www\.viator\.com\/tours\/Bangkok\/[^"'\s]+?\/d343-([A-Z0-9_]+)/gi,
  /\/tours\/Bangkok\/[^"'\s]+?\/d343-([A-Z0-9_]+)/gi,
];

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only|skip the line ticket only|e-ticket only/i;

const PREFERRED_PATTERN =
  /private|jeep|4x4|off[- ]?road|helicopter|wine|sake|photography|photo|stargaz|hike|hiking|bike|cycling|food|cooking|cultural|ayutthaya|floating|canal|river|grand palace|wat pho|wat arun|chinatown/i;

const PREMIUM_PATTERN =
  /private|luxury|helicopter|jeep|4x4|off[- ]?road|wine|photography|photo|stargaz|full[- ]?day|licensed/i;

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

  const fromUsMatch = html.match(
    /From\s*US\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const fromDollarMatch = html.match(
    /From\s*\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const fromPriceJson = html.match(/"fromPrice"\s*:\s*([0-9.]+)/i);
  const thbMatch =
    html.match(/From\s*฿\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/) ??
    html.match(/From\s*THB\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i);
  const jpyMatch = html.match(/From\s*¥\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  const eurMatch = html.match(/From\s*€\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  const gbpMatch = html.match(/From\s*£\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);

  const localCurrencyDetected = Boolean(
    thbMatch ||
      jpyMatch ||
      eurMatch ||
      gbpMatch ||
      /From\s*(?:CA\$|AU\$|A\$|R\$|S\/|MX\$|NZ\$)/i.test(html)
  );

  const usdConfirmed = Boolean(
    fromUsMatch ||
      (/From\s*\$/.test(html) &&
        !localCurrencyDetected &&
        !/From\s*(?:€|£|CA\$|AU\$|A\$|฿|¥)/.test(html))
  );

  const priceFrom = fromUsMatch
    ? parseFloat(fromUsMatch[1].replace(/,/g, ""))
    : usdConfirmed && fromDollarMatch
      ? parseFloat(fromDollarMatch[1].replace(/,/g, ""))
      : usdConfirmed && fromPriceJson
        ? parseFloat(fromPriceJson[1])
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
    html.match(/From\s*(US\$|\$|€|£|฿|¥)/);
  const currencySymbol = currencyMatch?.[1] ?? null;
  const currency =
    currencySymbol === "US$" || (currencySymbol === "$" && usdConfirmed)
      ? "USD"
      : currencySymbol === "€"
        ? "EUR"
        : currencySymbol === "£"
          ? "GBP"
          : currencySymbol === "฿"
            ? "THB"
            : currencySymbol === "¥"
              ? "JPY"
              : currencySymbol;

  const sourceCurrency = thbMatch
    ? "THB"
    : jpyMatch
      ? "JPY"
      : eurMatch
        ? "EUR"
        : gbpMatch
          ? "GBP"
          : usdConfirmed
            ? "USD"
            : currency;

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
    sourceCurrency,
    usdConfirmed,
    localCurrencyDetected,
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
        extracted.priceFrom === null || extracted.priceFrom <= 25;
      const sanityRejected =
        extracted.priceFrom != null &&
        extracted.priceFrom >= 4000 &&
        !/helicopter|private|luxury|charter|multi[- ]?day/i.test(haystack);
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
        !sanityRejected &&
        !heroRejected &&
        !ratingRejected
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom} ${extracted.sourceCurrency}, ${extracted.rating}/${extracted.reviewCount})`
        );
      } else {
        rejected.push({
          ...entry,
          rejectReasons: {
            titleRejected,
            usdRejected,
            priceRejected,
            sanityRejected,
            heroRejected,
            ratingRejected,
            unavailable: !availability.available,
          },
        });
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} title=${extracted.title ?? "n/a"} price=${extracted.priceFrom} currency=${extracted.sourceCurrency}`
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
    "scripts/bangkok-viator-discovery-results.json",
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
    "scripts/bangkok-live-product-data.raw.json",
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
