import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS } from "../src/engine6/rockyMountainNationalParkViatorPublicRatings";

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
  reviewCount: number | null;
  duration: string | null;
  heroUrl: string;
  overview: string | null;
  itineraryStops: string[];
  categories: string[];
};

type RmnpTourFixture = {
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
  "scripts/rocky-mountain-national-park-live-product-data.json";

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const RMNP_FALLBACK_STOPS = [
  "Estes Park",
  "Trail Ridge Road",
  "Bear Lake",
  "Alpine Visitor Center",
  "Rocky Mountain National Park",
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
    .filter(
      name =>
        name &&
        !/^Rocky Mountain National Park$/i.test(name) &&
        !/^Estes Park$/i.test(name)
    )
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with an Estes Park or Rocky Mountain National Park outfitter.`;
  const detail =
    (sentences[1] ??
      "Your guide covers alpine lakes, Trail Ridge Road overlooks, and wildlife-rich meadows across Rocky Mountain National Park.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Timed-entry coordination, local commentary, and photo stops are handled so you can focus on Colorado's high-country scenery.";
  const audience =
    "Ideal for travelers basing in Estes Park or the Front Range who want a guided Rocky Mountain National Park outing without self-driving mountain roads.";

  const text = [lead, detail, format, audience].join(" ");
  if (!/\b(Rocky Mountain|Estes Park|Colorado|RMNP)\b/i.test(text)) {
    return `${text} Departures are coordinated from Estes Park, Colorado.`;
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
    stops = RMNP_FALLBACK_STOPS.map((title, index) => ({
      title,
      stopType:
        index === RMNP_FALLBACK_STOPS.length - 1
          ? ("pass-by" as const)
          : ("stop" as const),
    }));
  }

  if (stops.length === 1) {
    stops = [
      { title: "Estes Park", stopType: "stop" as const },
      stops[0],
    ];
  }

  return stops.slice(0, 8).map((stop, index) => ({
    title: stop.title,
    description: "",
    duration: index === 0 ? "30 minutes" : undefined,
    stopType: stop.stopType,
  }));
};

const buildTourFromLive = (live: LiveProduct): RmnpTourFixture => {
  const priceFrom = parsePrice(live.priceFrom);
  const publicRating =
    ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS[live.productCode];
  const rating =
    publicRating?.rating ?? live.rating ?? 5.0;
  const reviewCount =
    publicRating?.reviewCount ?? live.reviewCount ?? 0;
  const description = buildEditorialDescription(live);
  const overviewHighlights = sentenceSplit(live.overview ?? "")
    .slice(0, 3)
    .map(s => s.replace(/\.$/, "").slice(0, 120));

  const highlights =
    overviewHighlights.length >= 3
      ? [
          ...overviewHighlights,
          `${live.title} in Rocky Mountain National Park`,
          "Professional Estes Park or Colorado guide",
        ].slice(0, 5)
      : [
          `${live.title} in Rocky Mountain National Park`,
          "Trail Ridge Road and alpine lake routing",
          "Professional guide with local RMNP expertise",
          "Private or small-group format as listed",
          "Colorado high-country wildlife and scenery",
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
      "Pickup is available from Estes Park lodging and designated Rocky Mountain National Park meeting points. Confirm your exact meeting window when booking.",
    endDescription:
      "Return to your Estes Park or Rocky Mountain National Park pickup location after the final stop on the itinerary.",
    itineraryItems: resolveItineraryItems(live),
    inclusions: [
      "Professional guide or outfitter",
      "Tour activity as described on Viator",
      "Timed-entry reservation coordination when required",
    ],
    categories:
      live.categories.length > 0
        ? live.categories
        : ["Sightseeing Tours", "National Parks"],
  };
};

const liveProducts = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
) as LiveProduct[];

const RMNP_TOURS: RmnpTourFixture[] = liveProducts.map(buildTourFromLive);

const buildFixture = (tour: RmnpTourFixture) => {
  const viatorRatings =
    ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: {
        city: "Rocky Mountain National Park",
        state: "Colorado",
      },
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
            "Where does the tour depart from in Rocky Mountain National Park?",
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

    for (const tour of RMNP_TOURS) {
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
      `Bootstrapped ${RMNP_TOURS.length} Rocky Mountain National Park Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Rocky Mountain National Park",
    destinationCitySlug: "rocky-mountain-national-park",
    stateSlug: "colorado",
    citySlug: "rocky-mountain-national-park",
    viatorDestinationSlug: "Rocky-Mountain-National-Park",
    targetPremiumShare: 0.5,
    tours: RMNP_TOURS,
    buildFixture,
    destinationLogLabel: "Rocky Mountain National Park",
  });
};

await main();
