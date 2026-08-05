export type CanyonlandsNationalParkViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Canyonlands National Park d5600 Engine6 products. */
export const CANYONLANDS_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS: Record<
  string,
  CanyonlandsNationalParkViatorPublicRating
> = {
  "24134P3": { rating: 4.9, reviewCount: 423 },
  "6896MOABCHPARK": { rating: 4.9, reviewCount: 287 },
  "6896MOABWRIM": { rating: 4.9, reviewCount: 210 },
  "14649P15": { rating: 5.0, reviewCount: 14 },
  "265766P60": { rating: 5.0, reviewCount: 2 },
  "14649P17": { rating: 5.0, reviewCount: 1 },
  "18497P14": { rating: 4.9, reviewCount: 18 },
  "148657P1": { rating: 5.0, reviewCount: 8 },
};

export const CANYONLANDS_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CANYONLANDS_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS
);
