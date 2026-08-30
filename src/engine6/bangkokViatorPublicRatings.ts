export type BangkokViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Bangkok d343 Engine6 products. */
export const BANGKOK_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BangkokViatorPublicRating
> = {
  "24380P161": { rating: 5.0, reviewCount: 137 },
  "18897P6": { rating: 4.8, reviewCount: 419 },
  "36435P43": { rating: 4.5, reviewCount: 64 },
  "30727P34": { rating: 4.7, reviewCount: 71 },
  "90546P140": { rating: 5.0, reviewCount: 62 },
  "5086TUD": { rating: 4.5, reviewCount: 51 },
  "198444P1": { rating: 5.0, reviewCount: 424 },
  "112650P5": { rating: 4.7, reviewCount: 6401 },
  "6924BKKGHTB07": { rating: 4.9, reviewCount: 81 },
  "8374P24": { rating: 4.5, reviewCount: 3445 },
};

export const BANGKOK_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BANGKOK_VIATOR_PUBLIC_RATINGS
);

/** Public Viator From$ / From US$ / FromUSD amounts in USD for the selected Bangkok d343 products. */
export const BANGKOK_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "24380P161": 257.72,
  "18897P6": 207.2,
  "36435P43": 145,
  "30727P34": 115.8,
  "90546P140": 55.23,
  "5086TUD": 40.17,
  "198444P1": 38.37,
  "112650P5": 36.44,
  "6924BKKGHTB07": 35,
  "8374P24": 30.7,
};
