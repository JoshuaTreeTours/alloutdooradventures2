/**
 * Live Viator public-page discovery for Melbourne, Australia (d384).
 * Run: npx tsx scripts/discover-melbourne-viator-catalog.ts
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
  "https://www.viator.com/Melbourne/d384-ttd",
  "https://www.viator.com/Melbourne-tours/Private-and-Custom-Tours/d384-g26",
  "https://www.viator.com/Melbourne-tours/Walking-Tours/d384-g16-c56",
  "https://www.viator.com/Melbourne-tours/Bike-Tours/d384-g16-c57",
  "https://www.viator.com/Melbourne-tours/Food-Tours/d384-g6-c80",
  "https://www.viator.com/Melbourne-tours/Day-Trips-and-Excursions/d384-g5",
  "https://www.viator.com/Melbourne-tours/Full-day-Tours/d384-g12-c94",
  "https://www.viator.com/Melbourne-tours/Half-day-Tours/d384-g12-c95",
  "https://www.viator.com/Melbourne-tours/Cultural-and-Theme-Tours/d384-g6",
  "https://www.viator.com/Melbourne-tours/Historical-and-Heritage-Tours/d384-g6-c15",
  "https://www.viator.com/Melbourne-tours/Photography-Tours/d384-g12-c9",
  "https://www.viator.com/Melbourne-tours/Hiking-and-Camping/d384-g9-c35",
  "https://www.viator.com/Melbourne-tours/Adventure-Tours/d384-g12-c13",
  "https://www.viator.com/Melbourne-tours/Cruises-Sailing-and-Water-Tours/d384-g4",
  "https://www.viator.com/Melbourne-tours/Water-Sports/d384-g21",
  "https://www.viator.com/Melbourne-tours/Helicopter-Tours/d384-g1-c2",
  "https://www.viator.com/Melbourne-tours/Air-Tours/d384-g1",
  "https://www.viator.com/Melbourne-tours/Sightseeing-Tours/d384-g12",
  "https://www.viator.com/Melbourne-tours/Night-Tours/d384-g12-c11",
  "https://www.viator.com/Melbourne-tours/Wine-Tasting-and-Winery-Tours/d384-g6-c81",
  "https://www.viator.com/Melbourne-tours/Cultural-Tours/d384-g6-c10",
  "https://www.viator.com/Melbourne-tours/Nature-and-Wildlife/d384-g12-c8",
  "https://www.viator.com/Melbourne-tours/Eco-Tours/d384-g12-c22",
  "https://www.viator.com/Melbourne-tours/Hot-Air-Balloon-Rides/d384-g1-c1",
  "https://www.viator.com/Melbourne-attractions/Great-Ocean-Road/d384-a232",
  "https://www.viator.com/Melbourne-attractions/Phillip-Island/d384-a237",
  "https://www.viator.com/Melbourne-attractions/Yarra-Valley/d384-a236",
  "https://www.viator.com/Melbourne-attractions/Twelve-Apostles/d384-a233",
];

const SEEDED_PRODUCTS: Array<{ productCode: string; sourceUrl: string }> = [
  {
    productCode: "39651P1",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-Street-Art-Tour/d384-39651P1",
  },
  {
    productCode: "6846P4",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/The-Melbourne-Experience-Foodie-Indulgence-Walking-Tour/d384-6846P4",
  },
  {
    productCode: "3671SOMW",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-Food-and-Wine-Small-Group-Walking-Tour/d384-3671SOMW",
  },
  {
    productCode: "3671ARCADES",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-Lanes-and-Arcades-Walking-Tour/d384-3671ARCADES",
  },
  {
    productCode: "6998BIKE",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-Bike-Tour/d384-6998BIKE",
  },
  {
    productCode: "88020P1",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Aboriginal-Heritage-Walk-Royal-Botanic-Gardens-Victoria/d384-88020P1",
  },
  {
    productCode: "182143P3",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-Laneways-and-Alleyways/d384-182143P3",
  },
  {
    productCode: "130429P12",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-Drive-by-Night-Tour/d384-130429P12",
  },
  {
    productCode: "7411P4",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/St-Kilda-Penguins-by-Bike/d384-7411P4",
  },
  {
    productCode: "3013SIGHTAB",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Highlights-of-Melbourne-Cruise/d384-3013SIGHTAB",
  },
  {
    productCode: "41073P4",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/MCG-Tour-and-Australian-Sports-Museum-Entry/d384-41073P4",
  },
  {
    productCode: "59718P2",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-City-Sights-Kayak-Tour/d384-59718P2",
  },
  {
    productCode: "3181GOWEST1",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Great-Ocean-Road-Small-Group-Eco-Tour-from-Melbourne/d384-3181GOWEST1",
  },
  {
    productCode: "3181P7",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Great-Ocean-Road-Sunset-Tour/d384-3181P7",
  },
  {
    productCode: "6770P29",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Reverse-12-Apostles-Morning-Light-Great-Ocean-Road-Tour-from-Melbourne/d384-6770P29",
  },
  {
    productCode: "5325P22",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Small-Group-Great-Ocean-Road-Day-Trip-from-Melbourne-Including-Twelve-Apostles-and-Cape-Otway/d384-5325P22",
  },
  {
    productCode: "478616P1",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Great-Ocean-Road-Reverse-Itinerary-Luxury-Bus-Small-Group-13-Pax/d384-478616P1",
  },
  {
    productCode: "29867P3",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Express-Twelve-Apostles-Day-Trip-from-Melbourne/d384-29867P3",
  },
  {
    productCode: "39371P6",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Full-Day-Great-Otway-National-Park-Hiking-Tour-from-Melbourne/d384-39371P6",
  },
  {
    productCode: "5165GREATOCEANRD",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Private-Tour-Great-Ocean-Road-Helicopter-Tour-from-Melbourne/d384-5165GREATOCEANRD",
  },
  {
    productCode: "5706M3",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Small-Group-Phillip-Island-Day-Trip-from-Melbourne/d384-5706M3",
  },
  {
    productCode: "108928P20",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Public-Bus-Tour-of-Phillip-Island-Wildlife-and-Brighton-Beach/d384-108928P20",
  },
  {
    productCode: "13938P1",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Yarra-Valley-Food-and-Wine-Daytour/d384-13938P1",
  },
  {
    productCode: "13938P3",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Yarra-Valley-Wine-and-Wildlife-Daytour/d384-13938P3",
  },
  {
    productCode: "3667EYV01S",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Yarra-Valley-Food-and-Wine-Small-Group-Tour/d384-3667EYV01S",
  },
  {
    productCode: "3127YARRA",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Yarra-Valley-Balloon-Flight-at-Sunrise/d384-3127YARRA",
  },
  {
    productCode: "150264P3",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Melbourne-Premium-Balloon-Flight/d384-150264P3",
  },
  {
    productCode: "358174P1",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Hot-Air-Balloon-Flight-over-the-Yarra-Valley/d384-358174P1",
  },
  {
    productCode: "263968P11",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Mornington-Peninsula-Hot-Springs-Arthurs-Seat-and-Winery-Lunch/d384-263968P11",
  },
  {
    productCode: "38515P9",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Private-Dandenong-Ranges-Tour/d384-38515P9",
  },
  {
    productCode: "6121P8",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Grampians-National-Park-with-Kangaroos-and-MacKenzie-Falls/d384-6121P8",
  },
  {
    productCode: "3181P4",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Grampians-National-Park-Small-Group-Eco-Tour-from-Melbourne/d384-3181P4",
  },
  {
    productCode: "6770TOUR4",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Small-Group-Grampians-Day-Trip-from-Melbourne/d384-6770TOUR4",
  },
  {
    productCode: "156795P2",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Full-Day-Great-Ocean-Road-and-12-Apostles-Tour/d384-156795P2",
  },
  {
    productCode: "6121P6",
    sourceUrl:
      "https://www.viator.com/tours/Melbourne/Great-Ocean-Road-and-12-Apostles-Day-Tour/d384-6121P6",
  },
];


const PRODUCT_URL_PATTERNS = [
  /https:\/\/www\.viator\.com\/tours\/(?:Melbourne|Great-Ocean-Road|Phillip-Island|Yarra-Valley|Mornington-Peninsula|Grampians|Geelong|Ballarat|St-Kilda|Healesville|Dandenong-Ranges|Apollo-Bay|Port-Campbell|Lorne|Sorrento|Brighton|Fitzroy|Carlton)\/[^"'\s]+?\/d(?:384|385|386|387|388|389|23167|5288|5289|5290)-([A-Z0-9_]+)/gi,
  /\/tours\/(?:Melbourne|Great-Ocean-Road|Phillip-Island|Yarra-Valley|Mornington-Peninsula|Grampians|Geelong|Ballarat|St-Kilda|Healesville|Dandenong-Ranges|Apollo-Bay|Port-Campbell|Lorne|Sorrento|Brighton|Fitzroy|Carlton)\/[^"'\s]+?\/d(?:384|385|386|387|388|389|23167|5288|5289|5290)-([A-Z0-9_]+)/gi,
  /https:\/\/www\.viator\.com\/tours\/[^/"'\s]+\/[^"'\s]+?\/d384-([A-Z0-9_]+)/gi,
  /\/tours\/[^/"'\s]+\/[^"'\s]+?\/d384-([A-Z0-9_]+)/gi,
];

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only|skip the line ticket only|e-ticket only|transfer only|airport transfer|private driver without|car rental|attraction ticket only|entry ticket only|pass only|rental only|equipment rental|sim card|wifi|unlimited data/i;

const PREFERRED_PATTERN =
  /private|food|wine|yarra valley|great ocean road|phillip island|penguin|grampians|puffing billy|laneway|street art|aboriginal|indigenous|photography|photo|bike|cycling|hike|hiking|cultural|historical|night|cruise|boat|kayak|helicopter|walking|balloon|hot air|mcg|st kilda|mornington|wildlife|stargazing/i;

const PREMIUM_PATTERN =
  /private|luxury|helicopter|yacht|photography|photo|licensed|full[- ]?day|charter|premium|small[- ]?group|hot air balloon|scenic flight|overnight|great ocean road/i;

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

const parseAmount = (raw: string | undefined | null) => {
  if (!raw) {
    return null;
  }
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : null;
};

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
    html.match(/From\s*Rp\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/From\s*IDR\s*([0-9][0-9.]*)/i);
  const thbMatch =
    html.match(/From\s*฿\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/) ??
    html.match(/From\s*THB\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i);
  const eurMatch = html.match(/From\s*€\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  const gbpMatch = html.match(/From\s*£\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  const audMatch = html.match(
    /From\s*(?:AU\$|A\$|AUD)\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
  );
  const nzdMatch = html.match(
    /From\s*(?:NZ\$|NZD)\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i
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
      nzdMatch ||
      (jsonCurrency && jsonCurrency !== "USD") ||
      /From\s*(?:CA\$|AU\$|A\$|NZ\$|R\$|S\/|MX\$|SGD|ZAR|DKK|¥|JP¥|AUD|NZD)/i.test(
        html
      )
  );

  const usdConfirmed = Boolean(
    (fromUsMatch || fromUsdWordMatch) &&
      !(nzdMatch && !fromUsMatch && !fromUsdWordMatch) &&
      !(audMatch && !fromUsMatch && !fromUsdWordMatch)
  )
    ? true
    : Boolean(
        (fromUsMatch || fromUsdWordMatch) ||
          (jsonCurrency === "USD" &&
            (fromDollarMatch || fromPriceJson) &&
            !audMatch &&
            !nzdMatch) ||
          (/From\s*\$/.test(html) &&
            !localCurrencyDetected &&
            !/From\s*(?:€|£|CA\$|AU\$|A\$|NZ\$|฿|¥|JP¥|Rp|IDR|JPY|AUD|NZD)/.test(
              html
            ))
      );

  const priceFrom = fromUsMatch
    ? parseAmount(fromUsMatch[1])
    : fromUsdWordMatch
      ? parseAmount(fromUsdWordMatch[1])
      : usdConfirmed && fromDollarMatch
        ? parseAmount(fromDollarMatch[1])
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
  for (const match of html.matchAll(/"highlight"\s*:\s*"((?:\\.|[^"\\])+)"/gi)) {
    if (!highlights.includes(match[1])) {
      highlights.push(decodeJsonString(match[1]));
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
    : nzdMatch
      ? "NZD"
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
    nzdAmount: nzdMatch ? nzdMatch[1] : null,
    audAmount: audMatch ? audMatch[1] : null,
    usAmount: fromUsMatch?.[1] ?? fromUsdWordMatch?.[1] ?? null,
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

  if (!process.argv.includes("--seeded-only")) {
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
        !/helicopter|private|luxury|charter|multi[- ]?day|yacht|liveaboard|overnight/i.test(
          haystack
        );
      const localMislabeled =
        extracted.usdConfirmed &&
        extracted.priceFrom != null &&
        extracted.priceFrom >= 2500 &&
        !/helicopter|luxury|charter|multi[- ]?day|yacht|liveaboard|overnight|private/i.test(
          haystack
        );
      const nzdMislabeled =
        extracted.sourceCurrency === "NZD" &&
        extracted.usdConfirmed &&
        !extracted.usAmount;
      const audMislabeled =
        extracted.sourceCurrency === "AUD" &&
        extracted.usdConfirmed &&
        !extracted.usAmount;
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
        !nzdMislabeled &&
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
            nzdMislabeled,
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
    "scripts/melbourne-viator-discovery-results.json",
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
    "scripts/melbourne-live-product-data.raw.json",
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
