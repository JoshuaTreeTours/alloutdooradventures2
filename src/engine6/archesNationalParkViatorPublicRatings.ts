export type ArchesNationalParkViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Arches National Park d5600 Engine6 products. */
export const ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS: Record<
  string,
  ArchesNationalParkViatorPublicRating
> = {
  "108923P4": { rating: 5.0, reviewCount: 8 },
  "18497P17": { rating: 5.0, reviewCount: 4 },
  "18497P4": { rating: 5.0, reviewCount: 12 },
  "265766P8": { rating: 5.0, reviewCount: 45 },
  "334588P2": { rating: 5.0, reviewCount: 54 },
  "24134P2": { rating: 4.9, reviewCount: 610 },
  "6896P1": { rating: 4.9, reviewCount: 208 },
  "148657P5": { rating: 4.9, reviewCount: 19 },
  "18497P9": { rating: 5.0, reviewCount: 9 },
  "14649P16": { rating: 5.0, reviewCount: 11 },
  "14649P18": { rating: 5.0, reviewCount: 40 },
  "265766P26": { rating: 4.8, reviewCount: 11 },
  "24134P13": { rating: 4.9, reviewCount: 15 },
  "18497P1": { rating: 5.0, reviewCount: 92 },
  "24134P16": { rating: 5.0, reviewCount: 7 },
};

export const ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS
);
