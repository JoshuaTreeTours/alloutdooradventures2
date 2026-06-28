export type LakeTahoeViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Lake Tahoe d816 Engine6 products. */
export const LAKE_TAHOE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  LakeTahoeViatorPublicRating
> = {
  "2535P4": { rating: 4.5, reviewCount: 729 },
  "271742P1": { rating: 5.0, reviewCount: 933 },
  "6508TAHOE": { rating: 4.5, reviewCount: 160 },
  "383103P1": { rating: 4.5, reviewCount: 222 },
  "70777P4": { rating: 5.0, reviewCount: 183 },
  "466292P2": { rating: 5.0, reviewCount: 16 },
  "268564P2": { rating: 5.0, reviewCount: 332 },
  "235497P3": { rating: 5.0, reviewCount: 32 },
  "2535P14": { rating: 4.5, reviewCount: 43 },
};

export const LAKE_TAHOE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  LAKE_TAHOE_VIATOR_PUBLIC_RATINGS
);
