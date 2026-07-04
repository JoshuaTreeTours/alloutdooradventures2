export type JacksonHoleViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Jackson Hole d51006/d5261 Engine6 products. */
export const JACKSON_HOLE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  JacksonHoleViatorPublicRating
> = {
  "6029YOFWILD": { rating: 5, reviewCount: 1617 },
  "6029WILDSAF": { rating: 4.9, reviewCount: 1267 },
  "15073P5": { rating: 4.8, reviewCount: 1201 },
  "156172P2": { rating: 4.9, reviewCount: 1154 },
  "156172P1": { rating: 4.9, reviewCount: 959 },
  "6252SCENIC": { rating: 4.8, reviewCount: 1045 },
  "38400P2": { rating: 4.6, reviewCount: 1024 },
  "6252P5": { rating: 4.9, reviewCount: 977 },
  "15073P1": { rating: 4.9, reviewCount: 970 },
  "15073P6": { rating: 4.9, reviewCount: 740 },
  "320113P1": { rating: 4.9, reviewCount: 590 },
  "15739P3": { rating: 4.9, reviewCount: 387 },
  "56481P3": { rating: 5, reviewCount: 279 },
  "35441P2": { rating: 4.7, reviewCount: 250 },
  "35441P1": { rating: 4.9, reviewCount: 509 },
  "460738P6": { rating: 4.9, reviewCount: 61 },
  "342881P1": { rating: 4.9, reviewCount: 100 },
  "38400P8": { rating: 4.2, reviewCount: 31 },
  "6029WINTER": { rating: 5, reviewCount: 322 },
  "156172P5": { rating: 5, reviewCount: 75 },
};

export const JACKSON_HOLE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  JACKSON_HOLE_VIATOR_PUBLIC_RATINGS
);
