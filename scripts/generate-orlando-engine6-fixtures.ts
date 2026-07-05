import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ORLANDO_VIATOR_PUBLIC_RATINGS } from "../src/engine6/orlandoViatorPublicRatings";

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

type OrlandoTourFixture = {
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

const LIVE_DATA_PATH = "scripts/orlando-live-product-data.json";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const KSC_FALLBACK_STOPS = [
  "Kennedy Space Center",
  "NASA",
  "Rocket Garden",
];

const EVERGLADES_FALLBACK_STOPS = [
  "Boggy Creek Airboat Adventures",
  "Everglades National Park",
  "St. Johns River",
];

const SPRINGS_FALLBACK_STOPS = [
  "Silver Springs",
  "Rock Springs",
  "Rainbow Springs",
];

const COAST_FALLBACK_STOPS = [
  "Clearwater Beach",
  "Clearwater Beach Marina",
  "Gulf of Mexico",
];

const HELICOPTER_FALLBACK_STOPS = [
  "MaxFlight Helicopter Services Inc.",
  "Space Coast",
  "Port Canaveral",
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
    .filter(name => name && !/^Orlando$/i.test(name))
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with an Orlando-area outfitter.`;
  const detail =
    (sentences[1] ??
      "Your guide covers Kennedy Space Center day trips, Everglades airboat rides, spring kayaking, helicopter flights, or Gulf Coast beach outings depending on the route.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Transportation, equipment, and local commentary are handled so you can focus on Central Florida's wildlife, coastlines, and space-coast sights.";
  const audience =
    "Ideal for travelers basing in Orlando who want a guided Florida experience beyond the theme parks without coordinating boats, gear, or launch times on their own.";

  const text = [lead, detail, format, audience].join(" ");
  if (!/\bOrlando\b/i.test(text)) {
    return `${text} Departures are coordinated from the Orlando, Florida area.`;
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
    const fallback = /kennedy|space center|nasa|astronaut/i.test(title)
      ? ["Orlando", ...KSC_FALLBACK_STOPS]
      : /helicopter|flight|aerial/i.test(title)
        ? ["Orlando", ...HELICOPTER_FALLBACK_STOPS]
        : /clearwater|st\.? augustine|day trip|beach/i.test(title)
          ? ["Orlando", ...COAST_FALLBACK_STOPS]
          : /airboat|everglades|swamp|gator|wildlife boat/i.test(title)
            ? ["Orlando", ...EVERGLADES_FALLBACK_STOPS]
            : /kayak|spring|manatee|bioluminescent|paddle/i.test(title)
              ? ["Orlando", ...SPRINGS_FALLBACK_STOPS]
              : ["Orlando", ...EVERGLADES_FALLBACK_STOPS];
    stops = fallback.map((stopTitle, index) => ({
      title: stopTitle,
      stopType: index === fallback.length - 1 ? ("pass-by" as const) : ("stop" as const),
    }));
  }

  if (stops.length === 1) {
    stops = [{ title: "Orlando", stopType: "stop" as const }, stops[0]];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): OrlandoTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const rating =
    live.rating ??
    ORLANDO_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    ORLANDO_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} departing from the Orlando area`,
          "Professional Orlando-area guide or captain",
        ].slice(0, 5)
      : [
          `${live.title} from Orlando`,
          "Kennedy Space Center, Everglades, or Gulf Coast routing",
          "Professional guide with Central Florida expertise",
          "Small-group or private format as listed",
          "Orlando wildlife, coast, or space-coast experience",
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
      "Meet your guide at the confirmed Orlando-area hotel pickup point, marina, or meeting location listed when booking.",
    endDescription:
      "Return to your Orlando-area hotel or meeting point after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions: [
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

const ORLANDO_TOURS: OrlandoTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: OrlandoTourFixture) => {
  const viatorRatings = ORLANDO_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Orlando", state: "Florida" },
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
          question: "Where does the tour depart from in Orlando?",
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

    for (const tour of ORLANDO_TOURS) {
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

    console.log(`Bootstrapped ${ORLANDO_TOURS.length} Orlando Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Orlando",
    destinationCitySlug: "orlando",
    stateSlug: "florida",
    citySlug: "orlando",
    viatorDestinationSlug: "Orlando",
    targetPremiumShare: 0.5,
    tours: ORLANDO_TOURS,
    buildFixture,
    destinationLogLabel: "Orlando",
  });
};

await main();
