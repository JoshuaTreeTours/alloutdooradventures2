export type YosemiteViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Yosemite d5265 Engine6 products. */
export const YOSEMITE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  YosemiteViatorPublicRating
> = {
  "391021P1": { rating: 4.9, reviewCount: 415 },
  "18808P14": { rating: 4.8, reviewCount: 70 },
  "6004HIKE": { rating: 4.7, reviewCount: 77 },
  "7011P8": { rating: 5.0, reviewCount: 81 },
  "6004P8": { rating: 4.9, reviewCount: 33 },
  "6004PRHIKE": { rating: 4.8, reviewCount: 83 },
  "69029P14": { rating: 4.7, reviewCount: 56 },
  "18808P20": { rating: 4.9, reviewCount: 123 },
  "18808P17": { rating: 4.8, reviewCount: 56 },
  "18808P15": { rating: 4.5, reviewCount: 29 },
  "69029P8": { rating: 5.0, reviewCount: 28 },
  "7011P11": { rating: 5.0, reviewCount: 64 },
  "19970P1": { rating: 4.7, reviewCount: 21 },
  "460648P15": { rating: 4.7, reviewCount: 3 },
  "5582835P5": { rating: 5.0, reviewCount: 1 },
  "449449P2": { rating: 4.7, reviewCount: 19 },
};

export const YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  YOSEMITE_VIATOR_PUBLIC_RATINGS
);
