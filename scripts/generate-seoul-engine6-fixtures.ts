/**
 * Generates Seoul Engine6 fixtures from live product data.
 * Run: npx tsx scripts/generate-seoul-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  SEOUL_VIATOR_PUBLIC_RATINGS,
  SEOUL_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "../src/engine6/seoulViatorPublicRatings";

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

type SeoulTourFixture = {
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

const LIVE_DATA_PATH = "scripts/seoul-live-product-data.json";
const EDITORIAL_OVERRIDES_PATH = "scripts/seoul-editorial-overrides.json";
const DESTINATION_CITY = "Seoul";
const DESTINATION_STATE = "South Korea";
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
      `Seoul product ${live.productCode} needs at least two verified itinerary stops`
    );
  }

  return stops.map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): SeoulTourFixture => {
  const usdPrice = SEOUL_VIATOR_PUBLIC_USD_FROM_PRICES[live.productCode];
  const priceFrom = usdPrice ?? parsePrice(live.priceFrom);
  if (!usdPrice || priceFrom !== usdPrice) {
    throw new Error(
      `Seoul product ${live.productCode} is missing a verified USD From price`
    );
  }
  const rating =
    live.rating ??
    SEOUL_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    null;
  const reviewCount =
    live.reviewCount ??
    SEOUL_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  if (rating == null) {
    throw new Error(
      `Seoul product ${live.productCode} is missing a verified rating`
    );
  }
  const description = EDITORIAL_OVERRIDES[live.productCode]?.replace(
    /\s+/g,
    " "
  ).trim();
  if (!description) {
    throw new Error(
      `Seoul product ${live.productCode} is missing an approved narrative`
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
      "Meet your guide at the confirmed Seoul meeting location listed when booking.",
    endDescription:
      "Return to your Seoul meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions:
      live.inclusions && live.inclusions.length > 0
        ? live.inclusions.slice(0, 8)
        : ["Professional guide", "Tour activity as described on Viator"],
    categories:
      live.categories.length > 0
        ? live.categories
        : ["Sightseeing Tours", "Outdoor Activities"],
  };
};

const SELECTION_PATH = "scripts/seoul-product-selection.json";
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

const SEOUL_TOURS: SeoulTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: SeoulTourFixture) => {
  const viatorRatings = SEOUL_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;
  const usdPrice = SEOUL_VIATOR_PUBLIC_USD_FROM_PRICES[tour.productCode];

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
          question: "Where does the tour depart from for Seoul?",
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

    for (const tour of SEOUL_TOURS) {
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

    console.log(`Bootstrapped ${SEOUL_TOURS.length} Seoul Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Seoul",
    destinationCitySlug: "seoul",
    stateSlug: "south-korea",
    citySlug: "seoul",
    viatorDestinationSlug: "Seoul",
    targetPremiumShare: 0.4,
    tours: SEOUL_TOURS,
    buildFixture,
    destinationLogLabel: "Seoul",
  });
};

await main();
