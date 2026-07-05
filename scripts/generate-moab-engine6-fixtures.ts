import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { MOAB_VIATOR_PUBLIC_RATINGS } from "../src/engine6/moabViatorPublicRatings";

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

type MoabTourFixture = {
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

const LIVE_DATA_PATH = "scripts/moab-live-product-data.json";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const RAFTING_FALLBACK_STOPS = [
  "Colorado River",
  "Moab Daily Section",
  "Westwater Canyon",
];

const OFFROAD_FALLBACK_STOPS = [
  "Hell's Revenge",
  "Arches National Park",
  "Canyonlands National Park",
];

const PARK_FALLBACK_STOPS = [
  "Arches National Park",
  "Canyonlands National Park",
  "Dead Horse Point State Park",
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
    .filter(name => name && !/^Moab$/i.test(name))
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Moab-based outfitter.`;
  const detail =
    (sentences[1] ??
      "Your guide covers Arches, Canyonlands, the Colorado River, or Moab slickrock country depending on the route.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Transportation, safety gear, and local commentary are handled so you can focus on the red rock landscape.";
  const audience =
    "Ideal for travelers basing in Moab who want a guided Utah adventure without self-driving backcountry roads or river put-ins.";

  const text = [lead, detail, format, audience].join(" ");
  if (!/\bMoab\b/i.test(text)) {
    return `${text} Departures are coordinated from Moab, Utah.`;
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
    const fallback = /raft|float|whitewater|river/i.test(title)
      ? ["Moab", ...RAFTING_FALLBACK_STOPS]
      : /arch|national park|hike|photo|dead horse/i.test(title)
        ? ["Moab", ...PARK_FALLBACK_STOPS]
        : ["Moab", ...OFFROAD_FALLBACK_STOPS];
    stops = fallback.map((title, index) => ({
      title,
      stopType: index === fallback.length - 1 ? ("pass-by" as const) : ("stop" as const),
    }));
  }

  if (stops.length === 1) {
    stops = [{ title: "Moab", stopType: "stop" as const }, stops[0]];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): MoabTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    MOAB_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    MOAB_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from Moab`,
          "Professional Moab guide or outfitter",
        ].slice(0, 5)
      : [
          `${live.title} from Moab`,
          "Arches and Canyonlands red rock routing",
          "Professional guide with local expertise",
          "Small-group or private format as listed",
          "Utah desert adventure experience",
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
      "Meet your guide at the confirmed Moab outfitter office, hotel pickup point, or river launch as listed when booking.",
    endDescription:
      "Return to your Moab pickup location or meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions: [
      "Professional guide or outfitter",
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

const MOAB_TOURS: MoabTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: MoabTourFixture) => {
  const viatorRatings = MOAB_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Moab", state: "Utah" },
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
          question: "Where does the tour depart from in Moab?",
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

    for (const tour of MOAB_TOURS) {
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

    console.log(`Bootstrapped ${MOAB_TOURS.length} Moab Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Moab",
    destinationCitySlug: "moab",
    stateSlug: "utah",
    citySlug: "moab",
    viatorDestinationSlug: "Moab",
    targetPremiumShare: 0.5,
    tours: MOAB_TOURS,
    buildFixture,
    destinationLogLabel: "Moab",
  });
};

await main();
