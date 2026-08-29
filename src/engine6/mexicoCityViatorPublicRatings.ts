export type MexicoCityViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Mexico City d628 Engine6 products. */
export const MEXICO_CITY_VIATOR_PUBLIC_RATINGS: Record<
  string,
  MexicoCityViatorPublicRating
> = {
  "333644P5": { rating: 4.8, reviewCount: 101 },
  "247495P2": { rating: 4.9, reviewCount: 4430 },
  "33804P2": { rating: 4.8, reviewCount: 326 },
  "161745P6": { rating: 4.7, reviewCount: 99 },
  "325968P1": { rating: 4.8, reviewCount: 971 },
  "33804P1": { rating: 4.9, reviewCount: 862 },
  "88859P7": { rating: 4.6, reviewCount: 116 },
  "325968P5": { rating: 4.9, reviewCount: 55 },
  "466992P2": { rating: 4.9, reviewCount: 18 },
  "382677P1": { rating: 4.9, reviewCount: 45 },
  "38551P1": { rating: 4.9, reviewCount: 80 },
};

export const MEXICO_CITY_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  MEXICO_CITY_VIATOR_PUBLIC_RATINGS
);
