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

export type Tour = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  operator?: string;
  tags?: string[];
  categories?: string[];
  primaryCategory?: string;
  destination: TourDestination;
  heroImage: string;
  galleryImages?: string[];
  badges: TourBadges;
  tagPills?: string[];
  activitySlugs: string[];
  bookingProvider: BookingProvider;
  bookingUrl: string;
  bookingWidgetUrl?: string;
  longDescription: string;
  suppressReviews?: boolean;
  durationDays?: number;
};
