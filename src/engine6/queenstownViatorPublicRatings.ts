export type QueenstownViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Queenstown Engine6 products. */
export const QUEENSTOWN_VIATOR_PUBLIC_RATINGS: Record<
  string,
  QueenstownViatorPublicRating
> = {
  "76369P1": { rating: 4.9, reviewCount: 1389 },
  "460492P1": { rating: 5.0, reviewCount: 167 },
  "5762P6": { rating: 4.7, reviewCount: 251 },
  "58045P5": { rating: 4.9, reviewCount: 85 },
  "87033P3": { rating: 4.9, reviewCount: 200 },
  "2264P24": { rating: 4.3, reviewCount: 84 },
  "3910GS76": { rating: 4.4, reviewCount: 651 },
  "3287_ZQN": { rating: 4.9, reviewCount: 2127 },
  "5627WILDERNESS": { rating: 4.7, reviewCount: 477 },
  "43964P1": { rating: 4.5, reviewCount: 301 },
  "2264RJ301": { rating: 4.7, reviewCount: 213 },
  "38244P1": { rating: 5.0, reviewCount: 639 },
  "3434ZQN_HLQ1B": { rating: 4.9, reviewCount: 53 },
};

export const QUEENSTOWN_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  QUEENSTOWN_VIATOR_PUBLIC_RATINGS
);

/**
 * Public Viator From US$ / FromUSD / US-facing From$ amounts in USD.
 * Source currency was verified on the product page before storage.
 * NZD amounts such as NZ$189.00 were never stored as USD.
 * EUR/GBP-only pages were rejected rather than converted.
 */
export const QUEENSTOWN_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> =
  {
    "76369P1": 120.07,
    "460492P1": 115.32,
    "5762P6": 168.79,
    "58045P5": 133.48,
    "87033P3": 138.3,
    "2264P24": 163.7,
    "3910GS76": 165.86,
    "3287_ZQN": 186.62,
    "5627WILDERNESS": 187.14,
    "43964P1": 204.74,
    "2264RJ301": 271.41,
    "38244P1": 457.1,
    "3434ZQN_HLQ1B": 712.35,
  };
