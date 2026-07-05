/**
 * Generates Fort Lauderdale Engine6 fixtures from fort-lauderdale-live-product-data.json
 * Run: npx tsx scripts/generate-fort-lauderdale-engine6-fixtures.ts
 * Bootstrap only: npx tsx scripts/generate-fort-lauderdale-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS } from "../src/engine6/fortLauderdaleViatorPublicRatings";

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

type FortLauderdaleTourFixture = {
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

const LIVE_DATA_PATH = "scripts/fort-lauderdale-live-product-data.json";

import { NEW_FORT_LAUDERDALE_PRODUCT_CODES } from "./fort-lauderdale-new-product-codes";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const WATERWAY_FALLBACK_STOPS = [
  "Intracoastal Waterway",
  "Las Olas Boulevard",
  "Fort Lauderdale Beach",
];

const EVERGLADES_FALLBACK_STOPS = [
  "Everglades National Park",
  "Big Cypress National Preserve",
  "Sawgrass Recreation Park",
];

const YACHT_FALLBACK_STOPS = [
  "Fort Lauderdale Marina",
  "Intracoastal Waterway",
  "Las Olas Riverwalk",
];

const ISLAND_DAY_TRIP_STOPS = [
  "Port Everglades",
  "Key West",
  "Seven Mile Bridge",
];

const sentenceSplit = (text: string) =>
  text
    .replace(/\bFt\.\s*Lauderdale\b/gi, "Fort Lauderdale")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !/highlights?|Choose from|Read more/i.test(s));

const isPromotionalSentence = (sentence: string) =>
  /\b(?:our |your |we are the first|be ready for|kids enjoy|celebrate a birthday|travelers can be|smile on their faces|just enjoy and relax|no need to think)\b/i.test(
    sentence
  );

const buildAudienceSentence = (live: LiveProduct) => {
  const title = live.title.toLowerCase();
  if (/yacht|sail|catamaran|boat rental|private cruise/i.test(title)) {
    return "Ideal for groups on Fort Lauderdale's Intracoastal Waterway who want a private captain without handling marina logistics.";
  }
  if (/jet ski|jetcar|parasail|speed boat/i.test(title)) {
    return "Ideal for Fort Lauderdale visitors seeking open-water adventure along the Intracoastal without owning equipment.";
  }
  if (/everglades|airboat|swamp|biologist|safari|wet walk/i.test(title)) {
    return "Ideal for Fort Lauderdale travelers who want a guided Everglades outing with transport and expert commentary included.";
  }
  if (/key west|bimini|bahamas|ferry|day trip/i.test(title)) {
    return "Ideal for Fort Lauderdale visitors who want a full island day trip with ferry logistics handled in advance.";
  }
  if (/fish/i.test(title)) {
    return "Ideal for anglers departing Fort Lauderdale who want a crew-managed offshore fishing window.";
  }
  return "Ideal for Fort Lauderdale visitors who want a guided water experience with local operators handling the details.";
};

const buildEditorialDescription = (live: LiveProduct) => {
  const sentences = sentenceSplit(live.overview ?? "").filter(
    sentence => !isPromotionalSentence(sentence)
  );
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(name => name && !/^Fort Lauderdale$/i.test(name))
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const title = live.title.replace(/\bMiami\b/gi, "Fort Lauderdale");
  const filtered = sentences;
  const lead =
    filtered[0] ??
    `Explore Fort Lauderdale's Intracoastal Waterway on ${title.toLowerCase()} with local operators.`;
  const detail =
    filtered[1] ??
    "The route highlights waterfront estates, open Atlantic access, and the yacht-lined channels that define greater Fort Lauderdale.";
  const format =
    filtered[2] ??
    "Equipment, safety briefings, and local commentary are handled so you can focus on Fort Lauderdale's waterways and coastal wildlife.";
  const audience = buildAudienceSentence(live);

  let text = [lead, detail + landmarkPhrase, format, audience].join(" ");
  text = text
    .replace(/\bMiami\b/gi, "Fort Lauderdale")
    .replace(/\bOrlando\b/gi, "Fort Lauderdale")
    .replace(/\b(?:Our|Your)\b/g, "The");
  if (!/\bFort Lauderdale\b/i.test(text)) {
    return `${text} Departures are coordinated from Fort Lauderdale, Florida.`;
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
    const fallback = /yacht|sail|catamaran|boat rental|private cruise/i.test(
      title
    )
      ? ["Fort Lauderdale", ...YACHT_FALLBACK_STOPS]
      : /key west|bimini|bahamas|ferry|day trip/i.test(title)
        ? ["Fort Lauderdale", ...ISLAND_DAY_TRIP_STOPS]
        : /everglades|airboat|swamp|biologist|safari|wet walk/i.test(title)
          ? ["Fort Lauderdale", ...EVERGLADES_FALLBACK_STOPS]
          : /parasail|jet ski|fish|speed boat|drift|snorkel|kayak|paddle/i.test(
                title
              )
            ? ["Fort Lauderdale", ...WATERWAY_FALLBACK_STOPS]
            : ["Fort Lauderdale", ...WATERWAY_FALLBACK_STOPS];
    stops = fallback.map((stopTitle, index) => ({
      title: stopTitle,
      stopType: index === fallback.length - 1 ? ("pass-by" as const) : ("stop" as const),
    }));
  }

  if (stops.length === 1) {
    stops = [{ title: "Fort Lauderdale", stopType: "stop" as const }, stops[0]];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): FortLauderdaleTourFixture => {
  const title = live.title.replace(/\bMiami\b/gi, "Fort Lauderdale");
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .filter(sentence => !isPromotionalSentence(sentence))
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").replace(/\bMiami\b/gi, "Fort Lauderdale").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${title} departing from Fort Lauderdale`,
          "Professional Fort Lauderdale captain or guide",
        ].slice(0, 5)
      : [
          `${title} from Fort Lauderdale`,
          "Intracoastal Waterway or Everglades routing",
          "Professional captain with local expertise",
          "Small-group or private format as listed",
          "Fort Lauderdale water or wildlife experience",
        ];

  return {
    productCode: live.productCode,
    productUrl: live.productUrl,
    title,
    description,
    duration: live.duration || "TBD (approx.)",
    priceFrom,
    heroUrl: live.heroUrl,
    rating,
    reviewCount,
    highlights,
    startDescription:
      "Meet your captain or guide at the confirmed Fort Lauderdale marina, waterfront meeting point, or hotel pickup listed when booking.",
    endDescription:
      "Return to your Fort Lauderdale marina, meeting point, or hotel after the final stop on the itinerary.",
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

const liveProducts = (
  JSON.parse(readFileSync(LIVE_DATA_PATH, "utf8")) as LiveProduct[]
).filter(p => NEW_FORT_LAUDERDALE_PRODUCT_CODES.includes(p.productCode as (typeof NEW_FORT_LAUDERDALE_PRODUCT_CODES)[number]));

const FORT_LAUDERDALE_TOURS: FortLauderdaleTourFixture[] =
  liveProducts.map(buildTourFromLive);

const buildFixture = (tour: FortLauderdaleTourFixture) => {
  const viatorRatings = FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Fort Lauderdale", state: "Florida" },
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
          question: "Where does the tour depart from in Fort Lauderdale?",
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

    for (const tour of FORT_LAUDERDALE_TOURS) {
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

    console.log(
      `Bootstrapped ${FORT_LAUDERDALE_TOURS.length} Fort Lauderdale Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Fort Lauderdale",
    destinationCitySlug: "fort-lauderdale",
    stateSlug: "florida",
    citySlug: "fort-lauderdale",
    viatorDestinationSlug: "Fort-Lauderdale",
    targetPremiumShare: 15 / 18,
    tours: FORT_LAUDERDALE_TOURS,
    buildFixture,
    destinationLogLabel: "Fort Lauderdale",
  });
};

const isDirectRun = process.argv[1]
  ?.replace(/\\/g, "/")
  .endsWith("scripts/generate-fort-lauderdale-engine6-fixtures.ts");

if (isDirectRun) {
  await main();
}