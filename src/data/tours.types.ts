export type BookingProvider = "fareharbor" | "viator";

export type TourBadges = {
  rating?: number;
  reviewCount?: number;
  priceFrom?: string;
  duration?: string;
  likelyToSellOut?: boolean;
  tagline?: string;
};

export type TourDestination = {
  country?: string;
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  lat?: number;
  lng?: number;
};

export type TourPricing = {
  isReliable?: boolean;
};

export type Tour = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  sourceDescription?: string;
  sourceDescriptionSource?: "fareharbor" | "manual" | "generated";
  operator?: string;
  tags?: string[];
  categories?: string[];
  primaryCategory?: string;
  destination: TourDestination;
  heroImage: string;
  heroImageUrl?: string;
  heroImageSource?: "fareharbor_media" | "csv" | "manual";
  galleryImages?: string[];
  badges: TourBadges;
  startingPrice?: number;
  currency?: string;
  pricing?: TourPricing;
  tagPills?: string[];
  activitySlugs: string[];
  bookingProvider: BookingProvider;
  bookingUrl: string;
  bookingWidgetUrl?: string;
  sourceOperatorSlug?: string;
  sourceItemId?: string;
  longDescription: string;
  suppressReviews?: boolean;
};
