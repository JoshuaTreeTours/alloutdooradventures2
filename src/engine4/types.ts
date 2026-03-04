export type Engine4ViatorTourRecord = {
  engine: "engine4";
  bookingProvider: "viator";
  viator: {
    productCode: string;
    url: string;
    heroImageOverrideUrl?: string;
  };
  slug: string;
  destination: {
    country: string;
    state: string;
    city: string;
  };
};

export type Engine4ViatorApiTour = {
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
  inclusions?: string[];
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
  cancellationPolicy?: string;
  inclusions?: string[];
  overview: string;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
};
