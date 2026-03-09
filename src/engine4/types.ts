export type Engine4ViatorTourRecord = {
  engine: "engine4";
  bookingProvider: "viator";
  productCode: string;
  slug: string;
  destination: {
    country: string;
    state: string;
    stateSlug: string;
    city: string;
    citySlug: string;
  };
  bookingUrl: string;
  heroImage: string | null;
};

export type Engine4TourFacts = {
  priceFrom?: string;
  ratingValue?: number;
  reviewCount?: number;
  duration?: string;
  startTime?: string;
  meetingPointShort?: string;
  meetingPointFull?: string;
  cancellationPolicy?: string;
};

export type Engine4TourContent = {
  overview: string;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
  itinerary?: Array<{
    title: string;
    description?: string;
    duration?: string;
  }>;
  inclusions: string[];
  exclusions: string[];
  whatToExpect?: string;
  additionalInfo?: string;
};

export type Engine4ViatorApiTour = {
  provenance?: {
    apiFetchAttempted: boolean;
    apiFetchSucceeded: boolean;
    fallbackUsed: boolean;
    heroImageSource: "api" | "fallback" | "none";
    descriptionSource:
      | "api.shortDescription"
      | "api.summary"
      | "api.description.text"
      | "api.description"
      | "fallback"
      | "none";
  };
  exactProductImages?: Array<{
    isCover: boolean;
    variants: Array<{
      url: string;
      width?: number;
      height?: number;
    }>;
  }>;
  description?: string;
  descriptionLong?: string;
  itinerary?: Array<{
    title: string;
    description?: string;
    duration?: string;
  }>;
  whatToExpect?: string;
  inclusions?: string[];
  exclusions?: string[];
  additionalInfo?: string[];
  productCode: string;
  title: string;
  sourceUrl: string;
  duration?: string;
  startTime?: string;
  fromPrice?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  meetingPoint?: string;
  cancellationPolicy?: string;
  highlights?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  overview?: string;
  primaryImageUrl?: string;
  galleryImages?: string[];
  sourceDerivedImageUrl?: string;
  rawProductPayload?: Record<string, unknown>;
};

export type Engine4TourViewModel = {
  tourId: string;
  engine: "engine4";
  bookingProvider: "viator";
  productCode: string;
  slug: string;
  title: string;
  canonicalPath: string;
  bookingUrl: string;
  destination: Engine4ViatorTourRecord["destination"];
  heroImage: string | null;
  primaryImage: string | null;
  galleryImages: string[];
  facts: Engine4TourFacts;
  content: Engine4TourContent;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const ENGINE4_TACDN_HERO_REGEX =
  /^https:\/\/(dynamic-media|media)\.tacdn\.com/i;

export function assertEngine4ViatorTourHero(heroImage: string) {
  if (!ENGINE4_TACDN_HERO_REGEX.test(heroImage)) {
    throw new Error("Engine4 heroImage must be a TACDN image");
  }
}

const looksLikeImageUrl = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();

  if (
    normalized.includes("/photo-o/") ||
    normalized.includes("attractions-splice")
  ) {
    return true;
  }

  return /\.(jpg|jpeg|png|webp)(\?.*)?$/.test(normalized);
};

export const assertEngine4ViatorTour = (tour: Engine4TourViewModel): void => {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test"
  ) {
    return;
  }

  if (tour.engine !== "engine4" || tour.bookingProvider !== "viator") {
    throw new Error(
      "Invalid Engine4 Viator contract: engine/provider mismatch"
    );
  }

  if (!isNonEmptyString(tour.productCode) || !isNonEmptyString(tour.slug)) {
    throw new Error("Invalid Engine4 Viator contract: missing identifiers");
  }

  if (
    !isNonEmptyString(tour.canonicalPath) ||
    !tour.canonicalPath.startsWith("/destinations/")
  ) {
    throw new Error(
      "Invalid Engine4 Viator contract: canonicalPath is invalid"
    );
  }

  if (
    !isNonEmptyString(tour.bookingUrl) ||
    (!tour.bookingUrl.startsWith("https://www.viator.com/") &&
      !tour.bookingUrl.startsWith("https://travelagents.viator.com/"))
  ) {
    throw new Error("Invalid Engine4 Viator contract: bookingUrl is invalid");
  }

  const { destination } = tour;
  if (
    !isNonEmptyString(destination.country) ||
    !isNonEmptyString(destination.state) ||
    !isNonEmptyString(destination.stateSlug) ||
    !isNonEmptyString(destination.city) ||
    !isNonEmptyString(destination.citySlug)
  ) {
    throw new Error(
      "Invalid Engine4 Viator contract: destination is incomplete"
    );
  }

  if (
    !isNonEmptyString(tour.heroImage) ||
    !ENGINE4_TACDN_HERO_REGEX.test(tour.heroImage)
  ) {
    throw new Error("Engine4 heroImage must be a TACDN image");
  }

  assertEngine4ViatorTourHero(tour.heroImage);

  if (!looksLikeImageUrl(tour.heroImage)) {
    throw new Error("Engine4 heroImage must look like an image URL");
  }

  if (!isNonEmptyString(tour.content.overview)) {
    throw new Error(
      "Invalid Engine4 Viator contract: content.overview is required"
    );
  }
};
