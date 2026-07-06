export type OlympicViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Olympic National Park Engine6 products. */
export const OLYMPIC_VIATOR_PUBLIC_RATINGS: Record<
  string,
  OlympicViatorPublicRating
> = {
  "132218P140": { rating: 5, reviewCount: 819 },
  "132218P405": { rating: 5, reviewCount: 57 },
  "265766P14": { rating: 4.6, reviewCount: 11 },
  "265766P23": { rating: 5, reviewCount: 11 },
  "265766P73": { rating: 5, reviewCount: 26 },
  "318681P15": { rating: 5, reviewCount: 22 },
  "3657P1": { rating: 4.6, reviewCount: 372 },
  "383259P1": { rating: 5, reviewCount: 1 },
  "5412OLYM": { rating: 4.6, reviewCount: 1036 },
  "5412P36": { rating: 4.8, reviewCount: 7 },
  "5557524P1": { rating: 4.7, reviewCount: 84 },
  "88081P1": { rating: 4.6, reviewCount: 78 },
  "88081P2": { rating: 4.6, reviewCount: 37 },
  "88081P4": { rating: 4.6, reviewCount: 160 },
};

export const OLYMPIC_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  OLYMPIC_VIATOR_PUBLIC_RATINGS
);
