export type Engine3Tour = {
  engine: "engine3";
  bookingProvider: "viator";
  viator: {
    url: string;
    productCode: string;
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
  title: string;
  description: string;
  country?: string;
  city: string;
  region: string;
  canonicalPath: string;
  bookingUrl: string;
  duration?: string;
  heroImageUrl?: string;
  priceFrom?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  meetingPointDescription?: string;
  itinerary?: Engine3ItineraryItem[];
  faqs?: Engine3FaqItem[];
};

export type ViatorProductData = {
  sourceUrl: string;
  productCode: string;
  title?: string;
  description?: string;
  supplierImage?: string;
  priceFrom?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  meetingPointDescription?: string;
  itinerary?: Engine3ItineraryItem[];
  faqs?: Engine3FaqItem[];
  duration?: string;
};
