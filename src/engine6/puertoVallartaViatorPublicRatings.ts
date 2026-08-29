export type PuertoVallartaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Puerto Vallarta d630 Engine6 products. */
export const PUERTO_VALLARTA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  PuertoVallartaViatorPublicRating
> = {
  "2736P31": { rating: 4.8, reviewCount: 201 },
  "22116P7": { rating: 4.9, reviewCount: 793 },
  "7053ZIP": { rating: 4.9, reviewCount: 3172 },
  "24191P1": { rating: 4.8, reviewCount: 2199 },
  "118966P4": { rating: 4.7, reviewCount: 847 },
  "46209P3": { rating: 5.0, reviewCount: 282 },
  "218207P4": { rating: 4.8, reviewCount: 127 },
  "428665P1": { rating: 4.8, reviewCount: 147 },
  "368259P2": { rating: 4.9, reviewCount: 79 },
  "46209P5": { rating: 5.0, reviewCount: 112 },
};

export const PUERTO_VALLARTA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  PUERTO_VALLARTA_VIATOR_PUBLIC_RATINGS
);
