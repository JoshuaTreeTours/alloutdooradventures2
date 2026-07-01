export type MontereyViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Monterey d5250 Engine6 products. */
export const MONTEREY_VIATOR_PUBLIC_RATINGS: Record<
  string,
  MontereyViatorPublicRating
> = {
  "70275P1": { rating: 4.9, reviewCount: 767 },
  "53254P1": { rating: 4.8, reviewCount: 974 },
  "362397P1": { rating: 4.6, reviewCount: 519 },
  "53254P8": { rating: 4.7, reviewCount: 68 },
  "5973FOOD": { rating: 4.9, reviewCount: 357 },
  "88377P1": { rating: 5.0, reviewCount: 223 },
  "39976P3": { rating: 4.9, reviewCount: 45 },
  "14670CAR": { rating: 3.9, reviewCount: 156 },
  "173135P2": { rating: 5.0, reviewCount: 54 },
  "434555P1": { rating: 5.0, reviewCount: 74 },
  "118676P4": { rating: 4.5, reviewCount: 14 },
  "9345P24": { rating: 4.8, reviewCount: 38 },
};

export const MONTEREY_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  MONTEREY_VIATOR_PUBLIC_RATINGS
);
