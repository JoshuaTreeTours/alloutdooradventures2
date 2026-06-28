export type NapaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Napa d914 Engine6 products. */
export const NAPA_VIATOR_PUBLIC_RATINGS: Record<string, NapaViatorPublicRating> =
  {
    "6938NAPATRLY": { rating: 4.5, reviewCount: 762 },
    "6285P4": { rating: 5.0, reviewCount: 1038 },
    "339737P1": { rating: 5.0, reviewCount: 272 },
    "148923P3": { rating: 4.9, reviewCount: 177 },
    "17140_DWT": { rating: 4.4, reviewCount: 465 },
    "6938CASTLE": { rating: 4.3, reviewCount: 244 },
    "41114P2": { rating: 4.7, reviewCount: 71 },
    "38386P1": { rating: 4.9, reviewCount: 80 },
    "175643P1": { rating: 4.9, reviewCount: 136 },
    "396101P2": { rating: 4.9, reviewCount: 39 },
    "212180P2": { rating: 5.0, reviewCount: 62 },
    "87617P1": { rating: 5.0, reviewCount: 174 },
  };

export const NAPA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  NAPA_VIATOR_PUBLIC_RATINGS
);
