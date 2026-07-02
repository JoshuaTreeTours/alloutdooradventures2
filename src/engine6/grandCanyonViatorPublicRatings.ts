export type GrandCanyonViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Grand Canyon d815 Engine6 products. */
export const GRAND_CANYON_VIATOR_PUBLIC_RATINGS: Record<
  string,
  GrandCanyonViatorPublicRating
> = {
  "5662346P1": { rating: 5.0, reviewCount: 3 },
  "5637206P8": { rating: 4.8, reviewCount: 6 },
  "5637206P7": { rating: 4.7, reviewCount: 4 },
  "109090P3": { rating: 5.0, reviewCount: 7 },
  "5167SD": { rating: 4.6, reviewCount: 50 },
  "6338P18": { rating: 4.6, reviewCount: 12 },
  "265766P28": { rating: 5.0, reviewCount: 14 },
  "5637206P4": { rating: 4.6, reviewCount: 5 },
  "318692P1": { rating: 5.0, reviewCount: 244 },
  "318692P2": { rating: 5.0, reviewCount: 76 },
  "18678CS": { rating: 4.8, reviewCount: 2018 },
  "6613P24": { rating: 4.6, reviewCount: 331 },
  "89776P1": { rating: 4.8, reviewCount: 1773 },
  "229754P2": { rating: 4.9, reviewCount: 972 },
  "5488718P3": { rating: 4.9, reviewCount: 242 },
  "7886P3": { rating: 5.0, reviewCount: 177 },
  "3272GCER": { rating: 4.6, reviewCount: 298 },
  "25576P9": { rating: 4.1, reviewCount: 14 },
  "6338DISCOVERY": { rating: 4.6, reviewCount: 373 },
  "229754P1": { rating: 4.9, reviewCount: 446 },
  "3272GCSR2": { rating: 4.6, reviewCount: 237 },
};

export const GRAND_CANYON_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  GRAND_CANYON_VIATOR_PUBLIC_RATINGS
);
