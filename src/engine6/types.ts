export type Engine6ItineraryStop = {
  title: string;
  description: string;
  duration?: string;
};

export type Engine6FaqItem = {
  question: string;
  answer: string;
};

export type Engine6Seo = {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
};

export type Engine6FieldPathAudit = {
  pricePath: string;
  ratingPath: string;
  reviewCountPath: string;
  itineraryPath: string;
};

export type Engine6PageData = {
  productCode: string;
  slug: string;
  canonicalPath: string;
  title: string;
  heroImage: string;
  galleryImages: string[];
  fromPrice: number;
  currency: string;
  ratingValue?: number;
  reviewCount?: number;
  meetingPointFull: string;
  meetingPointShort: string;
  durationText: string;
  cancellationText: string;
  overview: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: Engine6ItineraryStop[];
  faqs: Engine6FaqItem[];
  additionalInfo: string[];
  seo: Engine6Seo;
  bookingUrl?: string;
  fieldPathAudit: Engine6FieldPathAudit;
};
