export type ZionViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Zion d5610 Engine6 products. */
export const ZION_VIATOR_PUBLIC_RATINGS: Record<string, ZionViatorPublicRating> =
  {
    "199627P12": { rating: 5.0, reviewCount: 78 },
    "199627P1": { rating: 5.0, reviewCount: 125 },
    "422797P4": { rating: 5.0, reviewCount: 6 },
    "118887P10": { rating: 5.0, reviewCount: 54 },
    "118744P3": { rating: 4.9, reviewCount: 215 },
    "265766P10": { rating: 5.0, reviewCount: 35 },
    "265766P27": { rating: 4.9, reviewCount: 77 },
    "286874P2": { rating: 5.0, reviewCount: 28 },
    "300061P2": { rating: 4.9, reviewCount: 95 },
    "163873P9": { rating: 4.9, reviewCount: 887 },
    "163873P18": { rating: 4.9, reviewCount: 261 },
    "118887P1": { rating: 5.0, reviewCount: 1179 },
    "118887P5": { rating: 5.0, reviewCount: 352 },
    "118887P2": { rating: 5.0, reviewCount: 258 },
    "275087P2": { rating: 5.0, reviewCount: 106 },
    "163873P1": { rating: 4.9, reviewCount: 420 },
  };

export const ZION_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  ZION_VIATOR_PUBLIC_RATINGS
);
