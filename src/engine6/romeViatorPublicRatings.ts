export type RomeViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Rome d511 Engine6 products. */
export const ROME_VIATOR_PUBLIC_RATINGS: Record<
  string,
  RomeViatorPublicRating
> = {
  "75037P3": { rating: 5.0, reviewCount: 1615 },
  "391465P2": { rating: 4.9, reviewCount: 416 },
  "367403P1": { rating: 5.0, reviewCount: 62 },
  "7559P11": { rating: 4.9, reviewCount: 114 },
  "3731SSVAC": { rating: 4.5, reviewCount: 1131 },
  "133210P3": { rating: 5.0, reviewCount: 124 },
  "123593P20": { rating: 4.8, reviewCount: 17 },
  "7812P3": { rating: 4.9, reviewCount: 914 },
  "20163P100": { rating: 4.8, reviewCount: 35 },
  "6718P9": { rating: 4.9, reviewCount: 125 },
  "5284APPIAN": { rating: 4.9, reviewCount: 1597 },
  "85309P4": { rating: 4.8, reviewCount: 324 },
  "24338P3": { rating: 4.8, reviewCount: 808 },
  "3731VATICAN": { rating: 4.5, reviewCount: 33256 },
};

export const ROME_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  ROME_VIATOR_PUBLIC_RATINGS
);
