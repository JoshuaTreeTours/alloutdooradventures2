export type BuenosAiresViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Buenos Aires d901 Engine6 products. */
export const BUENOS_AIRES_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BuenosAiresViatorPublicRating
> = {
  "50158P1": { rating: 4.9, reviewCount: 94 },
  "5030REC": { rating: 4.5, reviewCount: 86 },
  "26466P5": { rating: 4.9, reviewCount: 54 },
  "14659P1": { rating: 4.6, reviewCount: 220 },
  "52462P4": { rating: 5.0, reviewCount: 103 },
};

export const BUENOS_AIRES_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BUENOS_AIRES_VIATOR_PUBLIC_RATINGS
);
