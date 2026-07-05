/**
 * Generates Naples Engine6 fixtures from naples-live-product-data.json
 * Run: npx tsx scripts/generate-naples-engine6-fixtures.ts
 * Bootstrap only: npx tsx scripts/generate-naples-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { NAPLES_VIATOR_PUBLIC_RATINGS } from "../src/engine6/naplesViatorPublicRatings";

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

type NaplesTourFixture = {
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

const LIVE_DATA_PATH = "scripts/naples-live-product-data.json";

import { NEW_NAPLES_PRODUCT_CODES } from "./naples-new-product-codes";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const EVERGLADES_FALLBACK_STOPS = [
  "Everglades National Park",
  "Ten Thousand Islands",
  "Big Cypress National Preserve",
];

const ISLANDS_FALLBACK_STOPS = [
  "Ten Thousand Islands",
  "Marco Island",
  "Keewaydin Island",
];

const GULF_COAST_FALLBACK_STOPS = [
  "Naples Bay",
  "Gulf of Mexico",
  "Port Royal",
];

const MANGROVE_FALLBACK_STOPS = [
  "Ten Thousand Islands",
  "Mangrove Estuaries",
  "Cape Romano",
];

const FISHING_FALLBACK_STOPS = [
  "Marco Island",
  "Naples Bay",
  "Ten Thousand Islands",
];

const sentenceSplit = (text: string) =>
  text
    .replace(/\bFt\.\s*Myers\b/gi, "Naples")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !/highlights?|Choose from|Read more/i.test(s));

const isPromotionalSentence = (sentence: string) =>
  /\b(?:our |your |we are the first|we offer|we'll|we call|be ready for|kids enjoy|celebrate a birthday|travelers can be|smile on their faces|just enjoy and relax|no need to think|hop aboard the best)\b/i.test(
    sentence
  );

const buildAudienceSentence = (live: LiveProduct) => {
  const title = live.title.toLowerCase();
  if (/everglades|airboat|swamp|biologist|naturalist|wet walk/i.test(title)) {
    return "Ideal for Naples travelers who want a guided Everglades outing with transport, mangrove channels, and expert naturalist commentary included.";
  }
  if (/shell|dolphin|eco|wildlife|birding|barrier island/i.test(title)) {
    return "Ideal for Naples and Marco Island visitors who want shallow-water shelling, dolphin watching, and mangrove-lined routes without chartering a boat alone.";
  }
  if (/fish/i.test(title)) {
    return "Ideal for anglers departing Naples or Marco Island who want a crew-managed inshore or Gulf fishing window.";
  }
  if (/keewaydin|shuttle|catamaran|charter|yacht|boat/i.test(title)) {
    return "Ideal for Gulf Coast travelers who want a private captain for Naples Bay, Keewaydin Island, or Ten Thousand Islands without handling marina logistics.";
  }
  if (/craig cat|fun go|drive your own/i.test(title)) {
    return "Ideal for Naples visitors seeking a hands-on boat adventure through Marco Island backwaters and mangrove passages.";
  }
  return "Ideal for Naples visitors who want a guided Southwest Florida water experience with local operators handling the details.";
};

const buildEditorialDescription = (live: LiveProduct) => {
  const sentences = sentenceSplit(live.overview ?? "").filter(
    sentence => !isPromotionalSentence(sentence)
  );
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(name => name && !/^Naples$/i.test(name))
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const title = live.title.replace(/\bFort Myers\b/gi, "Naples");
  const filtered = sentences;
  const lead =
    filtered[0] ??
    `Explore Southwest Florida's Gulf Coast on ${title.toLowerCase()} with Naples-area operators.`;
  const detail =
    filtered[1] ??
    "The route highlights Ten Thousand Islands mangroves, Marco Island shelling shores, Keewaydin sandbars, and the open Gulf waters south of Naples.";
  const format =
    filtered[2] ??
    "Equipment, safety briefings, and local commentary are handled so you can focus on dolphins, shelling beaches, and Everglades wildlife.";
  const audience = buildAudienceSentence(live);

  let text = [lead, detail + landmarkPhrase, format, audience].join(" ");
  text = text
    .replace(/\bFort Myers\b/gi, "Naples")
    .replace(/\bMiami\b/gi, "Naples")
    .replace(/\b(?:Our|Your)\b/g, "The");
  if (!/\bNaples\b/i.test(text)) {
    return `${text} Departures are coordinated from Naples, Florida.`;
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
    const fallback = /everglades|airboat|swamp|biologist|naturalist|wet walk/i.test(
      title
    )
      ? ["Naples", ...EVERGLADES_FALLBACK_STOPS]
      : /keewaydin|shuttle/i.test(title)
        ? ["Naples", "Keewaydin Island", "Gulf of Mexico"]
        : /fish/i.test(title)
          ? ["Naples", ...FISHING_FALLBACK_STOPS]
          : /shell|dolphin|eco|wildlife|birding|barrier/i.test(title)
            ? ["Naples", ...ISLANDS_FALLBACK_STOPS]
            : /charter|yacht|sunset|private/i.test(title)
              ? ["Naples", ...GULF_COAST_FALLBACK_STOPS]
              : ["Naples", ...MANGROVE_FALLBACK_STOPS];
    stops = fallback.map((stopTitle, index) => ({
      title: stopTitle,
      stopType: index === fallback.length - 1 ? ("pass-by" as const) : ("stop" as const),
    }));
  }

  if (stops.length === 1) {
    stops = [{ title: "Naples", stopType: "stop" as const }, stops[0]];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): NaplesTourFixture => {
  const title = live.title.replace(/\bFort Myers\b/gi, "Naples");
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    NAPLES_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    NAPLES_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .filter(sentence => !isPromotionalSentence(sentence))
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").replace(/\bFort Myers\b/gi, "Naples").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${title} departing from Naples`,
          "Professional Naples captain or naturalist guide",
        ].slice(0, 5)
      : [
          `${title} from Naples`,
          "Ten Thousand Islands or Marco Island routing",
          "Professional captain with Gulf Coast expertise",
          "Small-group or private format as listed",
          "Naples mangrove, shelling, or Everglades experience",
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
      "Meet your captain or guide at the confirmed Naples marina, waterfront meeting point, or hotel pickup listed when booking.",
    endDescription:
      "Return to your Naples marina, meeting point, or hotel after the final stop on the itinerary.",
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
).filter(p =>
  NEW_NAPLES_PRODUCT_CODES.includes(
    p.productCode as (typeof NEW_NAPLES_PRODUCT_CODES)[number]
  )
);

const NAPLES_TOURS: NaplesTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: NaplesTourFixture) => {
  const viatorRatings = NAPLES_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Naples", state: "Florida" },
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
          question: "Where does the tour depart from in Naples?",
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

    for (const tour of NAPLES_TOURS) {
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
      `Bootstrapped ${NAPLES_TOURS.length} Naples Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Naples",
    destinationCitySlug: "naples",
    stateSlug: "florida",
    citySlug: "naples",
    viatorDestinationSlug: "Naples",
    targetPremiumShare: 0.5,
    tours: NAPLES_TOURS,
    buildFixture,
    destinationLogLabel: "Naples",
  });
};

const isDirectRun = process.argv[1]
  ?.replace(/\\/g, "/")
  .endsWith("scripts/generate-naples-engine6-fixtures.ts");

if (isDirectRun) {
  await main();
}
