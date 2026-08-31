/**
 * Live Viator public-page discovery for Cairns (d754).
 * Run: npx tsx scripts/discover-cairns-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { extractCairnsUsdAdultFromPrice } from "../src/engine6/cairnsUsdAdultFromPrice";
import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

const execFileAsync = promisify(execFile);

const CATALOG_URLS = [
  "https://www.viator.com/Cairns-and-the-Tropical-North/d754-ttd",
  "https://www.viator.com/Cairns-tours/Private-and-Custom-Tours/d754-g26",
  "https://www.viator.com/Cairns-tours/Walking-Tours/d754-g16-c56",
  "https://www.viator.com/Cairns-tours/Bike-Tours/d754-g16-c57",
  "https://www.viator.com/Cairns-tours/Food-Tours/d754-g6-c80",
  "https://www.viator.com/Cairns-tours/Day-Trips-and-Excursions/d754-g5",
  "https://www.viator.com/Cairns-tours/Full-day-Tours/d754-g12-c94",
  "https://www.viator.com/Cairns-tours/Half-day-Tours/d754-g12-c95",
  "https://www.viator.com/Cairns-tours/Cultural-and-Theme-Tours/d754-g6",
  "https://www.viator.com/Cairns-tours/Historical-and-Heritage-Tours/d754-g6-c15",
  "https://www.viator.com/Cairns-tours/Photography-Tours/d754-g12-c9",
  "https://www.viator.com/Cairns-tours/Hiking-and-Camping/d754-g9-c35",
  "https://www.viator.com/Cairns-tours/Adventure-Tours/d754-g12-c13",
  "https://www.viator.com/Cairns-tours/Cruises-Sailing-and-Water-Tours/d754-g4",
  "https://www.viator.com/Cairns-tours/Water-Sports/d754-g21",
  "https://www.viator.com/Cairns-tours/Snorkeling/d754-g21-c26",
  "https://www.viator.com/Cairns-tours/Scuba-and-Snorkeling/d754-g21-c27",
  "https://www.viator.com/Cairns-tours/Helicopter-Tours/d754-g1-c2",
  "https://www.viator.com/Cairns-tours/Air-Tours/d754-g1",
  "https://www.viator.com/Cairns-tours/Sightseeing-Tours/d754-g12",
  "https://www.viator.com/Cairns-tours/Night-Tours/d754-g12-c11",
  "https://www.viator.com/Cairns-tours/Wine-Tasting-and-Winery-Tours/d754-g6-c81",
  "https://www.viator.com/Cairns-tours/Cultural-Tours/d754-g6-c10",
  "https://www.viator.com/Cairns-tours/Nature-and-Wildlife/d754-g12-c8",
  "https://www.viator.com/Cairns-tours/Eco-Tours/d754-g12-c22",
  "https://www.viator.com/Cairns-and-the-Tropical-North-tours/Great-Barrier-Reef/d754-g12",
];

const SEEDED_PRODUCTS: Array<{ productCode: string; sourceUrl: string }> = [];

const PRODUCT_URL_PATTERNS = [
  /https:\/\/www\.viator\.com\/tours\/(?:Cairns|Cairns-and-the-Tropical-North|Port-Douglas|Cape-Tribulation|Kuranda|Green-Island|Fitzroy-Island|Atherton|Atherton-Tablelands|Daintree|Daintree-Rainforest|Mossman|Palm-Cove|Mission-Beach|Cooktown|Great-Barrier-Reef)\/[^"'\s]+?\/d(?:754|755|23167|20726|5281|5282|5283|5284)-([A-Z0-9_]+)/gi,
  /\/tours\/(?:Cairns|Cairns-and-the-Tropical-North|Port-Douglas|Cape-Tribulation|Kuranda|Green-Island|Fitzroy-Island|Atherton|Atherton-Tablelands|Daintree|Daintree-Rainforest|Mossman|Palm-Cove|Mission-Beach|Cooktown|Great-Barrier-Reef)\/[^"'\s]+?\/d(?:754|755|23167|20726|5281|5282|5283|5284)-([A-Z0-9_]+)/gi,
  /https:\/\/www\.viator\.com\/tours\/[^/"'\s]+\/[^"'\s]+?\/d754-([A-Z0-9_]+)/gi,
  /\/tours\/[^/"'\s]+\/[^"'\s]+?\/d754-([A-Z0-9_]+)/gi,
];

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only|skip the line ticket only|e-ticket only|transfer only|airport transfer|private driver without|car rental|attraction ticket only|entry ticket only|pass only|rental only|equipment rental/i;

const PREFERRED_PATTERN =
  /private|food|wine|reef|great barrier|green island|fitzroy|kuranda|skyrail|daintree|cape tribulation|mossman|tableland|waterfall|rainforest|harbour|harbor|photography|photo|bike|cycling|hike|hiking|cultural|aboriginal|indigenous|historical|night|cruise|boat|kayak|snorkel|scuba|dive|helicopter|balloon|licensed|walking|sailing|wildlife|crocodile|hot air/i;

const PREMIUM_PATTERN =
  /private|luxury|helicopter|yacht|photography|photo|licensed|full[- ]?day|charter|premium|small[- ]?group|outer reef|liveaboard|overnight|hot air balloon|scenic flight/i;

const extractCatalogProducts = (html: string) => {
  const products = new Map<string, string>();

  for (const pattern of PRODUCT_URL_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of html.matchAll(pattern)) {
      const code = (match[1] ?? "").toUpperCase();
      if (!code) {
        continue;
      }
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

const extractFromHtml = (html: string, sourceUrl?: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

  const usdAdultFrom = extractCairnsUsdAdultFromPrice({ html, sourceUrl });
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
    /From\s*(?:AU\$|A\$|AUD)\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
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
      /From\s*(?:CA\$|AU\$|A\$|R\$|S\/|MX\$|NZ\$|SGD|ZAR|DKK|¥|JP¥|AUD)/i.test(
        html
      )
  );

  const usdConfirmed =
    usdAdultFrom.amount != null && usdAdultFrom.currency === "USD";
  const priceFrom = usdAdultFrom.amount;

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
    const name = decodeJsonString(match[1]);
    if (name && !itineraryStops.includes(name)) {
      itineraryStops.push(name);
    }
  }
  for (const match of html.matchAll(/"attractionName"\s*:\s*"([^"]+)"/gi)) {
    const name = decodeJsonString(match[1]);
    if (name && !itineraryStops.includes(name)) {
      itineraryStops.push(name);
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
    html.match(/"startLocation"[^}]*"description"\s*:\s*"((?:\\.|[^"\\])+)"/i) ??
    html.match(/Meeting point[:\s]+([^<\n]{20,180})/i);
  const startDescription = startMatch?.[1]
    ? decodeJsonString(startMatch[1])
    : undefined;

  const sourceCurrency = audMatch
    ? "AUD"
    : jpyMatch
      ? "JPY"
      : idrMatch
        ? "IDR"
        : thbMatch
          ? "THB"
          : eurMatch
            ? "EUR"
            : gbpMatch
              ? "GBP"
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
    highlights,
    startDescription,
    overview,
    currency: usdConfirmed ? "USD" : sourceCurrency,
    sourceCurrency,
    usdConfirmed,
    localCurrencyDetected,
    jsonCurrency: jsonCurrency || null,
    audAmount: audMatch ? audMatch[1] : null,
    usAmount:
      usdAdultFrom.currency === "USD" && usdAdultFrom.amount != null
        ? String(usdAdultFrom.amount)
        : null,
    usdAdultFromSource: usdAdultFrom.source,
    usdAdultFromUnit: usdAdultFrom.unit,
    usdAdultFromRejectedReason: usdAdultFrom.rejectedReason,
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
      "-H",
      "Cookie: currency=USD; viatorCurrency=USD",
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
      const extracted = extractFromHtml(page.html, candidate.sourceUrl);
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
        !/helicopter|private|luxury|charter|multi[- ]?day|yacht|liveaboard|overnight/i.test(
          haystack
        );
      const localMislabeled =
        extracted.usdConfirmed &&
        extracted.priceFrom != null &&
        extracted.priceFrom >= 2500 &&
        !/helicopter|luxury|charter|multi[- ]?day|yacht|liveaboard|overnight/i.test(
          haystack
        );
      const audMislabeled =
        extracted.sourceCurrency === "AUD" && extracted.usdConfirmed;
      const heroRejected = !extracted.heroUrl;
      const ratingRejected =
        extracted.rating == null || extracted.reviewCount == null;
      const itineraryRejected = extracted.itineraryStops.length < 2;

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
        !localMislabeled &&
        !audMislabeled &&
        !heroRejected &&
        !ratingRejected &&
        !itineraryRejected
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom} ${extracted.sourceCurrency}, ${extracted.rating}/${extracted.reviewCount}, stops=${extracted.itineraryStops.length})`
        );
      } else {
        rejected.push({
          ...entry,
          rejectReasons: {
            titleRejected,
            usdRejected,
            priceRejected,
            sanityRejected,
            localMislabeled,
            audMislabeled,
            heroRejected,
            ratingRejected,
            itineraryRejected,
            unavailable: !availability.available,
            blocked: extracted.blocked,
          },
        });
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} title=${extracted.title ?? "n/a"} price=${extracted.priceFrom} currency=${extracted.sourceCurrency} usd=${extracted.usdConfirmed} stops=${extracted.itineraryStops.length} blocked=${extracted.blocked}`
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
    "scripts/cairns-viator-discovery-results.json",
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
    "scripts/cairns-live-product-data.raw.json",
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
