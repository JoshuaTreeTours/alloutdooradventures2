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
  countryCode?: string;
  countrySlug?: string;
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
  engine?: "engine1" | "engine2" | "engine3";
  productCode?: string;
  slug: string;
  title: string;
  shortDescription?: string;
  operator?: string;
  tags?: string[];
  categories?: string[];
  primaryCategory?: string;
  destination: TourDestination;
  heroImage: string;
  heroImageOverride?: string;
  content?: {
    images?: string[];
  };
  primaryImageUrl?: string;
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
  longDescription: string;
  suppressReviews?: boolean;
};
