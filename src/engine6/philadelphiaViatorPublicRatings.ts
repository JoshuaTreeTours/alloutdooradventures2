export type PhiladelphiaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Philadelphia d906 Engine6 products. */
export const PHILADELPHIA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  PhiladelphiaViatorPublicRating
> = {
  "8841P1": { rating: 5, reviewCount: 142 },
  "8841P6": { rating: 5, reviewCount: 98 },
  "8841P70": { rating: 4.8, reviewCount: 312 },
  "8841P10": { rating: 5, reviewCount: 67 },
  "102233P1": { rating: 5, reviewCount: 89 },
  "102233P3": { rating: 4.9, reviewCount: 156 },
  "255730P245": { rating: 5, reviewCount: 124 },
  "255730P256": { rating: 5, reviewCount: 43 },
  "86032P3": { rating: 4.9, reviewCount: 187 },
  "8841P73": { rating: 4.9, reviewCount: 76 },
  "153296P3": { rating: 5, reviewCount: 52 },
  "8841P82": { rating: 5, reviewCount: 38 },
  "86032P1": { rating: 4.8, reviewCount: 516 },
  "8841P34": { rating: 4.9, reviewCount: 936 },
  "5582660P3": { rating: 4.7, reviewCount: 46 },
  "6314PHILSEG": { rating: 4.8, reviewCount: 677 },
  "5042PHLSPI": { rating: 4, reviewCount: 380 },
  "5042P61": { rating: 4, reviewCount: 60 },
  "8841P27": { rating: 5, reviewCount: 309 },
  "25140P1": { rating: 4.9, reviewCount: 214 },
  "115692P1": { rating: 4.8, reviewCount: 423 },
  "52886P6": { rating: 4.9, reviewCount: 167 },
};

export const PHILADELPHIA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  PHILADELPHIA_VIATOR_PUBLIC_RATINGS
);
