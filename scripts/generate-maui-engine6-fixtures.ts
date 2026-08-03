/**
 * Generates Maui Engine6 fixtures from maui-live-product-data.json
 * Run: npx tsx scripts/generate-maui-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { MAUI_VIATOR_PUBLIC_RATINGS } from "../src/engine6/mauiViatorPublicRatings";

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
  experienceType?: string;
};

type MauiTourFixture = {
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

const LIVE_DATA_PATH = "scripts/maui-live-product-data.json";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
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
    .filter(name => name && !/^(Maui|Hawaii)$/i.test(name))
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Maui-based outfitter.`;
  const detail =
    (sentences[1] ??
      "Your guide covers Road to Hana coastline, Haleakala summit views, Molokini snorkeling, helicopter flyovers, or West Maui adventure routing depending on the itinerary.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Transportation, equipment, and local commentary are handled so you can focus on Maui's volcanoes, waterfalls, reefs, and cultural landmarks.";
  const audience =
    "Ideal for visitors basing on Maui who want a guided island experience without coordinating transport, gear, or park logistics on their own.";

  const text = [lead, detail, format, audience].join(" ");
  if (!/\bMaui\b/i.test(text)) {
    return `${text} Departures are coordinated from Maui, Hawaii.`;
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
      { title: "Maui", stopType: "stop" as const },
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

const buildTourFromLive = (live: LiveProduct): MauiTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ?? MAUI_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ?? 5.0;
  const reviewCount =
    live.reviewCount ??
    MAUI_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from Maui`,
          "Professional Maui guide or captain",
        ].slice(0, 5)
      : [
          `${live.title} from Maui`,
          "Road to Hana, Haleakala, Molokini, or West Maui routing",
          "Professional guide with Maui expertise",
          "Small-group or private format as listed",
          "Maui aerial, ocean, cultural, or adventure experience",
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
      "Meet your guide at the confirmed Maui hotel pickup point, harbor, heliport, or meeting location listed when booking.",
    endDescription:
      "Return to your Maui hotel, harbor, heliport, or meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions:
      live.categories.length > 0
        ? [
            "Professional guide or captain",
            "Tour activity as described on Viator",
            "Safety equipment where applicable",
          ]
        : [
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

const MAUI_TOURS: MauiTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: MauiTourFixture) => {
  const viatorRatings = MAUI_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Maui", state: "Hawaii" },
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
          question: "Where does the tour depart from on Maui?",
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

    for (const tour of MAUI_TOURS) {
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

    console.log(`Bootstrapped ${MAUI_TOURS.length} Maui Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Maui",
    destinationCitySlug: "maui",
    stateSlug: "hawaii",
    citySlug: "maui",
    viatorDestinationSlug: "Maui",
    targetPremiumShare: 0.5,
    tours: MAUI_TOURS,
    buildFixture,
    destinationLogLabel: "Maui",
  });
};

await main();
