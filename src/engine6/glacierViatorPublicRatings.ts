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
  "86727P4": { rating: 4.9, reviewCount: 193 },
  "70248P2": { rating: 4.9, reviewCount: 578 },
  "299521P2": { rating: 5.0, reviewCount: 18 },
  "299521P8": { rating: 5.0, reviewCount: 34 },
  "132253P8": { rating: 4.9, reviewCount: 106 },
  "86727P7": { rating: 5.0, reviewCount: 47 },
  "132253P12": { rating: 5.0, reviewCount: 2 },
  "487722P4": { rating: 5.0, reviewCount: 2 },
  "132253P7": { rating: 4.9, reviewCount: 52 },
};

export const GLACIER_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  GLACIER_VIATOR_PUBLIC_RATINGS
);
