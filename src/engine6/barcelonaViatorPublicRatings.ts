export type BarcelonaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Barcelona d562 Engine6 products. */
export const BARCELONA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BarcelonaViatorPublicRating
> = {
  "110975P7": { rating: 4.8, reviewCount: 865 },
  "17377P22": { rating: 5.0, reviewCount: 115 },
  "17377P12": { rating: 4.9, reviewCount: 100 },
  "9866P50": { rating: 4.7, reviewCount: 53 },
  "2646BCNBALLOON": { rating: 4.8, reviewCount: 556 },
  "33913P5": { rating: 4.9, reviewCount: 320 },
  "6874P23": { rating: 4.7, reviewCount: 343 },
  "127264P9": { rating: 5.0, reviewCount: 84 },
  "8513P1": { rating: 4.9, reviewCount: 209 },
  "16168P24": { rating: 4.9, reviewCount: 1431 },
  "43217P5": { rating: 5.0, reviewCount: 2306 },
  "3993FTBB": { rating: 4.7, reviewCount: 2921 },
  "9866P31": { rating: 4.8, reviewCount: 688 },
  "9866P29": { rating: 4.9, reviewCount: 5463 },
  "16168P23": { rating: 4.8, reviewCount: 671 },
  "5689P12": { rating: 4.9, reviewCount: 232 },
  "120041P6": { rating: 4.9, reviewCount: 66 },
  "333987P1": { rating: 4.8, reviewCount: 231 },
  "9866P55": { rating: 4.8, reviewCount: 1193 },
};

export const BARCELONA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BARCELONA_VIATOR_PUBLIC_RATINGS
);
