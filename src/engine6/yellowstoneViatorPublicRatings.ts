export type YellowstoneViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Yellowstone d22411 Engine6 products. */
export const YELLOWSTONE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  YellowstoneViatorPublicRating
> = {
  "52661P40": { rating: 4.1, reviewCount: 8 },
  "151830P1": { rating: 5.0, reviewCount: 842 },
  "151830P3": { rating: 5.0, reviewCount: 100 },
  "151830P8": { rating: 5.0, reviewCount: 23 },
  "316119P3": { rating: 5.0, reviewCount: 10 },
  "5591554P17": { rating: 5.0, reviewCount: 3 },
  "5591554P23": { rating: 5.0, reviewCount: 14 },
  "137381P3": { rating: 5.0, reviewCount: 103 },
  "481298P1": { rating: 5.0, reviewCount: 89 },
  "265766P66": { rating: 5.0, reviewCount: 4 },
  "463268P1": { rating: 5.0, reviewCount: 8 },
  "52661P26": { rating: 4.5, reviewCount: 23 },
  "5584219P8": { rating: 5.0, reviewCount: 1 },
  "23667P10": { rating: 4.8, reviewCount: 177 },
  "23667P2": { rating: 4.7, reviewCount: 183 },
  "23667P3": { rating: 4.9, reviewCount: 412 },
  "316119P4": { rating: 4.9, reviewCount: 527 },
  "23667P4": { rating: 4.9, reviewCount: 87 },
  "23667P1": { rating: 4.8, reviewCount: 382 },
  "463268P2": { rating: 5.0, reviewCount: 16 },
};

export const YELLOWSTONE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  YELLOWSTONE_VIATOR_PUBLIC_RATINGS
);
