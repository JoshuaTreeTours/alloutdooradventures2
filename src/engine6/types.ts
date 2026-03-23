export type Engine6ItineraryItem = {
  title: string;
  description?: string;
  duration?: string;
};

export type Engine6FaqItem = {
  question: string;
  answer: string;
};

export type Engine6HeroSource =
  | "viator-api-primary"
  | "viator-api-gallery"
  | "trusted-scraped-page-hero"
  | "fallback-image";

export type Engine6HeroCandidate = {
  url: string;
  path: string;
  variantPath: string;
  width: number | null;
  height: number | null;
  source: Engine6HeroSource;
  resolver: string;
};

export type Engine6RejectedHeroCandidate = {
  productCode: string | null;
  productUrl: string | null;
  heroImageUrl: string | null;
  imageSourceUsed: string | null;
  reason: string;
};

export type Engine6TourDiagnostics = {
  source: "live-api" | "bundled-fallback";
  resolvedProductUrl: string | null;
  resolvedHeroImageUrl: string | null;
  commercialPriceFieldPath: string | null;
  commercialPriceRawValue: string | number | null;
  priceSourceUsed: "live-price" | "fallback";
  heroImageFieldPath: string | null;
  heroVariantFieldPath: string | null;
  selectedHeroWidth: number | null;
  selectedHeroHeight: number | null;
  imageSourceUsed: Engine6HeroSource;
  heroResolverName: string | null;
  apiPrimaryImageCandidate: Engine6HeroCandidate | null;
  apiGalleryImageCandidates: Engine6HeroCandidate[];
  scrapedImageCandidates: Engine6HeroCandidate[];
  fallbackImageCandidates: Engine6HeroCandidate[];
  finalSelectedHero: Engine6HeroCandidate | null;
  heroScopedProductCode?: string | null;
  heroScopedProductUrl?: string | null;
  heroScopeConfirmed?: boolean;
  rejectedForeignHeroCandidates?: Engine6RejectedHeroCandidate[];
  productUrlFieldPath: string | null;
  bookingUrlSource: string;
  ratingFieldPath: string | null;
  reviewCountFieldPath: string | null;
  overviewFieldPath: string | null;
  highlightsFieldPath: string | null;
  meetingPointFieldPath: string | null;
  itineraryFieldPath: string | null;
  itineraryItemCount: number;
  itinerarySourceUsed: string | null;
  faqsFieldPath: string | null;
  faqFieldPath: string | null;
  faqCount: number;
  faqSourceUsed: string | null;
  requirementsFieldPath: string | null;
  highlightClassificationReason: string | null;
  classificationFieldPath: string | null;
  fieldLevelFallbackUsed: boolean;
  fallbackFieldNames: string[];
};

export type Engine6ApiDiagnostics = Engine6TourDiagnostics & {
  hasViatorApiKey: boolean;
  attemptedLiveFetch: boolean;
  upstreamStatus: number | null;
  upstreamContentType: string | null;
  upstreamOk: boolean | null;
  usedBundledFallbackBecause: string;
};

export type Engine6CategorySlug =
  | "off-road-tour"
  | "hiking-tour"
  | "bike-tour"
  | "boat-tour"
  | "paddle-tour"
  | "wildlife-tour"
  | "snorkeling-tour"
  | "food-and-drink-tour"
  | "air-tour"
  | "sightseeing-tour"
  | "adventure-tour"
  | "adventure"
  | "hiking"
  | "sightseeing"
  | "wildlife"
  | "water";

export type Engine6Tour = {
  productCode: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  description: string;
  metaDescription: string;
  city: string;
  state: string;
  heroImageUrl: string;
  cardImageUrl: string;
  galleryImageUrls: string[];
  priceAmount: number | null;
  priceFormatted: string;
  aggregateRating: number | null;
  reviewCount: number | null;
  durationText: string | null;
  pickupOffered: boolean;
  mobileTicket: boolean;
  language: string | null;
  operatorName: string | null;
  cancellationSummary: string | null;
  inclusionItems: string[];
  exclusionItems: string[];
  meetingPointText: string;
  overviewText: string | null;
  highlights: string[];
  itinerary: Engine6ItineraryItem[];
  faqs: Engine6FaqItem[];
  requirements: string[];
  primaryCategory: Engine6CategorySlug | string | null;
  categories: Array<Engine6CategorySlug | string>;
  categoryLabel: string | null;
  pagePath: string;
  canonicalPath: string;
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
    galleryImageUrls: string[];
    productUrl: string | null;
    priceAmount: number | null;
    priceFormatted: string | null;
    aggregateRating: number | null;
    reviewCount: number | null;
    durationText: string | null;
    pickupOffered: boolean;
    mobileTicket: boolean;
    language: string | null;
    operatorName: string | null;
    cancellationSummary: string | null;
    inclusionItems: string[];
    exclusionItems: string[];
    meetingPointText: string | null;
    overviewText: string | null;
    highlights: string[];
    itinerary: Engine6ItineraryItem[];
    faqs: Engine6FaqItem[];
    requirements: string[];
    primaryCategory: Engine6CategorySlug | string | null;
    categories: Array<Engine6CategorySlug | string>;
  };
};
