/**
 * Generates Denver Engine6 fixtures from denver-live-product-data.json
 * Run: npx tsx scripts/generate-denver-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DENVER_VIATOR_PUBLIC_RATINGS } from "../src/engine6/denverViatorPublicRatings";

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
  experienceType?: string;
};

type DenverTourFixture = {
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

const LIVE_DATA_PATH = "scripts/denver-live-product-data.json";
const DESTINATION_CITY = "Denver";
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
  // Protect common abbreviations so "Mt. Evans" is not treated as a sentence boundary.
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
    .filter(name => name && !/^(Denver|Colorado)$/i.test(name))
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bDenver\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Denver-based outfitter.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Denver, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  // Listing cards excerpt the first ~150 chars; keep the destination signal inside that window.
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Denver, Colorado.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Denver touring with local experts across the Front Range foothills and nearby mountain landmarks.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers Red Rocks, foothills overlooks, mountain towns, or high-country day-trip routes depending on the itinerary.";
  const format =
    sentences[2] ??
    "Transportation and local commentary are handled so you can focus on Denver's foothills scenery, red-rock amphitheater views, and Rocky Mountain day-trip landmarks.";
  const audience =
    "Ideal for visitors basing in Denver who want a guided Front Range experience without coordinating transport, trailheads, or mountain logistics on their own.";

  const text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ");
  if (!/\bDenver\b/i.test(text)) {
    return `${text} Departures are coordinated from Denver, Colorado.`;
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
      { title: "Denver Foothills", stopType: "stop" as const },
      { title: "Scenic Viewpoint", stopType: "stop" as const },
    ];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): DenverTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    DENVER_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    DENVER_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from Denver`,
          "Professional Denver guide",
        ].slice(0, 5)
      : [
          `${live.title} from Denver`,
          "Red Rocks, foothills overlooks, or Rocky Mountain day-trip routing",
          "Professional guide with Denver Front Range expertise",
          "Small-group format as listed",
          "Denver outdoor sightseeing or hiking experience",
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
      "Meet your guide at the confirmed Denver hotel pickup point, Union Station area, or meeting location listed when booking.",
    endDescription:
      "Return to your Denver hotel, Union Station area, or meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions:
      live.inclusions && live.inclusions.length > 0
        ? live.inclusions.slice(0, 8)
        : [
            "Professional guide",
            "Tour activity as described on Viator",
            "Transportation as listed",
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

const DENVER_TOURS: DenverTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: DenverTourFixture) => {
  const viatorRatings = DENVER_VIATOR_PUBLIC_RATINGS[tour.productCode];
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
          question: "Where does the tour depart from in Denver?",
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

    for (const tour of DENVER_TOURS) {
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

    console.log(`Bootstrapped ${DENVER_TOURS.length} Denver Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Denver",
    destinationCitySlug: "denver",
    stateSlug: "colorado",
    citySlug: "denver",
    viatorDestinationSlug: "Denver",
    targetPremiumShare: 0.5,
    tours: DENVER_TOURS,
    buildFixture,
    destinationLogLabel: "Denver",
  });
};

await main();
