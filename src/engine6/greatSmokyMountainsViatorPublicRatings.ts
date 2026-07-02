export type GreatSmokyMountainsViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Great Smoky Mountains d24149/d24151 Engine6 products. */
export const GREAT_SMOKY_MOUNTAINS_VIATOR_PUBLIC_RATINGS: Record<
  string,
  GreatSmokyMountainsViatorPublicRating
> = {
  "26480P10": { rating: 4.9, reviewCount: 130 },
  "26480P2": { rating: 5.0, reviewCount: 37 },
  "26480P11": { rating: 5.0, reviewCount: 8 },
  "26480P6": { rating: 4.9, reviewCount: 11 },
  "335817P3": { rating: 4.9, reviewCount: 171 },
  "335817P10": { rating: 4.9, reviewCount: 12 },
  "26480P8": { rating: 4.5, reviewCount: 11 },
  "26480P14": { rating: 5.0, reviewCount: 3 },
};

export const GREAT_SMOKY_MOUNTAINS_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  GREAT_SMOKY_MOUNTAINS_VIATOR_PUBLIC_RATINGS
);
