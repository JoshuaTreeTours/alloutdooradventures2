/**
 * Fetch live public Viator product page data for Olympic National Park catalog.
 * Uses HTML parsing when no Viator API key is available.
 */
import { writeFileSync } from "node:fs";

const PRODUCT_URLS: Record<string, string> = {
  "88081P2":
    "https://www.viator.com/tours/Port-Angeles/Lake-Crescent-and-Marymere-Falls-Olympic-National-Park-Guided-Tour/d4390-88081P2",
  "88081P4":
    "https://www.viator.com/tours/Port-Angeles/Hoh-Rain-Forest-and-Pacific-Coast-Olympic-National-Park-Guided-Tour/d4390-88081P4",
  "88081P1":
    "https://www.viator.com/tours/Port-Angeles/Hurricane-Ridge-Olympic-National-Park-Guided-Tour/d4390-88081P1",
  "5412OLYM":
    "https://www.viator.com/tours/Seattle/Small-Group-Olympic-National-Park-Tour-from-Seattle/d704-5412OLYM",
  "132218P140":
    "https://www.viator.com/tours/Seattle/1-Day-Olympic-National-Park-Tour-Seattle-departure-SO1/d704-132218P140",
  "5557524P1":
    "https://www.viator.com/tours/Seattle/Olympic-National-Park-Highlight-Tour/d704-5557524P1",
  "3657P1":
    "https://www.viator.com/tours/Seattle/Olympic-National-Park-tour/d704-3657P1",
  "132218P405":
    "https://www.viator.com/tours/Seattle/Small-Group-Olympic-National-Park-Day-Tour-from-Seattle/d704-132218P405",
  "265766P23":
    "https://www.viator.com/tours/Olympic-National-Park/Small-Group-Hiking-Tour-of-Olympic-National-Park-West-Peninsula/d50807-265766P23",
  "5412P36":
    "https://www.viator.com/tours/Seattle/3-Days-in-Olympic-National-Park-from-Seattle-Hidden-Hikes/d704-5412P36",
  "318681P15":
    "https://www.viator.com/tours/Seattle/Explore-Olympic-National-Park-from-Seattle-in-SUV/d704-318681P15",
  "265766P14":
    "https://www.viator.com/tours/Port-Angeles/Full-Day-Private-Tour-and-Hike-in-Olympic-National-Park/d4390-265766P14",
  "265766P73":
    "https://www.viator.com/tours/Olympic-National-Park/Olympic-Two-Day-Private-Tour-and-Hike/d50807-265766P73",
  "383259P1":
    "https://www.viator.com/tours/Seattle/Olympic-Peninsula-Experience-the-spectacular-beauty-of-the-Pacific-Coastline/d704-383259P1",
};

const extractFromHtml = (html: string, productCode: string, productUrl: string) => {
  const heroMatch =
    html.match(
      /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"'\s]+/i
    ) ??
    html.match(/https:\/\/media\.tacdn\.com\/media\/photo-o\/[^"'\s]+/i);
  const heroUrl = heroMatch?.[0] ?? null;

  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim() ?? null;

  const priceMatch =
    html.match(/From \$([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i);
  const price = priceMatch
    ? parseFloat(priceMatch[1].replace(/,/g, ""))
    : null;

  const ratingMatch =
    html.match(/"ratingValue"\s*:\s*"([0-9.]+)"/i) ??
    html.match(/([0-9]\.[0-9])\s*\(([0-9,]+)\s*Reviews/i);
  const rating = ratingMatch
    ? parseFloat(ratingMatch[1])
    : null;

  const reviewMatch =
    html.match(/"reviewCount"\s*:\s*"([0-9,]+)"/i) ??
    html.match(/([0-9]\.[0-9])\s*\(([0-9,]+)\s*Reviews/i) ??
    html.match(/([0-9,]+)\s+Reviews/i);
  const reviewCount = reviewMatch
    ? parseInt(String(reviewMatch[reviewMatch.length - 1]).replace(/,/g, ""), 10)
    : null;

  const durationMatch =
    html.match(/(\d+\s*(?:to\s*\d+\s*)?(?:hours?|minutes?|days?)\s*\(approx\.\))/i) ??
    html.match(/(\d+\s*(?:to\s*\d+\s*)?(?:hours?\s*\d+\s*minutes?|hours?|days?))/i);
  const duration = durationMatch?.[1] ?? null;

  const overviewMatch = html.match(
    /Overview[\s\S]{0,2000}?<p[^>]*>([^<]{80,800})<\/p>/i
  );
  const overview = overviewMatch?.[1]?.replace(/\s+/g, " ").trim() ?? "";

  const itineraryStops: string[] = [];
  const itinerarySection = html.match(/Itinerary[\s\S]{0,8000}/i)?.[0] ?? "";
  const h3Matches = itinerarySection.matchAll(/<h3[^>]*>([^<]+)<\/h3>/gi);
  for (const m of h3Matches) {
    const stop = m[1].trim();
    if (
      stop &&
      !/pickup|meeting|end point|operating hours|start time/i.test(stop)
    ) {
      itineraryStops.push(stop);
    }
  }

  const highlights: string[] = [];
  const overviewSection = html.match(/Overview[\s\S]{0,4000}/i)?.[0] ?? "";
  const liMatches = overviewSection.matchAll(/<li[^>]*>([^<]{15,140})<\/li>/gi);
  for (const m of liMatches) {
    highlights.push(m[1].trim());
  }

  const inclusions: string[] = [];
  const inclSection = html.match(/What's Included[\s\S]{0,3000}/i)?.[0] ?? "";
  const inclMatches = inclSection.matchAll(/<li[^>]*>([^<]+)<\/li>/gi);
  for (const m of inclMatches) {
    inclusions.push(m[1].trim());
  }

  return {
    productCode,
    productUrl,
    title,
    priceFrom: price,
    rating,
    reviewCount,
    duration: duration ? `${duration.replace(/\s*\(approx\.\)/i, "")} (approx.)` : null,
    heroUrl,
    overview,
    highlights: highlights.slice(0, 5),
    itineraryStops: itineraryStops.slice(0, 8),
    inclusions: inclusions.slice(0, 8),
  };
};

const main = async () => {
  const results = [];

  for (const [productCode, url] of Object.entries(PRODUCT_URLS)) {
    console.log(`Fetching ${productCode}...`);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${productCode}`);
      results.push({ productCode, productUrl: url, error: `HTTP ${response.status}` });
      continue;
    }

    const html = await response.text();
    if (/Product unavailable|404 Not Found|similar experiences/i.test(html)) {
      console.error(`  Unavailable: ${productCode}`);
      results.push({ productCode, productUrl: url, error: "unavailable" });
      continue;
    }

    const extracted = extractFromHtml(html, productCode, url);
    console.log(
      `  OK: ${extracted.title?.slice(0, 50)} $${extracted.priceFrom} ★${extracted.rating} (${extracted.reviewCount})`
    );
    results.push(extracted);
    await new Promise(r => setTimeout(r, 800));
  }

  writeFileSync(
    "scripts/olympic-live-product-data.json",
    `${JSON.stringify(results, null, 2)}\n`
  );
  console.log(`Wrote ${results.length} products to scripts/olympic-live-product-data.json`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
