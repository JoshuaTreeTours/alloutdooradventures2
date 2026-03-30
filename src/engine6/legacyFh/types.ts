export type LegacyFhPriceSnapshot = {
  amount: number | null;
  currency: string;
  label: string | null;
  options: Array<{
    label: string;
    amount: number;
  }>;
};

export type LegacyFhRatingSnapshot = {
  rating: number | null;
  reviewCount: number | null;
};

export type LegacyFhItineraryStop = {
  title: string;
  description?: string;
};

export type LegacyFhMigratedProductRecord = {
  slug: string;
  canonicalPath: string;
  bookingPath: string;
  title: string;
  operator: string | null;
  heroImageUrl: string | null;
  galleryImages: string[];
  priceSnapshot: LegacyFhPriceSnapshot;
  ratingSnapshot: LegacyFhRatingSnapshot;
  overview: string | null;
  highlights: string[];
  itinerary: LegacyFhItineraryStop[];
  inclusions: string[];
  exclusions: string[];
  meetingInfo: string | null;
  durationText: string | null;
  additionalInfo: string[];
  cancellationSummary: string | null;
  sourceType: "legacy_fh_migrated";
};

export type LegacyFhExtractionInput = {
  slug: string;
  canonicalPath: string;
  bookingPath: string;
  operator: string | null;
  publicHtml: string;
  bookingHtml?: string;
  fallback: {
    title: string;
    heroImageUrl?: string | null;
    galleryImages?: string[];
    ratingSnapshot?: LegacyFhRatingSnapshot;
  };
};
