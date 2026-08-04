/**
 * Generates Aspen Engine6 fixtures from aspen-live-product-data.json
 * Run: npx tsx scripts/generate-aspen-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ASPEN_VIATOR_PUBLIC_RATINGS } from "../src/engine6/aspenViatorPublicRatings";

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

type AspenTourFixture = {
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

const LIVE_DATA_PATH = "scripts/aspen-live-product-data.json";
const DESTINATION_CITY = "Aspen";
const DESTINATION_STATE = "Colorado";

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
        !/^(Aspen|Colorado|Dean's Aspen Tours)$/i.test(name) &&
        !/meeting point|photo locations/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bAspen\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with an Aspen-based outfitter.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Aspen, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Aspen, Colorado.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Aspen touring with local experts through downtown landmarks, historic neighborhoods, and nearby alpine trails.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers downtown Aspen landmarks, historic neighborhoods, Hunter Creek scenery, or alpine photo locations depending on the itinerary.";
  const format =
    sentences[2] ??
    "Local commentary and route logistics are handled so you can focus on Aspen's mountain-town scenery and Roaring Fork Valley landmarks.";
  const audience =
    "Ideal for visitors basing in Aspen who want a guided mountain-town experience without coordinating meeting points, trailheads, or photo locations on their own.";

  const text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ");
  if (!/\bAspen\b/i.test(text)) {
    return `${text} Departures are coordinated from Aspen, Colorado.`;
  }
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
      { title: "Aspen Meeting Point", stopType: "stop" as const },
      { title: "Scenic Aspen Viewpoint", stopType: "stop" as const },
    ];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): AspenTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    ASPEN_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    ASPEN_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from Aspen`,
          "Professional Aspen guide",
        ].slice(0, 5)
      : [
          `${live.title} from Aspen`,
          "Downtown landmarks, historic neighborhoods, or Hunter Creek hiking",
          "Professional guide with Aspen local expertise",
          "Small-group format as listed",
          "Aspen outdoor sightseeing or hiking experience",
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
      live.startDescription?.trim() ||
      "Meet your guide at the confirmed Aspen meeting location listed when booking, typically near Wheeler Opera House on the downtown pedestrian mall.",
    endDescription:
      "Return to your Aspen meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions:
      live.inclusions && live.inclusions.length > 0
        ? live.inclusions.slice(0, 8)
        : [
            "Professional guide",
            "Tour activity as described on Viator",
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

const ASPEN_TOURS: AspenTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: AspenTourFixture) => {
  const viatorRatings = ASPEN_VIATOR_PUBLIC_RATINGS[tour.productCode];
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
          question: "Where does the tour depart from in Aspen?",
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

    for (const tour of ASPEN_TOURS) {
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

    console.log(`Bootstrapped ${ASPEN_TOURS.length} Aspen Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Aspen",
    destinationCitySlug: "aspen",
    stateSlug: "colorado",
    citySlug: "aspen",
    viatorDestinationSlug: "Aspen",
    targetPremiumShare: 0.5,
    tours: ASPEN_TOURS,
    buildFixture,
    destinationLogLabel: "Aspen",
  });
};

await main();
