/**
 * One-off discovery: live Viator public page data for Chicago candidates.
 * Run: npx tsx scripts/discover-chicago-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

type Candidate = {
  productCode: string;
  sourceUrl: string;
  experienceType: string;
  commercialTier?: "premium" | "standard";
};

const CANDIDATES: Candidate[] = [
  {
    productCode: "5580ARC",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Architecture-River-Cruise/d673-5580ARC",
    experienceType: "architecture-cruise",
  },
  {
    productCode: "76126P2",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Lake-and-River-Architecture-Tour/d673-76126P2",
    experienceType: "architecture-cruise",
    commercialTier: "premium",
  },
  {
    productCode: "76126P8",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Sunset-Cruise/d673-76126P8",
    experienceType: "sunset-cruise",
  },
  {
    productCode: "5580SKY",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Lake-Michigan-Sightseeing-Cruise/d673-5580SKY",
    experienceType: "lake-cruise",
  },
  {
    productCode: "35169P12",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Skyline-Sunset-Sail-Aboard-Official-Flagship-of-Chicago-148-S-V-Windy/d673-35169P12",
    experienceType: "sunset-cruise",
  },
  {
    productCode: "338277P2",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Small-Group-River-Boat-Tour-in-Chicago/d673-338277P2",
    experienceType: "river-cruise",
    commercialTier: "premium",
  },
  {
    productCode: "5680NIGHT",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-by-Night-Helicopter-Tour/d673-5680NIGHT",
    experienceType: "helicopter",
    commercialTier: "premium",
  },
  {
    productCode: "5680DAY",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-City-Sights-Helicopter-Tour/d673-5680DAY",
    experienceType: "helicopter",
    commercialTier: "premium",
  },
  {
    productCode: "61552P17",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Gangster-Food-Tour/d673-61552P17",
    experienceType: "food-gangster",
    commercialTier: "premium",
  },
  {
    productCode: "7812P133",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Private-Tour-Secret-Food-Tours-Chicago/d673-7812P133",
    experienceType: "food-tour-private",
    commercialTier: "premium",
  },
  {
    productCode: "8841P19",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Architecture-and-Highlights-with-Local-Treat-Small-Group-Walking-Tour/d673-8841P19",
    experienceType: "private-walking",
    commercialTier: "premium",
  },
  {
    productCode: "188341P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Private-4-hour-Walking-Tour/d673-188341P1",
    experienceType: "private-walking",
    commercialTier: "premium",
  },
  {
    productCode: "8841P87",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Architecture-and-Highlights-Tour/d673-8841P87",
    experienceType: "private-walking",
    commercialTier: "premium",
  },
  {
    productCode: "30994P2",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Open-Your-Eyes-Walking-Tour/d673-30994P2",
    experienceType: "walking-tour",
  },
  {
    productCode: "130651P13",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Walking-Tour-Chicago-Passageways-Pedway-and-Riverwalk/d673-130651P13",
    experienceType: "walking-tour",
  },
  {
    productCode: "3397P10",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Bike-Tour/d673-3397P10",
    experienceType: "bike-tour",
  },
  {
    productCode: "3332DAY",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Lakefront-Neighborhoods-Bicycle-Tour/d673-3332DAY",
    experienceType: "bike-neighborhood",
  },
  {
    productCode: "3332BITE",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Tastes-of-Chicago-Bike-Tour-Chicago-Style-Pizza-Beer-Cupcakes-and-Hot-Dogs/d673-3332BITE",
    experienceType: "bike-food",
    commercialTier: "premium",
  },
  {
    productCode: "316128P3",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Private-Chicago-Scenic-Driving-Tour/d673-316128P3",
    experienceType: "private-driving",
    commercialTier: "premium",
  },
  {
    productCode: "5042P100",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Odyssey-Fireworks-Dinner-Cruise/d673-5042P100",
    experienceType: "premium-dinner-cruise",
    commercialTier: "premium",
  },
  {
    productCode: "46250P9",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Private-Lake-Michigan-Sailing-Charter-and-Sightseeing-Chicago-Skyline-Cruise/d673-46250P9",
    experienceType: "private-sailing",
    commercialTier: "premium",
  },
  {
    productCode: "68189P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Explore-Chicagos-notorious-mob-and-gangster-past-aboard-a-luxury-bus/d673-68189P1",
    experienceType: "gangster-bus",
  },
  {
    productCode: "61552P8",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Gangsters-and-Ghosts-Tour-in-Chicago/d673-61552P8",
    experienceType: "gangster-walking",
  },
  {
    productCode: "33187P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Mercurys-Urban-Adventure-Cruise/d673-33187P1",
    experienceType: "river-cruise",
  },
  {
    productCode: "191307P3",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Gangs-and-Mobsters-Crime-Tour-at-Chicago/d673-191307P3",
    experienceType: "gangster-history",
  },
  {
    productCode: "7812P219",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-walking-tasting-tour-with-Secret-Food-Tours/d673-7812P219",
    experienceType: "food-tour",
  },
  {
    productCode: "126870P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Architecture-Foundation-Center-River-Cruise/d673-126870P1",
    experienceType: "architecture-cruise",
    commercialTier: "premium",
  },
  {
    productCode: "76126P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Architecture-Foundation-River-Cruise/d673-76126P1",
    experienceType: "architecture-cruise",
  },
  {
    productCode: "32280P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Shoreline-Architecture-River-Cruise/d673-32280P1",
    experienceType: "architecture-cruise",
  },
  {
    productCode: "328653P5",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Private-Chicago-Skyline-Helicopter-Tour/d673-328653P5",
    experienceType: "helicopter-private",
    commercialTier: "premium",
  },
  {
    productCode: "126471P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Helicopter-Tour/d673-126471P1",
    experienceType: "helicopter",
    commercialTier: "premium",
  },
  {
    productCode: "296848P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Art-Institute-of-Chicago-Skip-the-Line-Tour-Private/d673-296848P1",
    experienceType: "museum-private",
    commercialTier: "premium",
  },
  {
    productCode: "520236P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Art-Institute-of-Chicago-Tour-with-Skip-the-Line-Tickets-Semi-Private/d673-520236P1",
    experienceType: "museum-tour",
    commercialTier: "premium",
  },
  {
    productCode: "67327P2",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Private-Chicago-City-Tour/d673-67327P2",
    experienceType: "private-city",
    commercialTier: "premium",
  },
  {
    productCode: "7953P1",
    sourceUrl:
      "https://www.viator.com/tours/Chicago/Private-Chicago-City-Tour-with-Hotel-Pickup/d673-7953P1",
    experienceType: "private-city",
    commercialTier: "premium",
  },
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
      /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/r\/[^"'\s]+/i
    );
  const heroUrl = heroMatch?.[0] ?? null;

  const itineraryStops: string[] = [];
  const stopPattern = /^([A-Z][^\n(]+?)(?:\(Pass By\))?\s*$/gm;
  let match;
  while ((match = stopPattern.exec(html)) !== null) {
    const stop = match[1].trim();
    if (
      stop.length > 3 &&
      stop.length < 80 &&
      !stop.includes("What's Included") &&
      !stop.includes("Meeting")
    ) {
      itineraryStops.push(stop);
    }
  }

  return { title, priceFrom, rating, reviewCount, duration, heroUrl, itineraryStops };
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
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom}, ${extracted.reviewCount ?? "?"} reviews)`
        );
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
    "scripts/chicago-viator-discovery-results.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );
  console.log(`\nAvailable: ${results.length}, Rejected: ${rejected.length}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
