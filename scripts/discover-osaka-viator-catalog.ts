/**
 * Live Viator public-page discovery for Osaka (d333).
 * Run: npx tsx scripts/discover-osaka-viator-catalog.ts
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
  "https://www.viator.com/Osaka/d333-ttd",
  "https://www.viator.com/Osaka-tours/Private-and-Custom-Tours/d333-g26",
  "https://www.viator.com/Osaka-tours/Walking-Tours/d333-g16-c56",
  "https://www.viator.com/Osaka-tours/Bike-Tours/d333-g16-c57",
  "https://www.viator.com/Osaka-tours/Food-Tours/d333-g6-c80",
  "https://www.viator.com/Osaka-tours/Day-Trips-and-Excursions/d333-g5",
  "https://www.viator.com/Osaka-tours/Full-day-Tours/d333-g12-c94",
  "https://www.viator.com/Osaka-tours/Half-day-Tours/d333-g12-c95",
  "https://www.viator.com/Osaka-tours/Cultural-and-Theme-Tours/d333-g6",
  "https://www.viator.com/Osaka-tours/Historical-and-Heritage-Tours/d333-g6-c15",
  "https://www.viator.com/Osaka-tours/Photography-Tours/d333-g12-c9",
  "https://www.viator.com/Osaka-tours/Hiking-and-Camping/d333-g9-c35",
  "https://www.viator.com/Osaka-tours/Adventure-Tours/d333-g12-c13",
  "https://www.viator.com/Osaka-tours/Cruises-Sailing-and-Water-Tours/d333-g4",
  "https://www.viator.com/Osaka-tours/Water-Sports/d333-g21",
  "https://www.viator.com/Osaka-tours/Helicopter-Tours/d333-g1-c2",
  "https://www.viator.com/Osaka-tours/Sightseeing-Tours/d333-g12",
  "https://www.viator.com/Osaka-tours/Night-Tours/d333-g12-c11",
  "https://www.viator.com/Osaka-tours/Skip-the-Line-Tours/d333-g12-c205",
];

const SEEDED_PRODUCTS: Array<{ productCode: string; sourceUrl: string }> = [
  {
    productCode: "92136P56",
    sourceUrl:
      "https://www.viator.com/tours/Osaka/Osaka-6hr-Private-Tour-with-Government-Licensed-Guide/d333-92136P56",
  },
  {
    productCode: "92136P50",
    sourceUrl:
      "https://www.viator.com/tours/Osaka/Private-Osaka-Tour-with-Licensed-Guide-Vehicle/d333-92136P50",
  },
  {
    productCode: "33215P2",
    sourceUrl:
      "https://www.viator.com/tours/Osaka/Osaka-Guided-Small-Group-Biking-Tour/d333-33215P2",
  },
];

const PRODUCT_URL_PATTERNS = [
  /https:\/\/www\.viator\.com\/tours\/(?:Osaka|Kyoto|Nara|Kobe|Himeji|Kansai)\/[^"'\s]+?\/d(?:333|336|20756|20826|20740)-([A-Z0-9_]+)/gi,
  /\/tours\/(?:Osaka|Kyoto|Nara|Kobe|Himeji|Kansai)\/[^"'\s]+?\/d(?:333|336|20756|20826|20740)-([A-Z0-9_]+)/gi,
  /https:\/\/www\.viator\.com\/tours\/[^/"'\s]+\/[^"'\s]+?\/d333-([A-Z0-9_]+)/gi,
  /\/tours\/[^/"'\s]+\/[^"'\s]+?\/d333-([A-Z0-9_]+)/gi,
];

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only|skip the line ticket only|e-ticket only|transfer only|airport transfer|private driver without|car rental|universal studios (?:japan|express|ticket)|usj ticket|jr pass|icoca|amazing pass/i;

const PREFERRED_PATTERN =
  /private|food|street food|okonomiyaki|takoyaki|sake|wine|beer|photography|photo|bike|cycling|hike|hiking|castle|dotonbori|nara|kyoto|kobe|himeji|cultural|historical|night|cruise|boat|helicopter|licensed|walking/i;

const PREMIUM_PATTERN =
  /private|luxury|helicopter|yacht|photography|photo|licensed|full[- ]?day|charter/i;

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
  const fromUsdWordMatch = html.match(
    /From\s*USD\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const fromDollarMatch = html.match(
    /From\s*\$\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const fromPriceJson = html.match(/"fromPrice"\s*:\s*([0-9.]+)/i);
  const priceCurrencyJson = html.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/i);
  const currencyJson = html.match(/"currency"\s*:\s*"([A-Z]{3})"/i);

  const jpyMatch =
    html.match(/From\s*¥\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/) ??
    html.match(/From\s*JPY\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/From\s*JP¥\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i);
  const idrMatch =
    html.match(/From\s*Rp\s*([0-9][0-9.,]*)/i) ??
    html.match(/From\s*IDR\s*([0-9][0-9.,]*)/i);
  const thbMatch =
    html.match(/From\s*฿\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/) ??
    html.match(/From\s*THB\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i);
  const eurMatch = html.match(/From\s*€\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  const gbpMatch = html.match(/From\s*£\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  const audMatch = html.match(
    /From\s*(?:AU\$|A\$)\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );

  const jsonCurrency = (
    priceCurrencyJson?.[1] ??
    currencyJson?.[1] ??
    ""
  ).toUpperCase();

  const localCurrencyDetected = Boolean(
    jpyMatch ||
      idrMatch ||
      thbMatch ||
      eurMatch ||
      gbpMatch ||
      audMatch ||
      (jsonCurrency && jsonCurrency !== "USD") ||
      /From\s*(?:CA\$|AU\$|A\$|R\$|S\/|MX\$|NZ\$|SGD|ZAR|DKK|¥|JP¥)/i.test(html)
  );

  const usdConfirmed = Boolean(
    fromUsMatch ||
      fromUsdWordMatch ||
      (jsonCurrency === "USD" && (fromDollarMatch || fromPriceJson)) ||
      (/From\s*\$/.test(html) &&
        !localCurrencyDetected &&
        !/From\s*(?:€|£|CA\$|AU\$|A\$|฿|¥|JP¥|Rp|IDR|JPY)/.test(html))
  );

  const priceFrom = fromUsMatch
    ? parseFloat(fromUsMatch[1].replace(/,/g, ""))
    : fromUsdWordMatch
      ? parseFloat(fromUsdWordMatch[1].replace(/,/g, ""))
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

  const sourceCurrency = jpyMatch
    ? "JPY"
    : idrMatch
      ? "IDR"
      : thbMatch
        ? "THB"
        : eurMatch
          ? "EUR"
          : gbpMatch
            ? "GBP"
            : audMatch
              ? "AUD"
              : jsonCurrency && jsonCurrency !== "USD"
                ? jsonCurrency
                : usdConfirmed
                  ? "USD"
                  : jsonCurrency || null;

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
    currency: usdConfirmed ? "USD" : sourceCurrency,
    sourceCurrency,
    usdConfirmed,
    localCurrencyDetected,
    jsonCurrency: jsonCurrency || null,
    jpyAmount: jpyMatch ? jpyMatch[1] : null,
    htmlLength: html.length,
    blocked: /datadome|captcha|Access denied/i.test(html),
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
        `  ${found.length} product codes (status=${catalogPage.httpStatus} len=${catalogPage.html.length} blocked=${/datadome|captcha/i.test(catalogPage.html)})`
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
        extracted.priceFrom === null || extracted.priceFrom <= 25;
      const sanityRejected =
        extracted.priceFrom != null &&
        extracted.priceFrom >= 4000 &&
        !/helicopter|private|luxury|charter|multi[- ]?day|yacht/i.test(haystack);
      const jpyMislabeled =
        extracted.usdConfirmed &&
        extracted.priceFrom != null &&
        extracted.priceFrom >= 3000 &&
        !/helicopter|luxury|charter|multi[- ]?day|yacht/i.test(haystack);
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
        !jpyMislabeled &&
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
            jpyMislabeled,
            heroRejected,
            ratingRejected,
            unavailable: !availability.available,
            blocked: extracted.blocked,
          },
        });
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} title=${extracted.title ?? "n/a"} price=${extracted.priceFrom} currency=${extracted.sourceCurrency} blocked=${extracted.blocked}`
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
    "scripts/osaka-viator-discovery-results.json",
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
    "scripts/osaka-live-product-data.raw.json",
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
