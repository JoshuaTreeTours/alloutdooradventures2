export type EdinburghViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Edinburgh d739 Engine6 products. */
export const EDINBURGH_VIATOR_PUBLIC_RATINGS: Record<
  string,
  EdinburghViatorPublicRating
> = {
  "128492P2": { rating: 5.0, reviewCount: 42 },
  "401019P1": { rating: 5.0, reviewCount: 109 },
  "8616P6": { rating: 5.0, reviewCount: 98 },
  "8616P5": { rating: 5.0, reviewCount: 47 },
  "108034P1": { rating: 5.0, reviewCount: 54 },
  "68313P45": { rating: 4.9, reviewCount: 25 },
  "130291P9": { rating: 5.0, reviewCount: 19 },
  "225008": { rating: 4.8, reviewCount: 610 },
  "5256HLOCHNESS": { rating: 4.6, reviewCount: 2435 },
  "7812P14": { rating: 4.9, reviewCount: 855 },
  "109681P1": { rating: 5.0, reviewCount: 397 },
  "293401SECRETS": { rating: 4.8, reviewCount: 1174 },
  "225004": { rating: 4.7, reviewCount: 1643 },
  "5211P20": { rating: 4.9, reviewCount: 1174 },
  "6898P9": { rating: 4.7, reviewCount: 502 },
  "5211WHISKY": { rating: 4.8, reviewCount: 219 },
  "72560P6": { rating: 4.8, reviewCount: 465 },
  "6898P18": { rating: 4.7, reviewCount: 354 },
};

export const EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  EDINBURGH_VIATOR_PUBLIC_RATINGS
);
