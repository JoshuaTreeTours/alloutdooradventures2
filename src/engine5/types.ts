export type Engine5ImageVariant = {
  url: string;
  width?: number;
  height?: number;
};

export type Engine5ExactProductImage = {
  url?: string;
  isCover: boolean;
  variants: Engine5ImageVariant[];
};

export type Engine5HeroSelectionSource =
  | "api-images-payload"
  | "override"
  | "missing";

export type Engine5ViatorApiTour = {
  productCode: string;
  title: string;
  bookingUrl: string;
  description: string;
  duration?: string;
  startTime?: string;
  fromPrice?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  meetingPoint?: string;
  cancellationPolicy?: string;
  itinerary: Array<{ title: string; description?: string; duration?: string }>;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
  inclusions: string[];
  exclusions: string[];
  additionalInfo: string[];
  exactProductImages: Engine5ExactProductImage[];
  canonicalHeroUrl?: string;
  heroSelectionSource: Engine5HeroSelectionSource;
  heroSelectionSize?: { width?: number; height?: number };
  heroSelectionDiagnostics: {
    candidateUrls: string[];
  };
  provenance: {
    apiFetchAttempted: true;
    apiFetchSucceeded: boolean;
    descriptionSource: "api";
    resolverDiagnostics?: {
      price: { value?: string; fieldPath?: string };
      rating: {
        value?: number;
        fieldPath?: string;
        sourceFamily?:
          | "public-product"
          | "review-summary"
          | "reviews"
          | "fallback";
      };
      reviewCount: {
        value?: number;
        fieldPath?: string;
        sourceFamily?:
          | "public-product"
          | "review-summary"
          | "reviews"
          | "fallback";
      };
    };
  };
};

export type Engine5NormalizedTour = {
  productCode: string;
  slug: string;
  destination: Engine5ProductRecord["destination"];
  bookingUrl: string;
  title: string;
  facts: {
    priceFrom?: string;
    ratingValue?: number;
    reviewCount?: number;
    duration?: string;
    startTime?: string;
    meetingPointFull?: string;
    meetingPointShort?: string;
    cancellationPolicy?: string;
  };
  content: {
    overview: string;
    highlights: string[];
    faqs: Array<{ question: string; answer: string }>;
    itinerary: Array<{
      title: string;
      description?: string;
      duration?: string;
    }>;
    inclusions: string[];
    exclusions: string[];
    additionalInfo?: string;
  };
  exactProductImages: Engine5ExactProductImage[];
  canonicalHeroUrl?: string;
  heroSelectionSource: Engine5HeroSelectionSource;
  heroSelectionSize?: { width?: number; height?: number };
  diagnostics: {
    exactProductImageCandidateUrls: string[];
    selectedCanonicalHeroUrl?: string;
    pageHeroUrl?: string;
    listingCardUrl?: string;
    ogImageUrl?: string;
    schemaImageUrl?: string;
    allImageSurfacesIdentical: boolean;
  };
};

export type Engine5ProductRecord = {
  productCode: "132218P209";
  destination: {
    country: string;
    state: string;
    stateSlug: string;
    city: string;
    citySlug: string;
  };
};
