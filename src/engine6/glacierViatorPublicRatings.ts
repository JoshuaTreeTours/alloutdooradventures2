export type GlacierViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Glacier d50559 Engine6 products. */
export const GLACIER_VIATOR_PUBLIC_RATINGS: Record<
  string,
  GlacierViatorPublicRating
> = {
  "123783P1": { rating: 4.9, reviewCount: 389 },
  "70248P3": { rating: 4.9, reviewCount: 285 },
  "70248P2": { rating: 4.9, reviewCount: 578 },
  "299521P2": { rating: 5.0, reviewCount: 18 },
  "299521P8": { rating: 5.0, reviewCount: 34 },
  "299521P1": { rating: 4.7, reviewCount: 12 },
  "86727P7": { rating: 5.0, reviewCount: 47 },
  "487722P1": { rating: 4.9, reviewCount: 29 },
  "487722P4": { rating: 5.0, reviewCount: 2 },
  "102020P125": { rating: 3.0, reviewCount: 12 },
};

export const GLACIER_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  GLACIER_VIATOR_PUBLIC_RATINGS
);
