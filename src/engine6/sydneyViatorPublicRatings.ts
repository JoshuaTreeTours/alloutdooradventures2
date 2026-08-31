export type SydneyViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Sydney Engine6 products. */
export const SYDNEY_VIATOR_PUBLIC_RATINGS: Record<
  string,
  SydneyViatorPublicRating
> = {
  "184156P4": { rating: 4.9, reviewCount: 194 },
  "6793P35": { rating: 4.4, reviewCount: 154 },
  "3378WHALE": { rating: 4.3, reviewCount: 207 },
  "5657BRIDGECLIMB": { rating: 4.8, reviewCount: 2400 },
  "24058P1": { rating: 4.7, reviewCount: 1473 },
  "22584P1": { rating: 4.9, reviewCount: 6144 },
  "156795P5": { rating: 4.4, reviewCount: 231 },
  "14172P3": { rating: 4.9, reviewCount: 108 },
  "392485P1": { rating: 4.8, reviewCount: 137 },
  "3293SYDHARBOUR": { rating: 4.8, reviewCount: 572 },
  "6770P22": { rating: 4.6, reviewCount: 104 },
  "5507708P5": { rating: 4.9, reviewCount: 124 },
  "146921P1": { rating: 5.0, reviewCount: 23 },
  "455986P1": { rating: 5.0, reviewCount: 12 },
  "6088P3": { rating: 4.8, reviewCount: 13 },
  "5509792P1": { rating: 4.7, reviewCount: 18 },
  "186752P1": { rating: 4.9, reviewCount: 30 },
  "5951P10": { rating: 4.7, reviewCount: 822 },
  "6912BEER": { rating: 4.9, reviewCount: 391 },
  "3378GOLD": { rating: 4.4, reviewCount: 148 },
};

export const SYDNEY_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  SYDNEY_VIATOR_PUBLIC_RATINGS
);

/**
 * Public Viator From US$ / FromUSD amounts in USD for the selected Sydney products.
 * Source currency was verified as USD on US-facing or locale-explicit listings.
 * AUD amounts such as A$95.00 were rejected and never stored as USD.
 */
export const SYDNEY_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "184156P4": 32.79,
  "6793P35": 27.04,
  "3378WHALE": 61.81,
  "5657BRIDGECLIMB": 194.14,
  "24058P1": 62.44,
  "22584P1": 162.21,
  "156795P5": 134.38,
  "14172P3": 257.33,
  "392485P1": 143.38,
  "3293SYDHARBOUR": 162.87,
  "6770P22": 86.37,
  "5507708P5": 84,
  "146921P1": 105,
  "455986P1": 99,
  "6088P3": 184,
  "5509792P1": 49,
  "186752P1": 357,
  "5951P10": 43,
  "6912BEER": 101,
  "3378GOLD": 171,
};
