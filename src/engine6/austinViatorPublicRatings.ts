export type AustinViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Austin d5021 Engine6 products. */
export const AUSTIN_VIATOR_PUBLIC_RATINGS: Record<
  string,
  AustinViatorPublicRating
> = {
  "5513806P1": { rating: 5.0, reviewCount: 46 },
  "406074P3": { rating: 5.0, reviewCount: 62 },
  "421026P1": { rating: 5.0, reviewCount: 14 },
  "327690P1": { rating: 5.0, reviewCount: 4 },
  "10428P19": { rating: 4.9, reviewCount: 349 },
  "10428P6": { rating: 4.9, reviewCount: 999 },
  "87115P27": { rating: 4.5, reviewCount: 81 },
  "5494432P1": { rating: 5.0, reviewCount: 1 },
  "5494432P3": { rating: 5.0, reviewCount: 1 },
  "153655P2": { rating: 4.8, reviewCount: 170 },
  "10428P1": { rating: 4.9, reviewCount: 2383 },
  "244340P2": { rating: 4.9, reviewCount: 235 },
  "121998P6": { rating: 4.8, reviewCount: 432 },
  "406074P1": { rating: 4.9, reviewCount: 237 },
  "291969P2": { rating: 4.5, reviewCount: 238 },
  "57338P1": { rating: 5.0, reviewCount: 1441 },
  "42365P4": { rating: 4.9, reviewCount: 995 },
  "42365P1": { rating: 4.9, reviewCount: 569 },
  "350454P2": { rating: 5.0, reviewCount: 449 },
  "134057P1": { rating: 5.0, reviewCount: 26 },
};

export const AUSTIN_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  AUSTIN_VIATOR_PUBLIC_RATINGS
);
