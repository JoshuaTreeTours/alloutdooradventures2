export type MelbourneViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Melbourne Engine6 products. */
export const MELBOURNE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  MelbourneViatorPublicRating
> = {
  "3181GOWEST1": { rating: 4.8, reviewCount: 6062 },
  "39651P1": { rating: 4.9, reviewCount: 352 },
  "3181P7": { rating: 4.9, reviewCount: 873 },
  "5706M2": { rating: 4.8, reviewCount: 263 },
  "478616P1": { rating: 4.9, reviewCount: 462 },
  "6770TOUR4": { rating: 4.8, reviewCount: 102 },
  "3127YARRA": { rating: 4.9, reviewCount: 489 },
  "13938P1": { rating: 5.0, reviewCount: 601 },
  "108928P13": { rating: 4.7, reviewCount: 1001 },
  "179363P2": { rating: 5.0, reviewCount: 115 },
};

export const MELBOURNE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  MELBOURNE_VIATOR_PUBLIC_RATINGS
);

/**
 * Public Viator From US$ / FromUSD / US-facing From$ amounts in USD.
 * Source currency was verified on the product page before storage.
 * AUD amounts such as A$120.00 were never stored as USD.
 * EUR/GBP/DKK/SGD/SEK/CHF-only pages were rejected rather than converted.
 */
export const MELBOURNE_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "3181GOWEST1": 97.94,
  "39651P1": 52.12,
  "3181P7": 104.51,
  "5706M2": 159.68,
  "478616P1": 90.29,
  "6770TOUR4": 101.02,
  "3127YARRA": 322.61,
  "13938P1": 188.9,
  "108928P13": 86.64,
  "179363P2": 74.92,
};
