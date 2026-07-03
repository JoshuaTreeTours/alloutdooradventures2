/**
 * One-off discovery script: fetch live Viator public page data for Sedona candidates.
 * Run: npx tsx scripts/discover-sedona-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";

import { fetchViatorPublicPage } from "../src/engine6/viatorPublicAvailability";
import { assessViatorPublicPageAvailability } from "../src/engine6/viatorPublicAvailability";

type Candidate = {
  productCode: string;
  sourceUrl: string;
  experienceType: string;
  commercialTier?: "premium" | "standard";
};

const CANDIDATES: Candidate[] = [
  { productCode: "162351P6", sourceUrl: "https://www.viator.com/tours/Sedona/Award-Winning-Sedona-Stargazing-with-TripAdvisor-Hall-of-Fame-Company/d750-162351P6", experienceType: "stargazing", commercialTier: "premium" },
  { productCode: "327849P2", sourceUrl: "https://www.viator.com/tours/Sedona/The-Fast-Track-around-the-Sedona-Red-Rocks/d750-327849P2", experienceType: "helicopter", commercialTier: "premium" },
  { productCode: "327849P1", sourceUrl: "https://www.viator.com/tours/Sedona/Mogollon-Rim-Tour-covering-3-wilderness-areas-around-Sedona/d750-327849P1", experienceType: "helicopter", commercialTier: "premium" },
  { productCode: "54668P2", sourceUrl: "https://www.viator.com/tours/Sedona/Desert-Thunder-Tour/d750-54668P2", experienceType: "helicopter", commercialTier: "premium" },
  { productCode: "325517P1", sourceUrl: "https://www.viator.com/tours/Sedona/VIP-Wine-and-City-tours-with-a-celebrity-tour-guide/d750-325517P1", experienceType: "wine-tour", commercialTier: "premium" },
  { productCode: "109073P8", sourceUrl: "https://www.viator.com/tours/Sedona/Sedona-Scenic-Full-Day-Tour/d750-109073P8", experienceType: "private-sightseeing", commercialTier: "premium" },
  { productCode: "129182P3", sourceUrl: "https://www.viator.com/tours/Sedona/Sedona-Sacred-Places-and-Vortex-tour/d750-129182P3", experienceType: "private-cultural", commercialTier: "premium" },
  { productCode: "129182P2", sourceUrl: "https://www.viator.com/tours/Sedona/Sunset-Sedona-Sacred-Places-gourmet-picnic-dinner-and-stargazing/d750-129182P2", experienceType: "stargazing", commercialTier: "premium" },
  { productCode: "129182P1", sourceUrl: "https://www.viator.com/tours/Sedona/Private-custom-tours/d750-129182P1", experienceType: "private-hiking", commercialTier: "premium" },
  { productCode: "291644P3", sourceUrl: "https://www.viator.com/tours/Sedona/Explore-Sedona-Tour/d750-291644P3", experienceType: "private-hiking", commercialTier: "premium" },
  { productCode: "338750P2", sourceUrl: "https://www.viator.com/tours/Sedona/Three-Hour-Creekside-of-Cathedral-Hike-Private-Group/d750-338750P2", experienceType: "private-hiking", commercialTier: "premium" },
  { productCode: "393812P3", sourceUrl: "https://www.viator.com/tours/Sedona/Sedona-Cathedral-Rock-Hiking-Tour-with-a-Private-Guide/d750-393812P3", experienceType: "private-hiking", commercialTier: "premium" },
  { productCode: "393812P1", sourceUrl: "https://www.viator.com/tours/Sedona/Introduction-to-Sedona-Easy-Walk/d750-393812P1", experienceType: "guided-hiking", commercialTier: "premium" },
  { productCode: "3925OBW", sourceUrl: "https://www.viator.com/tours/Sedona/Old-Bear-Wallow-Tour-from-Sedona/d750-3925OBW", experienceType: "jeep-tour", commercialTier: "premium" },
  { productCode: "3925P1", sourceUrl: "https://www.viator.com/tours/Sedona/Red-Rock-Panoramic-Tour/d750-3925P1", experienceType: "jeep-tour", commercialTier: "premium" },
  { productCode: "25265P29", sourceUrl: "https://www.viator.com/tours/Sedona/Mogollon-Rim-Jeep-Tour/d750-25265P29", experienceType: "jeep-tour", commercialTier: "premium" },
  { productCode: "25271P1", sourceUrl: "https://www.viator.com/tours/Sedona/The-Original-Sedona-Vortex-Tour/d750-25271P1", experienceType: "jeep-tour", commercialTier: "premium" },
  { productCode: "3925P14", sourceUrl: "https://www.viator.com/tours/Sedona/Private-Jeep-4X4-Stargazing-Tour/d750-3925P14", experienceType: "stargazing", commercialTier: "premium" },
  { productCode: "320003P1", sourceUrl: "https://www.viator.com/tours/Sedona/Sedona-Hiking-and-Photo-Adventure/d750-320003P1", experienceType: "photography", commercialTier: "premium" },
  { productCode: "115255P2", sourceUrl: "https://www.viator.com/tours/Sedona/Hopi-Cultural-and-Archaeological-Tour/d750-115255P2", experienceType: "native-cultural", commercialTier: "premium" },
  { productCode: "25265P5", sourceUrl: "https://www.viator.com/tours/Sedona/Jeep-and-Wine-Tasting-Combo/d750-25265P5", experienceType: "wine-tour", commercialTier: "premium" },
  { productCode: "25265P14", sourceUrl: "https://www.viator.com/tours/Sedona/Jeep-Tour-and-Winery-Tour-in-Camp-Verde/d750-25265P14", experienceType: "wine-tour", commercialTier: "premium" },
  { productCode: "25265P18", sourceUrl: "https://www.viator.com/tours/Sedona/Jeep-Horseback-Riding-and-Wine-Tasting/d750-25265P18", experienceType: "wine-tour", commercialTier: "premium" },
  { productCode: "165904P29", sourceUrl: "https://www.viator.com/tours/Sedona/Private-Winery-Tour/d750-165904P29", experienceType: "wine-tour", commercialTier: "premium" },
];

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
    html.match(/"reviewCount"\s*:\s*(\d+)/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1], 10) : null;

  const durationMatch =
    html.match(/(\d+(?:\s*to\s*\d+)?\s*(?:hours?|minutes?|days?)(?:\s*\d+\s*minutes?)?(?:\s*\(approx\.\))?)/i);
  const duration = durationMatch?.[1] ?? null;

  const heroMatch =
    html.match(/https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"'\s]+/i) ??
    html.match(/https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/r\/[^"'\s]+/i);
  const heroUrl = heroMatch?.[0] ?? null;

  const productUrlMatch = html.match(
    /https:\/\/www\.viator\.com\/tours\/Sedona\/[^"'\s]+/i
  );
  const resolvedUrl = productUrlMatch?.[0] ?? null;

  return { title, priceFrom, rating, reviewCount, duration, heroUrl, resolvedUrl };
};

const main = async () => {
  const results: Record<string, unknown>[] = [];
  const rejected: Record<string, unknown>[] = [];

  for (const candidate of CANDIDATES) {
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

      if (availability.available && extracted.title && extracted.priceFrom) {
        results.push(entry);
        console.log(`OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom})`);
      } else {
        rejected.push(entry);
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

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  writeFileSync(
    "scripts/sedona-viator-discovery-results.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );
  console.log(`\nAvailable: ${results.length}, Rejected: ${rejected.length}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
