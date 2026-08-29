export type CancunViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Cancun d631 Engine6 products. */
export const CANCUN_VIATOR_PUBLIC_RATINGS: Record<
  string,
  CancunViatorPublicRating
> = {
  "5885P231": { rating: 4.7, reviewCount: 13523 },
  "110186P7": { rating: 4.8, reviewCount: 6118 },
  "308891P15": { rating: 4.7, reviewCount: 3566 },
  "252732P1": { rating: 4.9, reviewCount: 116 },
  "70244P1": { rating: 4.8, reviewCount: 375 },
  "117119P3": { rating: 5.0, reviewCount: 58 },
  "118403P17": { rating: 4.7, reviewCount: 35 },
  "7041P7": { rating: 4.7, reviewCount: 175 },
  "12861P5": { rating: 4.8, reviewCount: 4032 },
  "6200P5": { rating: 4.7, reviewCount: 3246 },
  "308891P25": { rating: 4.7, reviewCount: 678 },
  "42786P2": { rating: 4.6, reviewCount: 900 },
  "368094P1": { rating: 4.6, reviewCount: 1376 },
};

export const CANCUN_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CANCUN_VIATOR_PUBLIC_RATINGS
);
