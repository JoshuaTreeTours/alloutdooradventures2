export type MoabViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Moab d5600 Engine6 products. */
export const MOAB_VIATOR_PUBLIC_RATINGS: Record<
  string,
  MoabViatorPublicRating
> = {
  "5555934P1": { rating: 5, reviewCount: 1544 },
  "7016P4": { rating: 5, reviewCount: 695 },
  "7016OFFROAD": { rating: 5, reviewCount: 3312 },
  "22803P18": { rating: 5, reviewCount: 738 },
  "132679P2": { rating: 5, reviewCount: 105 },
  "5555934P2": { rating: 5, reviewCount: 211 },
  "22803P33": { rating: 5, reviewCount: 74 },
  "6896MOABCPARK": { rating: 5, reviewCount: 1115 },
  "349715P2": { rating: 5, reviewCount: 282 },
  "458439P2": { rating: 5, reviewCount: 90 },
  "334588P4": { rating: 4.5, reviewCount: 118 },
  "132679P1": { rating: 5, reviewCount: 395 },
  "6896MOABAPARK": { rating: 5, reviewCount: 2043 },
  "349715P3": { rating: 5, reviewCount: 230 },
  "349715P1": { rating: 5, reviewCount: 157 },
  "18497P15": { rating: 5, reviewCount: 353 },
  "16649P13": { rating: 5, reviewCount: 39 },
  "131994P3": { rating: 5, reviewCount: 974 },
  "334588P3": { rating: 5, reviewCount: 69 },
  "252408P1": { rating: 5, reviewCount: 858 },
  "349715P4": { rating: 5, reviewCount: 59 },
  "16847P11": { rating: 5, reviewCount: 15 },
  "260792P5": { rating: 5, reviewCount: 1391 },
  "165224P7": { rating: 5, reviewCount: 12 },
  "169760P14": { rating: 5, reviewCount: 35 },
  "265766P59": { rating: 5, reviewCount: 9 },
};

export const MOAB_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  MOAB_VIATOR_PUBLIC_RATINGS
);
