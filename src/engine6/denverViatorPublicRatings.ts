export type DenverViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Denver d4837 Engine6 products. */
export const DENVER_VIATOR_PUBLIC_RATINGS: Record<
  string,
  DenverViatorPublicRating
> = {
  "41410P10": { rating: 4.9, reviewCount: 3265 },
  "8950P6": { rating: 4.9, reviewCount: 3484 },
  "72188P15": { rating: 4.9, reviewCount: 205 },
  "41410P15": { rating: 4.9, reviewCount: 711 },
  "41410P14": { rating: 4.7, reviewCount: 56 },
  "8950P37": { rating: 4.9, reviewCount: 188 },
  "59646P2": { rating: 4.9, reviewCount: 387 },
  "8950P29": { rating: 4.9, reviewCount: 109 },
  "8950P9": { rating: 4.8, reviewCount: 1460 },
  "59646P5": { rating: 4.9, reviewCount: 744 },
  "323041P1": { rating: 4.9, reviewCount: 318 },
  "128737P1": { rating: 4.9, reviewCount: 131 },
  "128737P2": { rating: 5.0, reviewCount: 24 },
  "41410P1": { rating: 4.9, reviewCount: 518 },
  "72188P1": { rating: 4.8, reviewCount: 86 },
  "59646P3": { rating: 4.8, reviewCount: 106 },
};

export const DENVER_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  DENVER_VIATOR_PUBLIC_RATINGS
);
