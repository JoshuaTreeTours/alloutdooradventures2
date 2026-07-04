export type BostonViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Boston d678 Engine6 products. */
export const BOSTON_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BostonViatorPublicRating
> = {
  "3283BWW": { rating: 4.5, reviewCount: 2827 },
  "3283SSCRUISE": { rating: 4.5, reviewCount: 1138 },
  "44921P7": { rating: 4.2, reviewCount: 474 },
  "3037DUCK": { rating: 4.6, reviewCount: 9103 },
  "66111P3": { rating: 4.9, reviewCount: 4634 },
  "26797P4": { rating: 4.6, reviewCount: 2145 },
  "8843P7": { rating: 4.8, reviewCount: 1876 },
  "7167P68": { rating: 4.8, reviewCount: 1243 },
  "5046BOS_OTT": { rating: 4.3, reviewCount: 5113 },
  "7812P131": { rating: 5, reviewCount: 52 },
  "8841P14": { rating: 4.9, reviewCount: 892 },
  "400049P3": { rating: 5, reviewCount: 41 },
  "8647P466": { rating: 5, reviewCount: 118 },
  "400049P5": { rating: 5, reviewCount: 67 },
  "385595P5": { rating: 4.8, reviewCount: 934 },
  "5046BOS_GG": { rating: 4.5, reviewCount: 2524 },
  "3283CODZILLA": { rating: 4, reviewCount: 425 },
  "3978TOUR5": { rating: 4, reviewCount: 278 },
  "5042BOSDIN": { rating: 3.5, reviewCount: 181 },
  "5151BOSCY014": { rating: 5, reviewCount: 645 },
  "66192P8": { rating: 4.5, reviewCount: 81 },
  "255730P225": { rating: 5, reviewCount: 4 },
};

export const BOSTON_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BOSTON_VIATOR_PUBLIC_RATINGS
);
