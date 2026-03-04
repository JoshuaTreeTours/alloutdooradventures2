export type Engine3Tour = {
  engine: "engine3";
  bookingProvider: "viator";
  viator: {
    url: string;
    productCode: string;
    heroImageOverrideUrl?: string;
  };
  slug: string;
  destination: {
    country: string;
    region?: string;
    state?: string;
    city: string;
  };
};

export type Engine3ItineraryItem = {
  title?: string;
  description?: string;
  duration?: string;
  order?: number;
};

export type Engine3FaqItem = {
  question: string;
  answer: string;
};

export type Engine3TourViewModel = {
  tourId: string;
  bookingProvider?: "viator";
  viator?: {
    productUrl?: string;
  };
  title: string;
  description: string;
  overview?: string | null;
  country?: string;
  stateSlug?: string;
  city: string;
  citySlug?: string;
  region: string;
  canonicalPath: string;
  bookingUrl: string;
  duration?: string;
  primaryImageUrl?: string;
  heroImageOverrideUrl?: string;
  heroImageUrl?: string;
  content?: {
    images?: string[];
  };
  priceFrom?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  meetingPointText?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  included?: string[];
  notIncluded?: string[];
  meetingPointDescription?: string;
  operatorName?: string;
  availability?: string;
  latitude?: number;
  longitude?: number;
  itinerary?: Engine3ItineraryItem[];
  faqs?: Engine3FaqItem[];
};

export type ViatorProductData = {
  sourceUrl: string;
  productCode: string;
  title?: string;
  description?: string;
  overview?: string | null;
  supplierImage?: string;
  imageCandidates?: string[];
  priceFrom?: string;
  priceCurrency?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  ratingValue?: number;
  meetingPointText?: string;
  operatorName?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  included?: string[];
  notIncluded?: string[];
  meetingPointDescription?: string;
  itinerary?: Engine3ItineraryItem[];
  faqs?: Engine3FaqItem[];
  duration?: string;
  meetingLocation?: string;
  departureLocation?: string;
  minAge?: number;
  maxGroupSize?: number;
  cancellationWindowHours?: number;
  vehicleType?: string;
  signatureHighlight?: string;
  latitude?: number;
  longitude?: number;
};
