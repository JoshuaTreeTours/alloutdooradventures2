export type SingaporeViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Singapore d18 Engine6 products. */
export const SINGAPORE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  SingaporeViatorPublicRating
> = {
  "203208P12": { rating: 4.7, reviewCount: 461 },
  "30791P719": { rating: 4.9, reviewCount: 22 },
  "40856P7": { rating: 4.7, reviewCount: 567 },
  "223757P4": { rating: 5.0, reviewCount: 616 },
  "102132P3": { rating: 4.7, reviewCount: 55 },
  "24380P991": { rating: 4.5, reviewCount: 33 },
  "124015P1": { rating: 5.0, reviewCount: 54 },
  "45610P13": { rating: 4.9, reviewCount: 2113 },
  "5570MGK": { rating: 4.8, reviewCount: 140 },
  "277546P4": { rating: 4.9, reviewCount: 183 },
  "104357P24": { rating: 4.7, reviewCount: 30 },
  "57811P2": { rating: 4.9, reviewCount: 545 },
};

export const SINGAPORE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  SINGAPORE_VIATOR_PUBLIC_RATINGS
);
