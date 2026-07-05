import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { KEY_WEST_VIATOR_PUBLIC_RATINGS } from "../src/engine6/keyWestViatorPublicRatings";

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

type KeyWestTourFixture = {
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

const LIVE_DATA_PATH = "scripts/key-west-live-product-data.json";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const WATER_FALLBACK_STOPS = [
  "Key West Harbor",
  "Florida Keys National Marine Sanctuary",
  "Gulf of Mexico",
];

const SNORKEL_FALLBACK_STOPS = [
  "Key West Reef",
  "Looe Key Reef",
  "John Pennekamp Coral Reef State Park",
];

const SAND_BAR_FALLBACK_STOPS = [
  "Key West Sandbar",
  "Boca Chica Sandbar",
  "Backcountry Waters",
];

const DRY_TORTUGAS_FALLBACK_STOPS = [
  "Dry Tortugas National Park",
  "Fort Jefferson",
  "Loggerhead Key",
];

const OLD_TOWN_FALLBACK_STOPS = [
  "Old Town Key West",
  "Duval Street",
  "Mallory Square",
];

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
    .filter(name => name && !/^Key West$/i.test(name))
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Key West-based outfitter.`;
  const detail =
    (sentences[1] ??
      "Your captain or guide covers reef snorkeling, sunset sailing, sandbar stops, or Old Town history depending on the route.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Equipment, beverages, and local commentary are handled so you can focus on the water and island scenery.";
  const audience =
    "Ideal for travelers basing in Key West who want a guided Florida Keys experience without coordinating boats, gear, or launch times on their own.";

  const text = [lead, detail, format, audience].join(" ");
  if (!/\bKey West\b/i.test(text)) {
    return `${text} Departures are coordinated from Key West, Florida.`;
  }
  return text;
};

const resolveItineraryItems = (live: LiveProduct): ItineraryItem[] => {
  const rawStops = live.itineraryStops.filter(Boolean);
  let stops = rawStops.map(stop => ({
    title: cleanItineraryTitle(stop),
    stopType: /\(Pass By\)/i.test(stop) ? ("pass-by" as const) : ("stop" as const),
  }));

  if (stops.length < 2) {
    const title = live.title.toLowerCase();
    const fallback = /dry tortuga|fort jefferson/i.test(title)
      ? ["Key West", ...DRY_TORTUGAS_FALLBACK_STOPS]
      : /sandbar|tiki|charter/i.test(title)
        ? ["Key West", ...SAND_BAR_FALLBACK_STOPS]
        : /snorkel|reef|dolphin|fish|sail|sunset|parasail|jet ski|kayak/i.test(
              title
            )
          ? ["Key West", ...SNORKEL_FALLBACK_STOPS]
          : /food|walking|history|cultural/i.test(title)
            ? ["Key West", ...OLD_TOWN_FALLBACK_STOPS]
            : ["Key West", ...WATER_FALLBACK_STOPS];
    stops = fallback.map((title, index) => ({
      title,
      stopType: index === fallback.length - 1 ? ("pass-by" as const) : ("stop" as const),
    }));
  }

  if (stops.length === 1) {
    stops = [{ title: "Key West", stopType: "stop" as const }, stops[0]];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): KeyWestTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    KEY_WEST_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    KEY_WEST_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from Key West`,
          "Professional Key West captain or guide",
        ].slice(0, 5)
      : [
          `${live.title} from Key West`,
          "Florida Keys reef, sandbar, or sunset routing",
          "Professional captain or guide with local expertise",
          "Small-group or private format as listed",
          "Key West water or Old Town experience",
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
      "Meet your captain or guide at the confirmed Key West marina, hotel pickup point, or meeting location listed when booking.",
    endDescription:
      "Return to your Key West marina or meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions: [
      "Professional captain or guide",
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

const KEY_WEST_TOURS: KeyWestTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: KeyWestTourFixture) => {
  const viatorRatings = KEY_WEST_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Key West", state: "Florida" },
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
          question: "Where does the tour depart from in Key West?",
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

    for (const tour of KEY_WEST_TOURS) {
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

    console.log(`Bootstrapped ${KEY_WEST_TOURS.length} Key West Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Key West",
    destinationCitySlug: "key-west",
    stateSlug: "florida",
    citySlug: "key-west",
    viatorDestinationSlug: "Key West",
    targetPremiumShare: 0.5,
    tours: KEY_WEST_TOURS,
    buildFixture,
    destinationLogLabel: "Key West",
  });
};

await main();
