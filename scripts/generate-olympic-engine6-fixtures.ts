import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { OLYMPIC_VIATOR_PUBLIC_RATINGS } from "../src/engine6/olympicViatorPublicRatings";
import { resolveEngine6ExactProductFixtureWriteDecision } from "../src/engine6/engine6ExactProductFixtureGovernance";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type OlympicTourFixture = {
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

type LiveProduct = {
  productCode: string;
  productUrl: string;
  title: string;
  price: number;
  rating: number | null;
  reviewCount: number | null;
  duration: string;
  heroUrl: string | null;
  overview: string;
  highlights: string[];
  itineraryStops: string[];
  startDescription: string;
  inclusions: string[];
  categories: string[];
};

const cleanStopTitle = (stop: string) =>
  stop.replace(/\s*\(Pass By\)\s*$/i, "").trim();

const isPassByStop = (stop: string) => /\(Pass By\)/i.test(stop);

const buildItineraryDescription = (title: string, stopType: ItineraryItem["stopType"]) => {
  const place = cleanStopTitle(title);
  if (stopType === "pass-by") {
    return `Pass ${place} along the Olympic National Park route with guide commentary on the surrounding landscape.`;
  }
  return `Stop at ${place} in Olympic National Park for guided time, photos, and short hikes when conditions allow.`;
};

const buildEndDescription = (product: LiveProduct) => {
  if (/seattle/i.test(product.startDescription)) {
    return "Return to your Seattle pickup location after the final Olympic National Park stop.";
  }
  if (/port angeles|720 marine/i.test(product.startDescription)) {
    return "Return to the Olympic Hiking Co. meeting point at 720 Marine Drive, Port Angeles, WA 98363.";
  }
  if (/forks/i.test(product.startDescription)) {
    return "Return to the Forks Transit Center Park and Ride by late afternoon.";
  }
  return "Return to your confirmed Olympic National Park gateway meeting point after the final stop.";
};

const buildHighlights = (product: LiveProduct) => {
  if (product.highlights.length > 0) {
    return product.highlights.slice(0, 5);
  }

  return product.itineraryStops
    .slice(0, 5)
    .map(stop => `Visit ${cleanStopTitle(stop)} in Olympic National Park`);
};

const buildDescription = (product: LiveProduct) => {
  const overview = product.overview.trim();
  if (overview.length >= 120) {
    return overview;
  }

  const stops = product.itineraryStops
    .slice(0, 4)
    .map(cleanStopTitle)
    .join(", ");
  return `${product.title} explores Olympic National Park highlights including ${stops}. ${overview}`.trim();
};

const buildItineraryItems = (stops: string[]): ItineraryItem[] =>
  stops.slice(0, 6).map(stop => {
    const stopType = isPassByStop(stop) ? "pass-by" : "stop";
    const title = cleanStopTitle(stop);
    return {
      title,
      description: buildItineraryDescription(title, stopType),
      stopType,
    };
  });

const liveProducts = JSON.parse(
  readFileSync("scripts/olympic-live-product-data.json", "utf8")
) as LiveProduct[];

const OLYMPIC_TOURS: OlympicTourFixture[] = liveProducts.map(product => {
  if (!product.heroUrl) {
    throw new Error(`Missing heroUrl for Olympic product ${product.productCode}`);
  }

  return {
    productCode: product.productCode,
    productUrl: product.productUrl,
    title: product.title,
    description: buildDescription(product),
    duration: product.duration,
    priceFrom: product.price,
    heroUrl: product.heroUrl,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    highlights: buildHighlights(product),
    startDescription: product.startDescription,
    endDescription: buildEndDescription(product),
    itineraryItems: buildItineraryItems(product.itineraryStops),
    inclusions: product.inclusions.length
      ? product.inclusions
      : ["Professional guide", "Park entrance fees", "Transportation"],
    categories: product.categories.length ? product.categories : ["Full-day Tours"],
  };
});

const buildFixture = (tour: OlympicTourFixture) => {
  const viatorRatings = OLYMPIC_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Olympic National Park", state: "Washington" },
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
      itineraryItems: tour.itineraryItems,
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
            "Where does the tour depart from in Olympic National Park?",
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
  const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
  mkdirSync(outputDir, { recursive: true });

  let written = 0;
  for (const tour of OLYMPIC_TOURS) {
    const proposedPayload = buildFixture(tour);
    const decision = resolveEngine6ExactProductFixtureWriteDecision({
      productCode: tour.productCode,
      destinationCitySlug: "olympic-national-park",
      proposedPayload,
    });

    if (decision.action !== "write") {
      continue;
    }

    const filePath = path.join(outputDir, `${tour.productCode}.exact-product.json`);
    writeFileSync(filePath, `${JSON.stringify(proposedPayload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${filePath}`);
    written += 1;
  }

  console.log(`Generated ${written} Olympic Engine6 fixtures.`);
};

await main();
