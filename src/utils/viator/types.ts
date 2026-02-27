export type ViatorParsedTour = {
  title?: string;
  destinationText?: string;
  operatorName?: string;
  durationText?: string;
  priceFrom?: number;
  currency?: string;
  overviewText?: string;
  highlightsSourceText?: string[];
  meetingPoint?: { name?: string; address?: string; notes?: string };
  itinerary?: Array<{ title: string; duration?: string; details?: string }>;
  included?: string[];
  notIncluded?: string[];
  faqs?: Array<{ q: string; a: string }>;
  ratingValue?: number;
  reviewCount?: number;
  recommendedPercent?: number;
  cancellationText?: string;
  knowBeforeYouGo?: string[];
  images: string[];
  primaryImage?: string;
};

export type ViatorMedia = {
  primaryImage?: string;
  images: string[];
};

export type ViatorRegistryEntry = {
  slug: string;
  pagePath: string;
  regionSlug: string;
  destinationSlug: string;
  viatorUrl: string;
  source: "viator";
  parsed: ViatorParsedTour;
  media: ViatorMedia;
  operatorImages?: string[];
  heroImageUrl: string;
  bottomImageUrl?: string;
  derived: {
    highlights: string[];
    description: string;
  };
};

export type ViatorTourTemplateModel = {
  title: string;
  destinationText?: string;
  operatorName?: string;
  durationText?: string;
  heroImageUrl: string;
  bottomImageUrl?: string;
  included?: string[];
  notIncluded?: string[];
  longDescription: string;
  highlights: string[];
  meetingPoint?: { name?: string; address?: string; notes?: string };
  itinerary: Array<{ title: string; duration?: string; details?: string }>;
  faqs: Array<{ q: string; a: string }>;
  bookingUrl: string;
  priceFrom?: number;
  currency?: string;
};
