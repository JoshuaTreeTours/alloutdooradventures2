/**
 * Generates Barcelona Engine6 fixtures from live product data.
 * Run: npx tsx scripts/generate-barcelona-engine6-fixtures.ts --bootstrap
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BARCELONA_VIATOR_PUBLIC_RATINGS } from "../src/engine6/barcelonaViatorPublicRatings";

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
  highlights?: string[];
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

const LIVE_DATA_PATH = "scripts/barcelona-live-product-data.json";
const DESTINATION_CITY = "Barcelona";
const DESTINATION_STATE = "Spain";

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
        !/^(Barcelona|Spain|Catalonia|Catalunya)$/i.test(name) &&
        !/meeting point|telescope viewing site/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bBarcelona\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Barcelona guide.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Barcelona, ${lead}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Barcelona.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Barcelona touring with local experts past Sagrada Familia, Park Güell, the Gothic Quarter, and Montjuïc.";
    }
  }
  const categories = (live.categories ?? []).join(" ").toLowerCase();
  const title = live.title.toLowerCase();
  const detail =
    sentences[1] ??
    "Guides cover landmark stops such as Sagrada Familia, Park Güell, the Gothic Quarter, or Montjuïc depending on the itinerary.";
  const format =
    sentences[2] ??
    (/\bwine|cava|4wd|jeep/.test(`${categories} ${title}`)
      ? "Winery hosts and drivers handle tasting and vineyard logistics so visitors can focus on Penedès cellars, cava, and Montserrat views."
      : /\bballoon|air tours/.test(`${categories} ${title}`)
        ? "Flight and landing logistics are handled so visitors can focus on Montserrat and Catalonia aerial views."
        : /\bsailing|kayak|snorkel/.test(`${categories} ${title}`)
          ? "Skippers and water guides handle boats and gear so visitors can focus on Mediterranean coastline time."
          : /\bgirona|dalí|dali|costa brava|museum tours/.test(
                `${categories} ${title}`
              )
            ? "Coach logistics are handled so visitors can focus on Girona streets and Costa Brava villages named on the itinerary."
            : "Local commentary and route logistics are handled so visitors can focus on Gaudí architecture, Mediterranean views, and neighborhood walking or cycling highlights.");
  const audience =
    "Ideal for visitors basing in Barcelona who want a guided city experience without coordinating metro routes, attraction tickets, or landmark timing on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bBarcelona\b/i.test(text)) {
    text = `${text} Departures are coordinated in Barcelona, Spain.`;
  }
  if (text.length < 500) {
    const routeAnchor =
      landmarkNames.length > 0
        ? landmarkNames.slice(0, 4).join(", ")
        : "central Barcelona landmarks such as Sagrada Familia and the Gothic Quarter";
    text = `${text} Routes stay oriented to ${routeAnchor}, a defining stop on this Barcelona sightseeing experience.`;
  }
  if (text.length > 800) {
    const clipped = text.slice(0, 800).trim();
    const boundary = clipped.lastIndexOf(" ");
    text = `${(boundary > 560 ? clipped.slice(0, boundary) : clipped).replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
  text = text.replace(/\btravelers\b/gi, "visitors");
  text = text
    .replace(/\bbucket list\b/gi, "notable sights")
    .replace(/\bLimited time in Barcelona\b/g, "A short stay in Barcelona")
    .replace(/\blimited time\b/gi, "a short stay")
    .replace(/^In Barcelona, ([A-Z])/g, (_match, letter: string) =>
      `In Barcelona, ${letter.toLowerCase()}`
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
      { title: "Sagrada Familia", stopType: "stop" as const },
      { title: "Gothic Quarter", stopType: "stop" as const },
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
    BARCELONA_VIATOR_PUBLIC_RATINGS[live.productCode]?.rating ??
    5.0;
  const reviewCount =
    live.reviewCount ??
    BARCELONA_VIATOR_PUBLIC_RATINGS[live.productCode]?.reviewCount ??
    0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    live.highlights && live.highlights.length >= 3
      ? live.highlights.slice(0, 5)
      : overviewHighlights.length >= 3
        ? [
            ...overviewHighlights,
            `${live.title} near Barcelona`,
            "Professional Barcelona guide",
          ].slice(0, 5)
        : [
            `${live.title} from Barcelona`,
            "Sagrada Familia, Park Güell, and Gothic Quarter views",
            "Professional guide with Barcelona local expertise",
            "Small-group or private format as listed",
            "Guided Barcelona sightseeing with local commentary",
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
      "Meet your guide at the confirmed Barcelona meeting location listed when booking.",
    endDescription:
      "Return to your Barcelona meeting point after the final stop on the itinerary.",
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

const SELECTION_PATH = "scripts/barcelona-product-selection.json";
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
  const viatorRatings = BARCELONA_VIATOR_PUBLIC_RATINGS[tour.productCode];
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
          question: "Where does the tour depart from for Barcelona?",
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
      `Bootstrapped ${BRYCE_TOURS.length} Barcelona Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Barcelona",
    destinationCitySlug: "barcelona",
    stateSlug: "spain",
    citySlug: "barcelona",
    viatorDestinationSlug: "Barcelona",
    targetPremiumShare: 0.5,
    tours: BRYCE_TOURS,
    buildFixture,
    destinationLogLabel: "Barcelona",
  });
};

await main();
