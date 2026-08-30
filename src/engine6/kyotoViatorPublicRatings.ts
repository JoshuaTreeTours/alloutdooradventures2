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
