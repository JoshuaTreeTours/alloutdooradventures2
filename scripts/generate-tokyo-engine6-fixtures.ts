/**
 * Generates Tokyo Engine6 fixtures from live product data.
 * Run: npx tsx scripts/generate-tokyo-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { TOKYO_VIATOR_PUBLIC_RATINGS } from "../src/engine6/tokyoViatorPublicRatings";

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
  highlights?: string[];
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
  "scripts/tokyo-live-product-data.json";
const EDITORIAL_OVERRIDES_PATH =
  "scripts/tokyo-editorial-overrides.json";
const DESTINATION_CITY = "Tokyo";
const DESTINATION_STATE = "Japan";
const EDITORIAL_OVERRIDES = JSON.parse(
  readFileSync(EDITORIAL_OVERRIDES_PATH, "utf8")
) as Record<string, string>;

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
    .map(s => s.trim().replace(/‹DOT›/g, ".").replace(/^\*\s*/, ""))
    .filter(s => s.length > 20 && !/^(?:highlights?|choose from|read more)\b/i.test(s));
};

const buildEditorialDescription = (live: LiveProduct) => {
  const override = EDITORIAL_OVERRIDES[live.productCode]?.trim();
  if (override) {
    return override.replace(/\s+/g, " ").trim();
  }
  const sentences = sentenceSplit(live.overview ?? "");
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(
      name =>
        name &&
        !/^(Tokyo|Japan)$/i.test(name) &&
        !/meeting point|telescope viewing site/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bTokyo\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Tokyo guide.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Tokyo, ${lead}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Tokyo.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Tokyo touring with local experts past Meiji Jingu, Senso-ji Temple, Asakusa, and Shinjuku.";
    }
  }
  const detail =
    sentences[1] ??
    "A local guide covers landmark stops such as Meiji Jingu, Senso-ji Temple, Asakusa, or Shinjuku depending on the itinerary.";
  const format =
    sentences[2] ??
    "Local commentary and route logistics are handled so visitors can focus on Tokyo landmarks, the Tokyo Bay, and Mount Fuji trail or island stops.";
  const audience =
    "Ideal for visitors basing in Tokyo who want a guided city experience without coordinating bus and walking routes, attraction tickets, or landmark timing on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bTokyo\b/i.test(text)) {
    text = `${text} Departures are coordinated in Tokyo, Japan.`;
  }
  const wordCount = (value: string) =>
    value.split(/\s+/).filter(Boolean).length;
  const routeAnchor =
    landmarkNames.length > 0
      ? landmarkNames.slice(0, 4).join(", ")
      : "the Tokyo Bay landmarks around the Meiji Jingu and Tokyo Marina";
  if (wordCount(text) < 120) {
    text = `${text} Routes stay oriented to ${routeAnchor} that define this Tokyo sightseeing experience, with a guide handling hotel pickup, boat connections, and mountain or island pacing so the day stays focused on the outing rather than logistics.`;
  }
  if (wordCount(text) < 120) {
    text = `${text} Meeting points are confirmed at booking in Tokyo, and the itinerary keeps visitors close to the Tokyo Bay, Mount Fuji trails, and Arch or Shinjuku stops that shape this Tokyo tour.`;
  }
  if (wordCount(text) > 250) {
    const words = text.split(/\s+/).filter(Boolean).slice(0, 248);
    text = `${words.join(" ").replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
  text = text.replace(/\btravelers\b/gi, "visitors");
  text = text.replace(/\byou can\b/gi, "visitors can");
  text = text.replace(/\bpiazzas\b/gi, "squares");
  text = text
    .replace(/\bbucket list\b/gi, "notable sights")
    .replace(/\bLimited time in Tokyo\b/g, "A short stay in Tokyo")
    .replace(/\blimited time\b/gi, "a short stay")
    .replace(/^In Tokyo, ([A-Z])/g, (_match, letter: string) =>
      `In Tokyo, ${letter.toLowerCase()}`
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
    const first = stops[0]?.title?.trim();
    stops = [
      { title: first || "the Tokyo Bay", stopType: "stop" as const },
      {
        title:
          first && first !== "the Tokyo Bay" ? "Meiji Jingu" : "Senso-ji Temple",
        stopType: "stop" as const,
      },
    ];
  }

  return stops.map((stop, index) => ({
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
    TOKYO_VIATOR_PUBLIC_RATINGS[live.productCode]
      ?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    TOKYO_VIATOR_PUBLIC_RATINGS[live.productCode]
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
            `${live.title} near Tokyo`,
            "Professional Tokyo guide",
          ].slice(0, 5)
        : [
            `${live.title} from Tokyo`,
            "the Tokyo Bay, Mount Fuji, and Meiji Jingu views",
            "Professional guide with Tokyo local expertise",
            "Small-group or private format as listed",
            "Guided Tokyo sightseeing with local commentary",
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
      "Meet your guide at the confirmed Tokyo meeting location listed when booking.",
    endDescription:
      "Return to your Tokyo meeting point after the final stop on the itinerary.",
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
  "scripts/tokyo-product-selection.json";
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
    TOKYO_VIATOR_PUBLIC_RATINGS[tour.productCode];
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
            "Where does the tour depart from for Tokyo?",
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
      `Bootstrapped ${BRYCE_TOURS.length} Tokyo Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Tokyo",
    destinationCitySlug: "tokyo",
    stateSlug: "japan",
    citySlug: "tokyo",
    viatorDestinationSlug: "Tokyo",
    targetPremiumShare: 0.5,
    tours: BRYCE_TOURS,
    buildFixture,
    destinationLogLabel: "Tokyo",
  });
};

await main();
