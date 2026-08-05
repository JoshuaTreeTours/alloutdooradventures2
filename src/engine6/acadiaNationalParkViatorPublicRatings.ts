export type AcadiaNationalParkViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Acadia National Park d4371 Engine6 products. */
export const ACADIA_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS: Record<
  string,
  AcadiaNationalParkViatorPublicRating
> = {
  "124652P1": { rating: 4.7, reviewCount: 1926 },
  "124652P2": { rating: 4.8, reviewCount: 658 },
  "266852P3": { rating: 4.9, reviewCount: 411 },
  "87115P76": { rating: 4.6, reviewCount: 171 },
  "265766P25": { rating: 4.9, reviewCount: 121 },
  "227717P1": { rating: 5.0, reviewCount: 265 },
  "227717P2": { rating: 4.9, reviewCount: 217 },
  "227717P3": { rating: 4.9, reviewCount: 179 },
  "485251P2": { rating: 4.8, reviewCount: 11 },
  "265766P29": { rating: 5.0, reviewCount: 3 },
  "5569071P4": { rating: 5.0, reviewCount: 19 },
  "5569071P10": { rating: 5.0, reviewCount: 6 },
  "5596065P9": { rating: 5.0, reviewCount: 3 },
  "5596065P3": { rating: 5.0, reviewCount: 1 },
  "265766P17": { rating: 5.0, reviewCount: 60 },
};

export const ACADIA_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  ACADIA_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS
);
