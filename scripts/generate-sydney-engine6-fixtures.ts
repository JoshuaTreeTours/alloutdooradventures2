/**
 * Generates Sydney Engine6 fixtures from live product data.
 * Run: npx tsx scripts/generate-sydney-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  SYDNEY_VIATOR_PUBLIC_RATINGS,
  SYDNEY_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "../src/engine6/sydneyViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type LiveProduct = {
  productCode: string;
  productUrl: string;
  title: string;
  priceFrom: string;
  rating: number | null;
  reviewCount: number;
  duration: string;
  heroUrl: string;
  overview: string | null;
  itineraryStops: string[];
  categories: string[];
  inclusions?: string[];
  startDescription?: string;
  highlights?: string[];
  experienceType?: string;
};

type SydneyTourFixture = {
  productCode: string;
  productUrl: string;
  title: string;
  description: string;
  duration: string;
  priceFrom: number;
  heroUrl: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  startDescription: string;
  endDescription: string;
  itineraryItems: ItineraryItem[];
  inclusions: string[];
  categories: string[];
};

const LIVE_DATA_PATH = "scripts/sydney-live-product-data.json";
const EDITORIAL_OVERRIDES_PATH = "scripts/sydney-editorial-overrides.json";
const DESTINATION_CITY = "Sydney";
const DESTINATION_STATE = "Australia";
const EDITORIAL_OVERRIDES = JSON.parse(
  readFileSync(EDITORIAL_OVERRIDES_PATH, "utf8")
) as Record<string, string>;

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/^#+\s*/, "")
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const resolveItineraryItems = (live: LiveProduct): ItineraryItem[] => {
  const rawStops = live.itineraryStops.filter(Boolean);
  const stops = rawStops.map(stop => ({
    title: cleanItineraryTitle(stop),
    stopType: /\(Pass By\)/i.test(stop)
      ? ("pass-by" as const)
      : ("stop" as const),
  }));

  if (stops.length < 2) {
    throw new Error(
      `Sydney product ${live.productCode} needs at least two verified itinerary stops`
    );
  }

  return stops.map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): SydneyTourFixture => {
  const usdPrice = SYDNEY_VIATOR_PUBLIC_USD_FROM_PRICES[live.productCode];
  const priceFrom = usdPrice ?? parsePrice(live.priceFrom);
  if (!usdPrice || priceFrom !== usdPrice) {
    throw new Error(
      `Sydney product ${live.productCode} is missing a verified USD From price`
    );
  }
  const rating =
    live.rating ??
    SYDNEY_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    null;
  const reviewCount =
    live.reviewCount ??
    SYDNEY_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  if (rating == null) {
    throw new Error(
      `Sydney product ${live.productCode} is missing a verified rating`
    );
  }
  const description = EDITORIAL_OVERRIDES[live.productCode]?.replace(
    /\s+/g,
    " "
  ).trim();
  if (!description) {
    throw new Error(
      `Sydney product ${live.productCode} is missing an approved narrative`
    );
  }

  return {
    productCode: live.productCode,
    productUrl: live.productUrl,
    title: live.title,
    description,
    duration: live.duration || "TBD (approx.)",
    priceFrom,
    heroUrl: live.heroUrl,
    rating,
    reviewCount,
    highlights: (live.highlights ?? []).slice(0, 5),
    startDescription:
      live.startDescription?.trim() ||
      "Meet the guide at the confirmed Sydney meeting location listed when booking.",
    endDescription:
      "Return to the Sydney meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions:
      live.inclusions && live.inclusions.length > 0
        ? live.inclusions.slice(0, 8)
        : ["Professional guide", "Tour activity as described on Viator"],
    categories:
      live.categories.length > 0
        ? live.categories
        : ["Sightseeing Tours", "Walking Tours"],
  };
};

const SELECTION_PATH = "scripts/sydney-product-selection.json";
const selection = JSON.parse(readFileSync(SELECTION_PATH, "utf8")) as {
  selectedProductCodes: string[];
};
const allLiveProducts = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
) as LiveProduct[];
const liveProducts = selection.selectedProductCodes.map(code => {
  const product = allLiveProducts.find(entry => entry.productCode === code);
  if (!product) {
    throw new Error(`Missing live product data for selected code ${code}`);
  }
  return product;
});

const SYDNEY_TOURS: SydneyTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: SydneyTourFixture) => {
  const viatorRatings = SYDNEY_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;
  const usdPrice = SYDNEY_VIATOR_PUBLIC_USD_FROM_PRICES[tour.productCode];

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: DESTINATION_CITY, state: DESTINATION_STATE },
      duration: tour.duration,
      priceFrom: `From $${usdPrice.toFixed(2)}`,
      reviews: {
        combinedAverageRating: rating,
        totalReviews: reviewCount,
      },
      media: {
        images: [
          {
            isCover: true,
            variants: {
              FULL: {
                url: tour.heroUrl,
                width: 674,
                height: 446,
              },
            },
          },
        ],
      },
      highlights: tour.highlights,
      logistics: {
        start: { description: tour.startDescription },
        end: { description: tour.endDescription },
      },
      itinerarySummary: `${tour.description.split(".").slice(0, 1).join(".")}.`,
      itineraryItems: tour.itineraryItems.map(item => ({
        ...item,
        description: "",
      })),
      inclusions: tour.inclusions,
      additionalInfo: [
        "Confirmation will be received at time of booking",
        "Near public transportation",
        "Most travelers can participate",
      ],
      faqs: [
        {
          question: `How long is the ${tour.title}?`,
          answer: `The planned duration is ${tour.duration.replace(" (approx.)", "")}.`,
        },
        {
          question: "Where does the tour depart from for Sydney?",
          answer: tour.startDescription,
        },
      ],
      categories: tour.categories.map(label => ({ label })),
      pricing: {
        summary: { fromPrice: usdPrice },
        currency: "USD",
      },
    },
  };
};

const main = async () => {
  if (process.argv.includes("--bootstrap")) {
    const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
    mkdirSync(outputDir, { recursive: true });

    for (const tour of SYDNEY_TOURS) {
      const filePath = path.join(
        outputDir,
        `${tour.productCode}.exact-product.json`
      );
      writeFileSync(
        filePath,
        `${JSON.stringify(buildFixture(tour), null, 2)}\n`,
        "utf8"
      );
      console.log(`Wrote ${filePath}`);
    }

    console.log(`Bootstrapped ${SYDNEY_TOURS.length} Sydney Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Sydney",
    destinationCitySlug: "sydney",
    stateSlug: "australia",
    citySlug: "sydney",
    viatorDestinationSlug: "Sydney",
    targetPremiumShare: 0.3,
    tours: SYDNEY_TOURS,
    buildFixture,
    destinationLogLabel: "Sydney",
  });
};

await main();
