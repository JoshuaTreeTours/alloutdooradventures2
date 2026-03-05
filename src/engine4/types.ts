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
  galleryImages: string[];
  facts: Engine4TourFacts;
  content: Engine4TourContent;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

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

  if (!isNonEmptyString(tour.bookingUrl)) {
    throw new Error("Invalid Engine4 Viator contract: bookingUrl is required");
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

  if (tour.heroImage !== null && !isNonEmptyString(tour.heroImage)) {
    throw new Error(
      "Invalid Engine4 Viator contract: heroImage must be string|null"
    );
  }

  if (!isNonEmptyString(tour.content.overview)) {
    throw new Error(
      "Invalid Engine4 Viator contract: content.overview is required"
    );
  }
};
