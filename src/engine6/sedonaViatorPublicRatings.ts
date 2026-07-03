export type SedonaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Sedona d750 Engine6 products. */
export const SEDONA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  SedonaViatorPublicRating
> = {
  "162351P6": { rating: 4.3, reviewCount: 955 },
  "321860P2": { rating: 4.6, reviewCount: 278 },
  "327849P2": { rating: 5, reviewCount: 111 },
  "327849P1": { rating: 5, reviewCount: 17 },
  "25265P29": { rating: 5, reviewCount: 64 },
  "189623P3": { rating: 4.7, reviewCount: 657 },
  "325517P1": { rating: 5, reviewCount: 206 },
  "109073P8": { rating: 5, reviewCount: 19 },
  "129182P3": { rating: 4.9, reviewCount: 29 },
  "129182P1": { rating: 5, reviewCount: 46 },
  "393812P1": { rating: 5, reviewCount: 11 },
  "338750P2": { rating: 5, reviewCount: 39 },
  "393812P3": { rating: 5, reviewCount: 12 },
  "129182P2": { rating: 5, reviewCount: 10 },
  "3925OBW": { rating: 4.7, reviewCount: 361 },
  "3925P1": { rating: 4.8, reviewCount: 137 },
  "25271P1": { rating: 4.5, reviewCount: 185 },
  "15880P21": { rating: 4.9, reviewCount: 296 },
  "15880P10": { rating: 4.9, reviewCount: 1462 },
  "32242P1": { rating: 5, reviewCount: 1845 },
  "291644P1": { rating: 4.9, reviewCount: 573 },
  "115255P2": { rating: 5, reviewCount: 2 },
};

export const SEDONA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  SEDONA_VIATOR_PUBLIC_RATINGS
);
