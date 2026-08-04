export type AspenViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Aspen d26395 Engine6 products. */
export const ASPEN_VIATOR_PUBLIC_RATINGS: Record<
  string,
  AspenViatorPublicRating
> = {
  "74828P1": { rating: 4.9, reviewCount: 83 },
  "74828P2": { rating: 5.0, reviewCount: 42 },
  "74828P3": { rating: 5.0, reviewCount: 9 },
  "74828P4": { rating: 5.0, reviewCount: 24 },
  "74828P5": { rating: 5.0, reviewCount: 5 },
  "147508P175": { rating: 5.0, reviewCount: 3 },
};

export const ASPEN_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  ASPEN_VIATOR_PUBLIC_RATINGS
);
