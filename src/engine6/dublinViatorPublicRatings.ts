export type DublinViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Dublin d503 Engine6 products. */
export const DUBLIN_VIATOR_PUBLIC_RATINGS: Record<
  string,
  DublinViatorPublicRating
> = {
  "103208P1": { rating: 4.9, reviewCount: 152 },
  "229063P1": { rating: 5.0, reviewCount: 560 },
  "7812P20": { rating: 4.9, reviewCount: 1275 },
  "26444P13": { rating: 4.9, reviewCount: 32 },
  "8954P33": { rating: 4.7, reviewCount: 27 },
  "37082P4": { rating: 5.0, reviewCount: 439 },
  "37082P5": { rating: 5.0, reviewCount: 225 },
  "24779P1": { rating: 4.7, reviewCount: 717 },
  "24779P2": { rating: 4.6, reviewCount: 263 },
  "5299P16": { rating: 4.5, reviewCount: 91 },
  "33832P1": { rating: 4.9, reviewCount: 3620 },
  "8962P3": { rating: 4.6, reviewCount: 1081 },
  "5299MOHER": { rating: 4.6, reviewCount: 2417 },
  "8962P4": { rating: 4.5, reviewCount: 805 },
  "5300TITANIC": { rating: 4.9, reviewCount: 3232 },
};

export const DUBLIN_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  DUBLIN_VIATOR_PUBLIC_RATINGS
);
