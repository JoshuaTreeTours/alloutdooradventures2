export type Engine6ItineraryItem = {
  title: string;
  description?: string;
  duration?: string;
};

export type Engine6FaqItem = {
  question: string;
  answer: string;
};

export type Engine6TourDiagnostics = {
  source: "live-api" | "bundled-fallback";
  commercialPriceFieldPath: string | null;
  heroImageFieldPath: string | null;
  ratingFieldPath: string | null;
  reviewCountFieldPath: string | null;
  overviewFieldPath: string | null;
  highlightsFieldPath: string | null;
  meetingPointFieldPath: string | null;
  itineraryFieldPath: string | null;
  faqsFieldPath: string | null;
};

export type Engine6ApiDiagnostics = Engine6TourDiagnostics & {
  hasViatorApiKey: boolean;
  attemptedLiveFetch: boolean;
  upstreamStatus: number | null;
  upstreamContentType: string | null;
  upstreamOk: boolean | null;
  usedBundledFallbackBecause: string;
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
  overviewText: string | null;
  highlights: string[];
  itinerary: Engine6ItineraryItem[];
  faqs: Engine6FaqItem[];
  bookingUrl: string;
  diagnostics: Engine6TourDiagnostics;
};

export type Engine6ApiResponse = {
  source: "live-api" | "bundled-fallback";
  diagnostics: Engine6ApiDiagnostics;
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
    overviewText: string | null;
    highlights: string[];
    itinerary: Engine6ItineraryItem[];
    faqs: Engine6FaqItem[];
  };
};
