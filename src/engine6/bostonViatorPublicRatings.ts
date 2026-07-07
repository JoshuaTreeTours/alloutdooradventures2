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
  "70284P1": { rating: 5, reviewCount: 204 },
  "5046BOS_OTT": { rating: 4.3, reviewCount: 5113 },
  "7812P131": { rating: 5, reviewCount: 52 },
  "7812P18": { rating: 4.9, reviewCount: 1200 },
  "400049P3": { rating: 5, reviewCount: 41 },
  "343490P3": { rating: 4.9, reviewCount: 86 },
  "400049P5": { rating: 5, reviewCount: 67 },
  "3978TOUR2": { rating: 4.7, reviewCount: 612 },
  "3283CODZILLA": { rating: 4, reviewCount: 425 },
  "5042BOSDIN": { rating: 3.5, reviewCount: 181 },
  "5151BOSCY014": { rating: 5, reviewCount: 645 },
  "255730P225": { rating: 5, reviewCount: 4 },
};

export const BOSTON_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BOSTON_VIATOR_PUBLIC_RATINGS
);
