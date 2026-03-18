export type Engine6ItineraryItem = {
  title: string;
  description?: string;
  duration?: string;
};

export type Engine6Tour = {
  productCode: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  city: string;
  state: string;
  heroImageUrl: string;
  cardImageUrl: string;
  priceAmount: number | null;
  priceFormatted: string;
  aggregateRating: number | null;
  reviewCount: number | null;
  meetingPointText: string;
  itinerary: Engine6ItineraryItem[];
  bookingUrl: string;
  diagnostics: {
    source: "live-api" | "bundled-fallback";
    commercialPriceFieldPath: string | null;
    heroImageFieldPath: string | null;
    ratingFieldPath: string | null;
    reviewCountFieldPath: string | null;
    meetingPointFieldPath: string | null;
    itineraryFieldPath: string | null;
  };
};

export type Engine6ApiResponse = {
  source: "live-api" | "bundled-fallback";
  diagnostics: {
    hasViatorApiKey: boolean;
    attemptedLiveFetch: boolean;
    upstreamStatus: number | null;
    upstreamContentType: string | null;
    upstreamOk: boolean | null;
    usedBundledFallbackBecause: string;
    commercialPriceFieldPath: string | null;
    heroImageFieldPath: string | null;
    ratingFieldPath: string | null;
    reviewCountFieldPath: string | null;
    itineraryFieldPath: string | null;
    meetingPointFieldPath: string | null;
  };
  rawProductCode: string;
  rawProduct: Record<string, unknown> | null;
  extracted: {
    title: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    city: string | null;
    state: string | null;
    heroImageUrl: string | null;
    cardImageUrl: string | null;
    priceAmount: number | null;
    priceFormatted: string | null;
    aggregateRating: number | null;
    reviewCount: number | null;
    meetingPointText: string | null;
    itinerary: Engine6ItineraryItem[];
  };
};
