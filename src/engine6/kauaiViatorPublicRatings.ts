export type KauaiViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Kauai d670 Engine6 products. */
export const KAUAI_VIATOR_PUBLIC_RATINGS: Record<
  string,
  KauaiViatorPublicRating
> = {
  "106191P10": { rating: 5, reviewCount: 1190 },
  "441243P1": { rating: 4.8, reviewCount: 202 },
  "277445P2": { rating: 4.9, reviewCount: 1565 },
  "23786P2": { rating: 4.8, reviewCount: 1998 },
  "36364P11": { rating: 4.6, reviewCount: 63 },
  "132411P3": { rating: 4.9, reviewCount: 96 },
  "132411P2": { rating: 5, reviewCount: 145 },
  "132411P1": { rating: 4.9, reviewCount: 186 },
  "7062WCWFT1": { rating: 5, reviewCount: 197 },
  "2064P6": { rating: 4.7, reviewCount: 398 },
  "445157P2": { rating: 4.9, reviewCount: 61 },
  "24198P1": { rating: 4.8, reviewCount: 1241 },
  "2360KAUAI": { rating: 4.5, reviewCount: 538 },
  "5655PLANTATION": { rating: 4.4, reviewCount: 176 },
  "6654P2": { rating: 5, reviewCount: 5722 },
};

export const KAUAI_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  KAUAI_VIATOR_PUBLIC_RATINGS
);
