/**
 * Live Viator public page discovery for Fort Lauderdale Engine6 candidates.
 * Run: npx tsx scripts/discover-fort-lauderdale-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

const EXISTING_CODES = new Set([
  "383300P6",
  "89173P8",
  "76145P2",
  "118958P8",
  "6331BAHA",
  "57834P1",
  "89173P10",
]);

const CANDIDATES = [
  { productCode: "169162P11", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Private-Yacht-Cruise-4-or-6-hours-around-Miami-Bay/d660-169162P11" },
  { productCode: "155077P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Private-Yacht-Cruise-through-Fort-Lauderdale/d660-155077P1" },
  { productCode: "169162P5", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/8-Person-Boat-Rental-Gas-included-be-your-own-captain-Price-per-boat/d660-169162P5" },
  { productCode: "143322P5", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Champagne-Sunset-Cruise-Ft-Lauderdale/d660-143322P5" },
  { productCode: "143322P4", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Sail-Splash/d660-143322P4" },
  { productCode: "68236P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Sailing-Charter/d660-68236P1" },
  { productCode: "270280P83", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdale-Ocean-and-Intracoastal-Sunset-Cruise/d660-270280P83" },
  { productCode: "316001", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Jungle-Queen-Riverboat-Dinner-Cruise-and-Show/d660-316001" },
  { productCode: "5190PRIVATE", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Private-Tour-Florida-Everglades-Airboat-Ride-and-Wildlife-Adventure/d660-5190PRIVATE" },
  { productCode: "38214P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Everglades-VIP-Tour-with-Transportation-Included/d660-38214P1" },
  { productCode: "44152P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Everglades-Adventure/d660-44152P1" },
  { productCode: "44152P2", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Swamp-Walk-with-a-Naturalist-and-Ten-Thousand-Islands-Boat-Tour/d660-44152P2" },
  { productCode: "5698ADEAST", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Small-Group-Tour-Everglades-Adventure-Day-Trip-from-Ft-Lauderdale/d660-5698ADEAST" },
  { productCode: "7289P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Everglades-Airboat-Tour-from-Fort-Lauderdale/d660-7289P1" },
  { productCode: "38439P2", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdale-to-Key-West-Tour/d660-38439P2" },
  { productCode: "443622P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Ft-Lauderdale-to-Key-West-bus-tour-w-6-hours-of-free-time-in-KW/d660-443622P1" },
  { productCode: "270280P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Parasailing/d660-270280P1" },
  { productCode: "5546582P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Ft-Lauderdale-Parasailing-Along-Ft-Lauderdale-Beach/d660-5546582P1" },
  { productCode: "270280P53", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Sea-Rocket-Speed-Boat-Cruise-in-Fort-Lauderdale/d660-270280P53" },
  { productCode: "50605P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Drift-Fishing-Trip/d660-50605P1" },
  { productCode: "86313P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/1-Hour-Jet-Ski-Rental/d660-86313P1" },
  { productCode: "5221P41", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Bimini-Day-Trip-from-Miami/d660-5221P41" },
  { productCode: "6331P15", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Miami-Bahamas-Day-Trip-with-Pig-Beach-option/d660-6331P15" },
  { productCode: "5190AIRBOAT", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Florida-Everglades-Airboat-Adventure-and-Wildlife-Encounter-Ticket/d660-5190AIRBOAT" },
  { productCode: "5865P8", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Florida-Everglades-Airboat-Tour-and-Show-from-Fort-Lauderdale-Group/d660-5865P8" },
  { productCode: "6879FLLRFC", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Riverfront-Cruises-Venice-of-America-Tour/d660-6879FLLRFC" },
  { productCode: "3160P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/90-Minute-Narrated-Sightseeing-Cruises/d660-3160P1" },
  { productCode: "125185P1", sourceUrl: "https://www.viator.com/tours/Fort-Lauderdale/Holiday-Cruise/d660-125185P1" },
];

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;
  const priceMatch =
    html.match(/From[\s$€£]*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i);
  const priceFrom = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : null;
  const ratingMatch =
    html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i) ??
    html.match(/"averageRating"\s*:\s*([0-9.]+)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  const reviewMatch =
    html.match(/"totalReviews"\s*:\s*(\d+)/i) ??
    html.match(/"reviewCount"\s*:\s*(\d+)/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ""), 10) : null;
  const durationMatch = html.match(
    /(\d+(?:\s*to\s*\d+)?\s*(?:hours?|minutes?|days?)(?:\s*\d+\s*minutes?)?(?:\s*\(approx\.\))?)/i
  );
  const duration = durationMatch?.[1] ?? null;
  const heroMatch =
    html.match(/https:\/\/dynamic-media\.tacdn\.com\/media\/photo-o\/[^"'\s]+/i) ??
    html.match(/https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"'\s]+/i);
  const heroUrl = heroMatch?.[0] ?? null;
  const categoryMatches = [...html.matchAll(/"categoryName"\s*:\s*"([^"]+)"/gi)];
  const categories = [...new Set(categoryMatches.map(m => m[1]))].slice(0, 5);
  return { title, priceFrom, rating, reviewCount, duration, heroUrl, categories };
};

const main = async () => {
  const results = [];
  for (const candidate of CANDIDATES) {
    if (EXISTING_CODES.has(candidate.productCode)) continue;
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
      results.push({
        ...candidate,
        ...extracted,
        available: availability.available,
        rejectReason: availability.rejectReason ?? null,
        htmlLen: page.html.length,
      });
      console.log(
        `${candidate.productCode}: $${extracted.priceFrom} avail=${availability.available} hero=${extracted.heroUrl ? "yes" : "no"}`
      );
    } catch (e) {
      results.push({ ...candidate, error: String(e) });
      console.log(`ERR ${candidate.productCode}`);
    }
  }
  writeFileSync(
    "scripts/fort-lauderdale-viator-discovery-results.json",
    `${JSON.stringify(results, null, 2)}\n`
  );
  console.log(`Wrote ${results.length} discovery results.`);
};

await main();
