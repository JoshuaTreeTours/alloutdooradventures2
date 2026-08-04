export type BryceCanyonNationalParkViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Bryce Canyon National Park d50798 Engine6 products. */
export const BRYCE_CANYON_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BryceCanyonNationalParkViatorPublicRating
> = {
  "165275P1": { rating: 4.9, reviewCount: 1131 },
  "165275P3": { rating: 5.0, reviewCount: 30 },
  "165275P2": { rating: 5.0, reviewCount: 92 },
  "165275P4": { rating: 4.9, reviewCount: 168 },
  "5569540P1": { rating: 5.0, reviewCount: 3 },
  "5569540P2": { rating: 5.0, reviewCount: 1 },
  "5609276P1": { rating: 4.4, reviewCount: 47 },
  "5609276P3": { rating: 4.9, reviewCount: 7 },
  "342160P3": { rating: 5.0, reviewCount: 2 },
  "422797P7": { rating: 5.0, reviewCount: 1 },
  "265766P65": { rating: 5.0, reviewCount: 5 },
  "406744P2": { rating: 5.0, reviewCount: 112 },
  "406744P4": { rating: 5.0, reviewCount: 3 },
  "117461P1": { rating: 4.2, reviewCount: 164 },
  "117461P2": { rating: 4.4, reviewCount: 76 },
  "117461P3": { rating: 5.0, reviewCount: 26 },
  "117461P5": { rating: 4.6, reviewCount: 77 },
};

export const BRYCE_CANYON_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BRYCE_CANYON_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS
);
