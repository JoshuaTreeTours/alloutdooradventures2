export type KyotoViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Kyoto d332 Engine6 products. */
export const KYOTO_VIATOR_PUBLIC_RATINGS: Record<
  string,
  KyotoViatorPublicRating
> = {
  "92136P55": { rating: 4.9, reviewCount: 1106 },
  "92136P37": { rating: 4.9, reviewCount: 515 },
  "92136P49": { rating: 4.9, reviewCount: 310 },
  "21490P11": { rating: 4.9, reviewCount: 263 },
  "285124P1": { rating: 5.0, reviewCount: 766 },
  "5924KYOCUSTOM_FULL": { rating: 4.7, reviewCount: 78 },
  "407697P2": { rating: 4.7, reviewCount: 69 },
  "374249P4": { rating: 5.0, reviewCount: 64 },
  "103013P3": { rating: 5.0, reviewCount: 439 },
  "38922P3": { rating: 4.9, reviewCount: 158 },
  "63670P28": { rating: 5.0, reviewCount: 971 },
  "92281P2": { rating: 4.9, reviewCount: 103 },
  "293458P17": { rating: 5.0, reviewCount: 40 },
  "5522662P20": { rating: 4.9, reviewCount: 739 },
};

export const KYOTO_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  KYOTO_VIATOR_PUBLIC_RATINGS
);

/** Public Viator From$ amounts in USD for the selected Kyoto d332 products. */
export const KYOTO_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "92136P55": 156.6,
  "92136P37": 107.24,
  "92136P49": 659.84,
  "21490P11": 150,
  "285124P1": 192.19,
  "5924KYOCUSTOM_FULL": 191.74,
  "407697P2": 361.03,
  "374249P4": 337.59,
  "103013P3": 181.28,
  "38922P3": 121.95,
  "63670P28": 61.06,
  "92281P2": 321.71,
  "293458P17": 55.05,
  "5522662P20": 49.5,
};
