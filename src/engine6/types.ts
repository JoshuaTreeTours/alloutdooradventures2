export type Engine6ProductRecord = {
  productCode: string;
  slug: string;
  canonicalPath: string;
  destination: {
    country: string;
    state: string;
    city: string;
    stateSlug: string;
    citySlug: string;
  };
};

export type Engine6FaqItem = {
  question: string;
  answer: string;
};

export type Engine6ItineraryItem = {
  title: string;
  description?: string;
  duration?: string;
};

export type Engine6ResolvedTourPageData = {
  productCode: string;
  slug: string;
  canonicalPath: string;
  bookingUrl: string;
  destinationLabel: string;
  title: string;
  overview: string;
  heroImage?: string;
  galleryImages: string[];
  fromPrice?: number;
  fromPriceText?: string;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
  meetingPointFull?: string;
  meetingPointShort?: string;
  durationText?: string;
  cancellationText?: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: Engine6ItineraryItem[];
  faqs: Engine6FaqItem[];
  additionalInfo: string[];
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogImage?: string;
  };
  schema: {
    productName: string;
    description: string;
    image?: string;
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
    offer?: {
      price?: number;
      priceCurrency?: string;
      url: string;
    };
  };
};

export type Engine6ListingItem = {
  id: string;
  title: string;
  shortDescription: string;
  heroImage?: string;
  fromPriceText?: string;
  ratingValue?: number;
  reviewCount?: number;
  href: string;
};
