/**
 * One-off discovery: live Viator public page data for Boston candidates.
 * Run: npx tsx scripts/discover-boston-viator-catalog.ts
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
    productCode: "3283BWW",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Whale-Watching-Cruise/d678-3283BWW",
    experienceType: "whale-watching",
    commercialTier: "premium",
  },
  {
    productCode: "3283SSCRUISE",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Historic-Sightseeing-Cruise/d678-3283SSCRUISE",
    experienceType: "harbor-cruise",
    commercialTier: "premium",
  },
  {
    productCode: "44921P7",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Sunset-Cruise/d678-44921P7",
    experienceType: "sunset-cruise",
    commercialTier: "premium",
  },
  {
    productCode: "3037DUCK",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Duck-Tour/d678-3037DUCK",
    experienceType: "duck-tour",
  },
  {
    productCode: "66111P3",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Explore-Revolutionary-Boston-Freedom-Trail-History-Tour/d678-66111P3",
    experienceType: "freedom-trail-walking",
    commercialTier: "premium",
  },
  {
    productCode: "26797P4",
    sourceUrl:
      "https://www.viator.com/tours/Boston/The-Tour-of-The-Freedom-Trail/d678-26797P4",
    experienceType: "freedom-trail-walking",
  },
  {
    productCode: "8843P7",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Tour-of-the-Freedom-Trail/d678-8843P7",
    experienceType: "freedom-trail-walking",
    commercialTier: "premium",
  },
  {
    productCode: "7167P68",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Freedom-Trail-and-North-End-Neighborhood-Walking-Tour/d678-7167P68",
    experienceType: "freedom-trail-walking",
    commercialTier: "premium",
  },
  {
    productCode: "5046BOS_OTT",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Hop-on-Hop-off-Trolley-Tour/d678-5046BOS_OTT",
    experienceType: "hop-on-hop-off",
  },
  {
    productCode: "7812P131",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-Tour-Secret-Food-Tours-Boston-North-End/d678-7812P131",
    experienceType: "food-tour-private",
    commercialTier: "premium",
  },
  {
    productCode: "8841P14",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Bostons-Quincy-Market-and-North-End-Food-Tour-Small-Group-Walking-Tour/d678-8841P14",
    experienceType: "food-tour",
    commercialTier: "premium",
  },
  {
    productCode: "400049P3",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Food-and-History-Private-Tour/d678-400049P3",
    experienceType: "food-tour-private",
    commercialTier: "premium",
  },
  {
    productCode: "8647P466",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-half-Day-Tour-to-Salem-and-Marbelhead-from-Boston-with-pick-up/d678-8647P466",
    experienceType: "salem-day-trip-private",
    commercialTier: "premium",
  },
  {
    productCode: "400049P5",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-Day-Trip-to-Lexington-and-Concord-from-Boston/d678-400049P5",
    experienceType: "lexington-concord-private",
    commercialTier: "premium",
  },
  {
    productCode: "385595P5",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Lexington-and-Concord-Day-Tour/d678-385595P5",
    experienceType: "lexington-concord-private",
    commercialTier: "premium",
  },
  {
    productCode: "5046BOS_GG",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Ghosts-and-Gravestones-Tour/d678-5046BOS_GG",
    experienceType: "ghost-tour",
  },
  {
    productCode: "3283CODZILLA",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Codzilla-Thrill-Boat-Ride/d678-3283CODZILLA",
    experienceType: "thrill-boat",
  },
  {
    productCode: "7812P19",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Walking-Food-Tour-With-Secret-Food-Tours/d678-7812P19",
    experienceType: "food-tour",
    commercialTier: "premium",
  },
  {
    productCode: "61552P17",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Food-Tour/d678-61552P17",
    experienceType: "food-tour",
    commercialTier: "premium",
  },
  {
    productCode: "188341P1",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-4-hour-Walking-Tour/d678-188341P1",
    experienceType: "private-walking",
    commercialTier: "premium",
  },
  {
    productCode: "67327P2",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-Boston-City-Tour/d678-67327P2",
    experienceType: "private-city",
    commercialTier: "premium",
  },
  {
    productCode: "7953P1",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-Boston-City-Tour-with-Hotel-Pickup/d678-7953P1",
    experienceType: "private-city",
    commercialTier: "premium",
  },
  {
    productCode: "316128P3",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-Boston-Scenic-Driving-Tour/d678-316128P3",
    experienceType: "private-driving",
    commercialTier: "premium",
  },
  {
    productCode: "68189P1",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Gangster-Tour/d678-68189P1",
    experienceType: "history-tour",
  },
  {
    productCode: "130651P13",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Walking-Tour-Boston-Passageways-Pedway-and-Riverwalk/d678-130651P13",
    experienceType: "walking-tour",
  },
  {
    productCode: "3397P10",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Bike-Tour/d678-3397P10",
    experienceType: "bike-tour",
  },
  {
    productCode: "5042P100",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Boston-Dinner-Cruise/d678-5042P100",
    experienceType: "dinner-cruise",
    commercialTier: "premium",
  },
  {
    productCode: "46250P9",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Private-Boston-Harbor-Sailing-Charter/d678-46250P9",
    experienceType: "private-sailing",
    commercialTier: "premium",
  },
  {
    productCode: "25265P29",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Salem-and-Marblehead-Day-Trip-from-Boston/d678-25265P29",
    experienceType: "salem-day-trip",
    commercialTier: "premium",
  },
  {
    productCode: "5769MTVN",
    sourceUrl:
      "https://www.viator.com/tours/Boston/Cape-Cod-Day-Trip-from-Boston/d678-5769MTVN",
    experienceType: "day-trip",
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
      const titleLower = (extracted.title ?? "").toLowerCase();
      const rejectReasons: string[] = [];

      if (/audio tour|self[- ]guided|gps tour|smartphone tour|app tour/i.test(titleLower)) {
        rejectReasons.push("audio/self-guided");
      }
      if (!extracted.heroUrl?.includes("attractions-splice")) {
        rejectReasons.push("no product-specific hero");
      }

      const entry = {
        ...candidate,
        available: availability.available,
        availabilityReason: availability.reason,
        rejectReasons,
        httpStatus: page.httpStatus,
        finalUrl: page.finalUrl,
        ...extracted,
      };

      if (
        availability.available &&
        extracted.title &&
        extracted.priceFrom &&
        rejectReasons.length === 0
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom}, ${extracted.reviewCount ?? "?"} reviews)`
        );
      } else {
        rejected.push(entry);
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} hero=${!!extracted.heroUrl} price=${extracted.priceFrom} reasons=${rejectReasons.join(",") || availability.reason}`
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
    "scripts/boston-viator-discovery-results.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );

  const liveData = results.map(r => ({
    productCode: r.productCode,
    productUrl: r.sourceUrl,
    title: r.title,
    priceFrom: r.priceFrom ? `From $${(r.priceFrom as number).toFixed(2)}` : "",
    rating: r.rating,
    reviewCount: r.reviewCount ?? 0,
    duration: r.duration ? `${r.duration} (approx.)` : "",
    heroUrl: r.heroUrl,
    overview: null,
    itineraryStops: r.itineraryStops ?? [],
    categories: [],
    experienceType: r.experienceType,
    commercialTier: r.commercialTier,
  }));

  writeFileSync(
    "scripts/boston-live-product-data.json",
    `${JSON.stringify(liveData, null, 2)}\n`
  );

  console.log(`\nAvailable: ${results.length}, Rejected: ${rejected.length}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
