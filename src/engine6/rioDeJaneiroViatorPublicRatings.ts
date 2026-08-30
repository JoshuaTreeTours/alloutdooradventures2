export type RioDeJaneiroViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Rio de Janeiro d712 Engine6 products. */
export const RIO_DE_JANEIRO_VIATOR_PUBLIC_RATINGS: Record<
  string,
  RioDeJaneiroViatorPublicRating
> = {
  "20297P1": { rating: 5.0, reviewCount: 302 },
  "11557P1": { rating: 5.0, reviewCount: 343 },
  "38668P1": { rating: 4.9, reviewCount: 561 },
  "21513P8": { rating: 5.0, reviewCount: 61 },
  "21715P2": { rating: 4.7, reviewCount: 2644 },
  "8753P120": { rating: 4.7, reviewCount: 590 },
  "186670P1": { rating: 5.0, reviewCount: 1643 },
  "179234P2": { rating: 4.9, reviewCount: 49 },
  "305170P2": { rating: 4.7, reviewCount: 759 },
};

export const RIO_DE_JANEIRO_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  RIO_DE_JANEIRO_VIATOR_PUBLIC_RATINGS
);
