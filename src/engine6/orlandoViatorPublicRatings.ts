export type OrlandoViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Orlando d663 Engine6 products. */
export const ORLANDO_VIATOR_PUBLIC_RATINGS: Record<
  string,
  OrlandoViatorPublicRating
> = {
  "3170P78": { rating: 5, reviewCount: 235 },
  "331790P2": { rating: 5, reviewCount: 1 },
  "42054P2": { rating: 5, reviewCount: 170 },
  "3170P51": { rating: 5, reviewCount: 73 },
  "42054P4": { rating: 5, reviewCount: 22 },
  "3170P40": { rating: 5, reviewCount: 262 },
  "123164P1": { rating: 5, reviewCount: 2542 },
  "120040P3": { rating: 5, reviewCount: 349 },
  "317042": { rating: 5, reviewCount: 252 },
  "3170P41": { rating: 4.7, reviewCount: 153 },
  "42054P5": { rating: 5, reviewCount: 178 },
  "3170P32": { rating: 5, reviewCount: 1424 },
  "42627P1": { rating: 5, reviewCount: 1347 },
  "5580079P3": { rating: 5, reviewCount: 74 },
  "109065P4": { rating: 5, reviewCount: 602 },
  "105290P7": { rating: 5, reviewCount: 394 },
  "58194P1": { rating: 5, reviewCount: 137 },
  "39750P18": { rating: 5, reviewCount: 112 },
  "37177P6": { rating: 5, reviewCount: 367 },
  "5039P5": { rating: 5, reviewCount: 888 },
  "53748P4": { rating: 5, reviewCount: 852 },
  "357987P1": { rating: 5, reviewCount: 193 },
};

export const ORLANDO_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  ORLANDO_VIATOR_PUBLIC_RATINGS
);
