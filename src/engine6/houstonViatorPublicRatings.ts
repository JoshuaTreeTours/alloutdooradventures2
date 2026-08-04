export type HoustonViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Houston d5186 Engine6 products. */
export const HOUSTON_VIATOR_PUBLIC_RATINGS: Record<
  string,
  HoustonViatorPublicRating
> = {
  "192749P7": { rating: 5.0, reviewCount: 25 },
  "37391P2": { rating: 4.8, reviewCount: 23 },
  "377051P2": { rating: 4.9, reviewCount: 92 },
  "172188P36": { rating: 5.0, reviewCount: 1 },
  "129206P4": { rating: 4.6, reviewCount: 40 },
  "129206P5": { rating: 4.4, reviewCount: 21 },
  "129206P2": { rating: 4.8, reviewCount: 137 },
  "129206P1": { rating: 4.6, reviewCount: 168 },
  "331634P5": { rating: 5.0, reviewCount: 2 },
  "37391P12": { rating: 4.8, reviewCount: 64 },
  "192749P6": { rating: 4.9, reviewCount: 227 },
  "192749P5": { rating: 4.9, reviewCount: 43 },
  "37391P17": { rating: 4.8, reviewCount: 229 },
  "192749P1": { rating: 4.9, reviewCount: 719 },
  "5920CITY": { rating: 4.1, reviewCount: 611 },
  "298059P2": { rating: 4.8, reviewCount: 273 },
  "333327P1": { rating: 4.6, reviewCount: 76 },
  "192749P8": { rating: 5.0, reviewCount: 27 },
  "192749P3": { rating: 4.7, reviewCount: 27 },
  "164292P1": { rating: 5.0, reviewCount: 39 },
};

export const HOUSTON_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  HOUSTON_VIATOR_PUBLIC_RATINGS
);
