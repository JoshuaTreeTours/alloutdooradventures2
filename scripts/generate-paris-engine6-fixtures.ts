/**
 * Generates Paris Engine6 fixtures from live product data.
 * Run: npx tsx scripts/generate-paris-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PARIS_VIATOR_PUBLIC_RATINGS } from "../src/engine6/parisViatorPublicRatings";

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
  experienceType?: string;
};

type BryceTourFixture = {
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

const LIVE_DATA_PATH =
  "scripts/paris-live-product-data.json";
const DESTINATION_CITY = "Paris";
const DESTINATION_STATE = "France";

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

const sentenceSplit = (text: string) => {
  const protectedText = text
    .replace(/\s+/g, " ")
    .replace(
      /\b(Mt|St|Dr|Mr|Mrs|Ms|Jr|Sr|vs|approx|No)\./gi,
      (_match, abbr: string) => `${abbr}‹DOT›`
    );

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim().replace(/‹DOT›/g, "."))
    .filter(s => s.length > 20 && !/highlights?|Choose from|Read more/i.test(s));
};

const buildEditorialDescription = (live: LiveProduct) => {
  const sentences = sentenceSplit(live.overview ?? "");
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(
      name =>
        name &&
        !/^(Paris|France)$/i.test(name) &&
        !/meeting point|telescope viewing site/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bParis\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Paris guide.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Paris, ${lead}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Paris.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Paris touring with local experts past the Eiffel Tower, the Louvre Museum, Notre-Dame, and the Seine.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers landmark stops such as Sainte-Chapelle, Notre-Dame, the Louvre, or Montmartre depending on the itinerary.";
  const format =
    sentences[2] ??
    "Local commentary and route logistics are handled so you can focus on Paris landmarks, river views, and neighborhood walking or cycling highlights.";
  const audience =
    "Ideal for visitors basing in Paris who want a guided city experience without coordinating Metro routes, attraction tickets, or landmark timing on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bParis\b/i.test(text)) {
    text = `${text} Departures are coordinated in Paris, France.`;
  }
  const wordCount = (value: string) =>
    value.split(/\s+/).filter(Boolean).length;
  const routeAnchor =
    landmarkNames.length > 0
      ? landmarkNames.slice(0, 4).join(", ")
      : "central Paris landmarks along the Seine";
  if (wordCount(text) < 120) {
    text = `${text} Routes stay oriented to ${routeAnchor} that define this Paris sightseeing experience, with a guide handling Metro connections, ticket windows, and neighborhood pacing so the day stays focused on the city rather than logistics.`;
  }
  if (wordCount(text) < 120) {
    text = `${text} Meeting points are confirmed at booking in Paris, and the itinerary keeps visitors close to Seine views, museum galleries, and historic streets that shape this French capital tour.`;
  }
  if (wordCount(text) > 250) {
    const words = text.split(/\s+/).filter(Boolean).slice(0, 248);
    text = `${words.join(" ").replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
  text = text.replace(/\btravelers\b/gi, "visitors");
  text = text
    .replace(/\bbucket list\b/gi, "notable sights")
    .replace(/\bLimited time in Paris\b/g, "A short stay in Paris")
    .replace(/\blimited time\b/gi, "a short stay")
    .replace(/^In Paris, ([A-Z])/g, (_match, letter: string) =>
      `In Paris, ${letter.toLowerCase()}`
    );
  return text;
};
const resolveItineraryItems = (live: LiveProduct): ItineraryItem[] => {
  const rawStops = live.itineraryStops.filter(Boolean);
  let stops = rawStops.map(stop => ({
    title: cleanItineraryTitle(stop),
    stopType: /\(Pass By\)/i.test(stop)
      ? ("pass-by" as const)
      : ("stop" as const),
  }));

  if (stops.length < 2) {
    stops = [
      { title: "Eiffel Tower", stopType: "stop" as const },
      { title: "Louvre Museum", stopType: "stop" as const },
    ];
  }

  return stops.slice(0, 6).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): BryceTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    PARIS_VIATOR_PUBLIC_RATINGS[live.productCode]
      ?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    PARIS_VIATOR_PUBLIC_RATINGS[live.productCode]
      ?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const overflowStopHighlights = resolveItineraryItems(live)
    .map(item => item.title.trim())
    .slice(5)
    .filter(Boolean);
  const rawHighlights =
    live.highlights && live.highlights.length >= 3
      ? live.highlights.slice(0, 5)
      : overviewHighlights.length >= 3
        ? [
            ...overviewHighlights,
            `${live.title} near Paris`,
            "Professional Paris guide",
          ].slice(0, 5)
        : [
            `${live.title} from Paris`,
            "Eiffel Tower, Notre-Dame, and Seine River views",
            "Professional guide with Paris local expertise",
            "Small-group or private format as listed",
            "Guided Paris sightseeing with local commentary",
          ];
  const highlights = [
    ...overflowStopHighlights,
    ...rawHighlights.filter(
      value =>
        !/\b(?:you(?:'ll| will|'re| can)|your guide|you're)\b/i.test(value)
    ),
  ]
    .map(value => value.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 5);

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
      live.startDescription?.trim() ||
      "Meet your guide at the confirmed Paris meeting location listed when booking.",
    endDescription:
      "Return to your Paris meeting point after the final stop on the itinerary.",
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

const SELECTION_PATH =
  "scripts/paris-product-selection.json";
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

const BRYCE_TOURS: BryceTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: BryceTourFixture) => {
  const viatorRatings =
    PARIS_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: DESTINATION_CITY, state: DESTINATION_STATE },
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
        "Near public transportation",
        "Most travelers can participate",
      ],
      faqs: [
        {
          question: `How long is the ${tour.title}?`,
          answer: `The planned duration is ${tour.duration.replace(" (approx.)", "")}.`,
        },
        {
          question:
            "Where does the tour depart from for Paris?",
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

    for (const tour of BRYCE_TOURS) {
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
      `Bootstrapped ${BRYCE_TOURS.length} Paris Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Paris",
    destinationCitySlug: "paris",
    stateSlug: "france",
    citySlug: "paris",
    viatorDestinationSlug: "Paris",
    targetPremiumShare: 0.5,
    tours: BRYCE_TOURS,
    buildFixture,
    destinationLogLabel: "Paris",
  });
};

await main();
