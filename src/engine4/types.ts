export type Engine4ViatorTourRecord = {
  engine: "engine4";
  bookingProvider: "viator";
  viator: {
    productCode: string;
    url: string;
    heroImageOverrideUrl?: string;
    sourceHeroImageUrl?: string;
  };
  slug: string;
  destination: {
    country: string;
    state: string;
    city: string;
  };
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
  productCode: string;
  title: string;
  canonicalPath: string;
  bookingUrl: string;
  city: string;
  state: string;
  country: string;
  heroImage: string;
  galleryImages: string[];
  fromPrice?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  startTime?: string;
  meetingPoint?: string;
  meetingPointShort?: string;
  description?: string;
  descriptionLong?: string;
  itinerary?: Array<{
    title: string;
    description?: string;
    duration?: string;
  }>;
  whatToExpect?: string;
  cancellationPolicy?: string;
  inclusions?: string[];
  exclusions?: string[];
  additionalInfo?: string[];
  overview: string;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
};
