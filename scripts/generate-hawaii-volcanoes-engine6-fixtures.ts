/**
 * Generates Hawaii Volcanoes National Park Engine6 fixtures from
 * hawaii-volcanoes-live-product-data.json
 * Run: npx tsx scripts/generate-hawaii-volcanoes-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS } from "../src/engine6/hawaiiVolcanoesViatorPublicRatings";

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

type HvnpTourFixture = {
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

const LIVE_DATA_PATH = "scripts/hawaii-volcanoes-live-product-data.json";
const DESTINATION_CITY = "Hawaii Volcanoes National Park";
const DESTINATION_STATE = "Hawaii";

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
    .filter(
      name =>
        name &&
        !/^(Hawaii|Big Island|Hawaii Volcanoes National Park)$/i.test(name)
    )
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal =
    /\b(?:Hawaii Volcanoes National Park|Volcanoes National Park|Big Island)\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title} around Hawaii Volcanoes National Park on the Big Island.`;
  if (!destinationSignal.test(lead)) {
    lead = `On the Big Island, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  // Listing cards excerpt the first ~150 chars; keep the destination signal inside that window.
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} on the Big Island near Hawaii Volcanoes National Park.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Big Island touring near Hawaii Volcanoes National Park with local experts.";
    }
  }
  const detail =
    (sentences[1] ??
      "Your guide covers Kilauea overlooks, lava landscapes, coastal black-sand beaches, and waterfall routes tied to the park day.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Transportation, park logistics, and local commentary are handled so you can focus on crater rim views, rainforest trails, and Big Island geology.";
  const audience =
    "Ideal for visitors touring Hawaii Volcanoes National Park who want a guided Big Island experience without coordinating transport, gear, or park logistics on their own.";

  const text = [lead, detail, format, audience].join(" ");
  if (
    !/\bHawaii Volcanoes National Park\b/i.test(text) &&
    !/\bVolcanoes National Park\b/i.test(text)
  ) {
    return `${text} Departures are coordinated for Hawaii Volcanoes National Park on the Big Island of Hawaii.`;
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
      { title: "Hawaii Volcanoes National Park", stopType: "stop" as const },
      { title: "Kilauea Overlook", stopType: "stop" as const },
    ];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): HvnpTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} near Hawaii Volcanoes National Park`,
          "Professional Big Island guide or pilot",
        ].slice(0, 5)
      : [
          `${live.title} from the Big Island`,
          "Hawaii Volcanoes National Park crater and lava landscapes",
          "Professional guide with Big Island expertise",
          "Small-group, private, or aerial format as listed",
          "Volcano, waterfall, stargazing, or helicopter experience",
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
      "Meet your guide at the confirmed Big Island hotel pickup point, Hilo or Kona meeting location, heliport, or Hawaii Volcanoes National Park rendezvous listed when booking.",
    endDescription:
      "Return to your Big Island hotel, port, heliport, or meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions:
      live.inclusions && live.inclusions.length > 0
        ? live.inclusions.slice(0, 8)
        : [
            "Professional guide or pilot",
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

const HVNP_TOURS: HvnpTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: HvnpTourFixture) => {
  const viatorRatings = HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS[tour.productCode];
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
          question:
            "Where does the tour depart for Hawaii Volcanoes National Park?",
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

    for (const tour of HVNP_TOURS) {
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
      `Bootstrapped ${HVNP_TOURS.length} Hawaii Volcanoes National Park Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Hawaii Volcanoes National Park",
    destinationCitySlug: "hawaii-volcanoes-national-park",
    stateSlug: "hawaii",
    citySlug: "hawaii-volcanoes-national-park",
    viatorDestinationSlug: "Big-Island-of-Hawaii",
    targetPremiumShare: 0.5,
    tours: HVNP_TOURS,
    buildFixture,
    destinationLogLabel: "Hawaii Volcanoes National Park",
  });
};

await main();
