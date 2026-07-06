/**
 * Generates Honolulu Engine6 fixtures from honolulu-live-product-data.json
 * Run: npx tsx scripts/generate-honolulu-engine6-fixtures.ts
 * Bootstrap only: npx tsx scripts/generate-honolulu-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { HONOLULU_VIATOR_PUBLIC_RATINGS } from "../src/engine6/honoluluViatorPublicRatings";

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
};

type HonoluluTourFixture = {
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

const LIVE_DATA_PATH = "scripts/honolulu-live-product-data.json";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const HONOLULU_FALLBACK_STOPS = [
  "Pearl Harbor",
  "USS Arizona Memorial",
  "Diamond Head",
  "North Shore",
  "Haleiwa",
  "Dole Plantation",
  "Waimea Valley",
  "Polynesian Cultural Center",
  "Kualoa Ranch",
  "Waikiki",
];

const PEARL_HARBOR_FALLBACK_STOPS = [
  "Pearl Harbor",
  "USS Arizona Memorial",
  "Battleship Missouri Memorial",
  "Pearl Harbor Aviation Museum",
  "Honolulu",
];

const CIRCLE_ISLAND_FALLBACK_STOPS = [
  "Diamond Head",
  "North Shore",
  "Haleiwa",
  "Dole Plantation",
  "Waimea Valley",
  "Polynesian Cultural Center",
  "Kualoa Ranch",
];

const HELICOPTER_FALLBACK_STOPS = [
  "Diamond Head",
  "Sacred Falls",
  "Pearl Harbor",
  "Kualoa Ranch",
  "North Shore",
  "Waikiki",
];

const LUAU_FALLBACK_STOPS = [
  "Polynesian Cultural Center",
  "Waikiki",
  "North Shore",
  "Kualoa Ranch",
];

const SNORKEL_FALLBACK_STOPS = [
  "Hanauma Bay",
  "Waikiki",
  "North Shore",
  "Kualoa Ranch",
];

const NORTH_SHORE_FALLBACK_STOPS = [
  "Haleiwa",
  "North Shore",
  "Waimea Valley",
  "Dole Plantation",
];

const VOLCANO_FALLBACK_STOPS = [
  "Hawaii Volcanoes National Park",
  "Kilauea",
  "Black Sand Beach",
  "Kona",
];

const SURF_FALLBACK_STOPS = [
  "Waikiki",
  "North Shore",
  "Haleiwa",
];

const HIKING_FALLBACK_STOPS = [
  "Diamond Head",
  "Manoa Falls",
  "Waimea Valley",
  "North Shore",
];

const THEATER_SHOW_FALLBACK_STOPS = [
  "Waikiki Beachcomber Hotel",
  "OUTRIGGER Waikiki Beach Resort",
  "Kalakaua Avenue",
  "Waikiki",
];

const PRODUCT_ITINERARY_OVERRIDES: Record<string, string[]> = {
  "375182P1": [
    "Honolulu",
    "Diamond Head State Monument",
    "Halona Blowhole",
    "Dole Plantation",
    "Makapu'u Beach",
    "Waimea Bay",
    "Kahuku Farms",
  ],
  "469693P1": [
    "Honolulu",
    "Waikiki Beachcomber Hotel",
    "OUTRIGGER Waikiki Beach Resort",
    "Kalakaua Avenue",
  ],
  "3961P32": [
    "Honolulu",
    "Waikiki",
    "Rock-A-Hula Show",
    "Kalakaua Avenue",
  ],
};

const sentenceSplit = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !/highlights?|Choose from|Read more/i.test(s));

const buildEditorialDescription = (live: LiveProduct) => {
  const sentences = sentenceSplit(live.overview ?? "");
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(name => name && !/^(Honolulu|Oahu)$/i.test(name))
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with an Oahu-based outfitter.`;
  const detail =
    (sentences[1] ??
      "Your guide covers Pearl Harbor memorials, circle-island routing, North Shore surf towns, helicopter flyovers, luau evenings, or reef snorkeling depending on the route.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Transportation, equipment, and local commentary are handled so you can focus on Oahu's coastlines, valleys, and cultural landmarks.";
  const audience =
    "Ideal for travelers basing in Honolulu who want a guided Oahu experience without coordinating transport, gear, or admission tickets on their own.";

  const text = [lead, detail, format, audience].join(" ");
  if (!/\b(?:Honolulu|Oahu)\b/i.test(text)) {
    return `${text} Departures are coordinated from Honolulu, Hawaii.`;
  }
  return text;
};

const resolveItineraryItems = (live: LiveProduct): ItineraryItem[] => {
  const overrideStops = PRODUCT_ITINERARY_OVERRIDES[live.productCode];
  if (overrideStops) {
    return overrideStops.slice(0, 8).map((stopTitle, index) => ({
      title: stopTitle,
      description: "",
      duration: index === 0 ? "30 minutes" : undefined,
      stopType:
        index === overrideStops.length - 1 ? ("pass-by" as const) : ("stop" as const),
    }));
  }

  const rawStops = live.itineraryStops.filter(Boolean);
  let stops = rawStops.map(stop => ({
    title: cleanItineraryTitle(stop),
    stopType: /\(Pass By\)/i.test(stop) ? ("pass-by" as const) : ("stop" as const),
  }));

  if (stops.length < 2) {
    const title = live.title.toLowerCase();
    const fallback = /pearl harbor|uss arizona|battleship|memorial/i.test(title)
      ? ["Honolulu", ...PEARL_HARBOR_FALLBACK_STOPS]
      : /circle island|grand tour around island|island tour|oahu tour/i.test(title)
        ? ["Honolulu", ...CIRCLE_ISLAND_FALLBACK_STOPS]
        : /cirque|theater show|theatre show|rock-a-hula|ʻauana|auana|show ticket/i.test(
              title
            ) || live.categories.some(category => /theater show/i.test(category))
          ? ["Honolulu", ...THEATER_SHOW_FALLBACK_STOPS]
          : /helicopter|aerial|doors off|flyover/i.test(title)
            ? ["Honolulu", ...HELICOPTER_FALLBACK_STOPS]
            : /luau|polynesian cultural|hula|feast/i.test(title)
              ? ["Honolulu", ...LUAU_FALLBACK_STOPS]
              : /snorkel|reef|turtle|catamaran|dolphin|whale/i.test(title)
                ? ["Honolulu", ...SNORKEL_FALLBACK_STOPS]
              : /north shore|haleiwa|waimea valley|dole/i.test(title)
                ? ["Honolulu", ...NORTH_SHORE_FALLBACK_STOPS]
                : /volcano|kilauea|big island|inter-island/i.test(title)
                  ? ["Honolulu", ...VOLCANO_FALLBACK_STOPS]
                  : /surf|stand up paddle|paddleboard/i.test(title)
                    ? ["Honolulu", ...SURF_FALLBACK_STOPS]
                    : /hike|hiking|diamond head|waterfall|manoa/i.test(title)
                      ? ["Honolulu", ...HIKING_FALLBACK_STOPS]
                      : ["Honolulu", ...HONOLULU_FALLBACK_STOPS];
    stops = fallback.map((stopTitle, index) => ({
      title: stopTitle,
      stopType: index === fallback.length - 1 ? ("pass-by" as const) : ("stop" as const),
    }));
  }

  if (stops.length === 1) {
    stops = [{ title: "Honolulu", stopType: "stop" as const }, stops[0]];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): HonoluluTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    HONOLULU_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    HONOLULU_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from Honolulu`,
          "Professional Oahu guide or captain",
        ].slice(0, 5)
      : [
          `${live.title} from Honolulu`,
          "Pearl Harbor, North Shore, or Waikiki routing",
          "Professional guide with Oahu expertise",
          "Small-group or private format as listed",
          "Honolulu cultural, coastal, or aerial experience",
        ];

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
    highlights,
    startDescription:
      "Meet your guide at the confirmed Honolulu or Waikiki hotel pickup point, marina, or meeting location listed when booking.",
    endDescription:
      "Return to your Honolulu or Waikiki hotel or meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions: [
      "Professional guide or captain",
      "Tour activity as described on Viator",
      "Safety equipment where applicable",
    ],
    categories:
      live.categories.length > 0
        ? live.categories
        : ["Sightseeing Tours", "Outdoor Activities"],
  };
};

const liveProducts = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
) as LiveProduct[];

const HONOLULU_TOURS: HonoluluTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: HonoluluTourFixture) => {
  const viatorRatings = HONOLULU_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Honolulu", state: "Hawaii" },
      duration: tour.duration,
      priceFrom: `From $${tour.priceFrom.toFixed(2)}`,
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
        "Not wheelchair accessible",
        "Near public transportation",
        "Most travelers can participate",
      ],
      faqs: [
        {
          question: `How long is the ${tour.title}?`,
          answer: `The planned duration is ${tour.duration.replace(" (approx.)", "")}.`,
        },
        {
          question: "Where does the tour depart from in Honolulu?",
          answer: tour.startDescription,
        },
      ],
      categories: tour.categories.map(label => ({ label })),
      pricing: {
        summary: { fromPrice: tour.priceFrom },
        currency: "USD",
      },
    },
  };
};

const main = async () => {
  if (process.argv.includes("--bootstrap")) {
    const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
    mkdirSync(outputDir, { recursive: true });

    for (const tour of HONOLULU_TOURS) {
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

    console.log(`Bootstrapped ${HONOLULU_TOURS.length} Honolulu Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Honolulu",
    destinationCitySlug: "honolulu",
    stateSlug: "hawaii",
    citySlug: "honolulu",
    viatorDestinationSlug: "Honolulu",
    targetPremiumShare: 0.5,
    tours: HONOLULU_TOURS,
    buildFixture,
    destinationLogLabel: "Honolulu",
  });
};

await main();
