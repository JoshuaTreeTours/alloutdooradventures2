export type BaliViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Bali Engine6 products. */
export const BALI_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BaliViatorPublicRating
> = {
  "86621P5": { rating: 5.0, reviewCount: 14252 },
  "86621P2": { rating: 5.0, reviewCount: 3142 },
  "86621P3": { rating: 5.0, reviewCount: 1708 },
  "60357P25": { rating: 4.7, reviewCount: 681 },
  "206176P2": { rating: 4.9, reviewCount: 1757 },
  "11769P30": { rating: 5.0, reviewCount: 2141 },
  "243038P1": { rating: 5.0, reviewCount: 228 },
  "416971P1": { rating: 5.0, reviewCount: 415 },
  "52577P9": { rating: 4.9, reviewCount: 500 },
  "92029P158": { rating: 4.9, reviewCount: 113 },
  "117975P5": { rating: 5.0, reviewCount: 580 },
  "66791P20": { rating: 4.9, reviewCount: 230 },
};

export const BALI_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BALI_VIATOR_PUBLIC_RATINGS
);

/** Public Viator From$ / From US$ / FromUSD amounts in USD for the selected Bali products. */
export const BALI_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "86621P5": 100,
  "86621P2": 105,
  "86621P3": 100,
  "60357P25": 87,
  "206176P2": 35,
  "11769P30": 39,
  "243038P1": 37,
  "416971P1": 39.47,
  "52577P9": 26,
  "92029P158": 43,
  "117975P5": 41.8,
  "66791P20": 25.87,
};
