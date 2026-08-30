export type TokyoViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Tokyo d334 Engine6 products. */
export const TOKYO_VIATOR_PUBLIC_RATINGS: Record<
  string,
  TokyoViatorPublicRating
> = {
  "92136P34": { rating: 4.9, reviewCount: 3046 },
  "30791P157": { rating: 4.9, reviewCount: 1032 },
  "33215P1": { rating: 5.0, reviewCount: 1147 },
  "6869TYOTM": { rating: 5.0, reviewCount: 50 },
  "434880P1": { rating: 5.0, reviewCount: 27 },
  "130384P1": { rating: 4.9, reviewCount: 1493 },
  "65053P9": { rating: 4.8, reviewCount: 677 },
  "40436P1": { rating: 5.0, reviewCount: 356 },
  "40436P7": { rating: 4.9, reviewCount: 48 },
  "65053P10": { rating: 4.6, reviewCount: 35 },
  "319176P1": { rating: 4.4, reviewCount: 77 },
};

export const TOKYO_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  TOKYO_VIATOR_PUBLIC_RATINGS
);
