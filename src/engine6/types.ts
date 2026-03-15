export type Engine6Faq = { question: string; answer: string };

export type Engine6ItineraryItem = {
  title: string;
  description?: string;
  duration?: string;
};

export type Engine6PageData = {
  productCode: string;
  slug: string;
  canonicalPath: string;
  title: string;
  heroImage: string;
  galleryImages: string[];
  fromPrice: string;
  currency: string;
  ratingValue?: number;
  reviewCount?: number;
  meetingPointFull?: string;
  meetingPointShort?: string;
  durationText?: string;
  cancellationText?: string;
  overview: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: Engine6ItineraryItem[];
  faqs: Engine6Faq[];
  additionalInfo: string[];
  seo: {
    title: string;
    description: string;
    canonical: string;
    ogImage: string;
  };
};
