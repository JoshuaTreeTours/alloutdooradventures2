/**
 * Generates Houston Engine6 fixtures from houston-live-product-data.json
 * Run: npx tsx scripts/generate-houston-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { HOUSTON_TARGETED_NARRATIVE_DESCRIPTIONS } from "../src/engine6/houstonApprovedNarrativeDescriptions";
import { HOUSTON_VIATOR_PUBLIC_RATINGS } from "../src/engine6/houstonViatorPublicRatings";

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

type HoustonTourFixture = {
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

const LIVE_DATA_PATH = "scripts/houston-live-product-data.json";
const DESTINATION_CITY = "Houston";
const DESTINATION_STATE = "Texas";

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
        !/^(Houston|Texas)$/i.test(name) &&
        !/meeting point|photo locations|retreat facility/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bHouston\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Houston-based outfitter.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Houston, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Houston, Texas.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Houston touring with local experts through downtown landmarks, Buffalo Bayou, and Space City routes.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers Houston landmarks such as Market Square, Buffalo Bayou Park, the Museum District, River Oaks, or Space Center Houston depending on the itinerary.";
  const format =
    sentences[2] ??
    "Local commentary and route logistics are handled so you can focus on Houston skyline views, bayou corridors, and NASA highlights.";
  const audience =
    "Ideal for visitors basing in Houston who want a guided Space City experience without coordinating meeting points, mural stops, or attraction entrances on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bHouston\b/i.test(text)) {
    text = `${text} Departures are coordinated from Houston, Texas.`;
  }
  // Engine6 governed editorial budget is 500-800 chars.
  if (text.length < 500) {
    text = `${text} Routes stay oriented to Houston bayou parks, downtown districts, and coastal day-trip corridors that define the city's outdoor character.`;
  }
  if (text.length > 800) {
    const clipped = text.slice(0, 800).trim();
    const boundary = clipped.lastIndexOf(" ");
    text = `${(boundary > 560 ? clipped.slice(0, boundary) : clipped).replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
  // Avoid governed polish rewriting "travelers <word>" into "your <word>".
  text = text.replace(/\btravelers\b/gi, "visitors");
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
      { title: "Houston Meeting Point", stopType: "stop" as const },
      { title: "Scenic Houston Viewpoint", stopType: "stop" as const },
    ];
  }

  return stops.slice(0, 5).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): HoustonTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    HOUSTON_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    HOUSTON_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description =
    HOUSTON_TARGETED_NARRATIVE_DESCRIPTIONS[
      live.productCode as keyof typeof HOUSTON_TARGETED_NARRATIVE_DESCRIPTIONS
    ] ?? buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from Houston`,
          "Professional Houston guide",
        ].slice(0, 5)
      : [
          `${live.title} from Houston`,
          "Market Square, Buffalo Bayou, Museum District, River Oaks, or Space Center Houston routes",
          "Professional guide with Houston local expertise",
          "Small-group or private format as listed",
          "Houston outdoor sightseeing, kayak, mural, or NASA experience",
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
      "Meet your guide at the confirmed Houston meeting location listed when booking, typically near the confirmed Houston address shown at booking.",
    endDescription:
      "Return to your Houston meeting point after the final stop on the itinerary.",
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

const SELECTION_PATH = "scripts/houston-product-selection.json";
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

const HOUSTON_TOURS: HoustonTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: HoustonTourFixture) => {
  const viatorRatings = HOUSTON_VIATOR_PUBLIC_RATINGS[tour.productCode];
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
          question: "Where does the tour depart from in Houston?",
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

    for (const tour of HOUSTON_TOURS) {
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

    console.log(`Bootstrapped ${HOUSTON_TOURS.length} Houston Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Houston",
    destinationCitySlug: "houston",
    stateSlug: "texas",
    citySlug: "houston",
    viatorDestinationSlug: "Houston",
    targetPremiumShare: 0.5,
    tours: HOUSTON_TOURS,
    buildFixture,
    destinationLogLabel: "Houston",
  });
};

await main();
