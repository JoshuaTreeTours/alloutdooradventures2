export type HawaiiVolcanoesViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Hawaii Volcanoes National Park Engine6 products. */
export const HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS: Record<
  string,
  HawaiiVolcanoesViatorPublicRating
> = {
  "6651BIOD": { rating: 4.9, reviewCount: 5820 },
  "22796P3": { rating: 4.7, reviewCount: 1749 },
  "270152P1": { rating: 4.8, reviewCount: 1757 },
  "6651P4": { rating: 4.9, reviewCount: 1402 },
  "7443P9": { rating: 4.9, reviewCount: 1004 },
  "7443P1": { rating: 4.9, reviewCount: 599 },
  "248255P3": { rating: 4.6, reviewCount: 479 },
  "224778P1": { rating: 4.9, reviewCount: 297 },
  "28886P3": { rating: 4.9, reviewCount: 216 },
  "8944P16": { rating: 5, reviewCount: 153 },
  "3388P1": { rating: 4.4, reviewCount: 115 },
  "190952P3": { rating: 4.8, reviewCount: 90 },
  "110657P2": { rating: 5, reviewCount: 77 },
  "8944P1": { rating: 4.9, reviewCount: 33 },
};

export const HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS
);
