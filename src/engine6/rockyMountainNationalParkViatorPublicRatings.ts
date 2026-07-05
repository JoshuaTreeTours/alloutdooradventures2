export type RockyMountainNationalParkViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Rocky Mountain National Park Engine6 products. */
export const ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS: Record<
  string,
  RockyMountainNationalParkViatorPublicRating
> = {
  "366391P1": { rating: 5, reviewCount: 85 },
  "366391P5": { rating: 5, reviewCount: 34 },
  "366391P3": { rating: 5, reviewCount: 26 },
  "366391P2": { rating: 4.9, reviewCount: 14 },
  "449630P3": { rating: 4, reviewCount: 4 },
  "449630P1": { rating: 5, reviewCount: 1 },
  "337166P4": { rating: 5, reviewCount: 7 },
  "148657P6": { rating: 5, reviewCount: 6 },
  "424860P1": { rating: 5, reviewCount: 463 },
  "450284P2": { rating: 5, reviewCount: 345 },
  "5663796P1": { rating: 5, reviewCount: 1 },
  "264314P1": { rating: 4.9, reviewCount: 388 },
  "242506P3": { rating: 5, reviewCount: 26 },
  "337022P1": { rating: 5, reviewCount: 64 },
  "264314P3": { rating: 4.9, reviewCount: 32 },
  "450284P5": { rating: 5, reviewCount: 143 },
  "299786P1": { rating: 4.9, reviewCount: 106 },
  "450284P3": { rating: 4.9, reviewCount: 43 },
  "477432P1": { rating: 5, reviewCount: 462 },
  "337022P3": { rating: 5, reviewCount: 97 },
  "242506P2": { rating: 5, reviewCount: 165 },
  "242506P1": { rating: 5, reviewCount: 143 },
  "265766P15": { rating: 5, reviewCount: 8 },
  "148657P3": { rating: 5, reviewCount: 1 },
  "264314P7": { rating: 4.8, reviewCount: 128 },
};

export const ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES =
  Object.keys(ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS);
