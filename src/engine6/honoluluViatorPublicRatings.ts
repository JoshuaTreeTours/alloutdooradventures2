export type HonoluluViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Honolulu d59070 Engine6 products. */
export const HONOLULU_VIATOR_PUBLIC_RATINGS: Record<
  string,
  HonoluluViatorPublicRating
> = {
  "28456P8": { rating: 5, reviewCount: 4 },
  "12446P4": { rating: 5, reviewCount: 91 },
  "70444P6": { rating: 4.7, reviewCount: 258 },
  "28456P1": { rating: 4.8, reviewCount: 790 },
  "117916P9": { rating: 4.7, reviewCount: 525 },
  "179218P23": { rating: 4.8, reviewCount: 1014 },
  "368856P1": { rating: 4.8, reviewCount: 81 },
  "6981P1": { rating: 4.6, reviewCount: 501 },
  "189546P8": { rating: 5, reviewCount: 8 },
  "12446SNORKEL": { rating: 5, reviewCount: 5258 },
  "452226P3": { rating: 4.5, reviewCount: 163 },
  "23607": { rating: 4.5, reviewCount: 2185 },
  "390101P5": { rating: 4.5, reviewCount: 142 },
  "64146P1": { rating: 4, reviewCount: 1446 },
  "33188P2": { rating: 4, reviewCount: 763 },
  "166842P1": { rating: 5, reviewCount: 1792 },
  "375182P1": { rating: 4.8, reviewCount: 10370 },
  "469693P1": { rating: 5, reviewCount: 658 },
  "3961P32": { rating: 4.5, reviewCount: 1655 },
  "5563928P2": { rating: 5, reviewCount: 88 },
};

export const HONOLULU_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  HONOLULU_VIATOR_PUBLIC_RATINGS
);
