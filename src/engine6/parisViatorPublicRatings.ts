export type ParisViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Paris d479 Engine6 products. */
export const PARIS_VIATOR_PUBLIC_RATINGS: Record<
  string,
  ParisViatorPublicRating
> = {
  "181888P1": { rating: 4.8, reviewCount: 36 },
  "126585P4": { rating: 4.7, reviewCount: 455 },
  "46878P5": { rating: 4.5, reviewCount: 166 },
  "6353P20": { rating: 5.0, reviewCount: 143 },
  "30791P192": { rating: 4.7, reviewCount: 258 },
  "24380P214": { rating: 4.6, reviewCount: 116 },
  "88461P3": { rating: 4.9, reviewCount: 465 },
  "393958P1": { rating: 4.9, reviewCount: 242 },
  "46018P3": { rating: 4.8, reviewCount: 1017 },
  "64296P1": { rating: 5.0, reviewCount: 830 },
  "46334P42": { rating: 4.9, reviewCount: 282 },
  "6353P9": { rating: 5.0, reviewCount: 741 },
  "3731LOUVRE": { rating: 4.5, reviewCount: 10369 },
  "67584P1": { rating: 4.6, reviewCount: 613 },
  "3588PARIS01": { rating: 4.7, reviewCount: 1033 },
  "3588PARIS03": { rating: 4.7, reviewCount: 788 },
  "3588VERSA": { rating: 4.8, reviewCount: 2142 },
  "47475P6": { rating: 4.8, reviewCount: 2240 },
  "46018P2": { rating: 4.7, reviewCount: 214 },
  "46334P22": { rating: 4.7, reviewCount: 855 },
};

export const PARIS_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  PARIS_VIATOR_PUBLIC_RATINGS
);
