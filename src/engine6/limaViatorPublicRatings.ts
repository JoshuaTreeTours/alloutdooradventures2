export type LimaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Lima d928 Engine6 products. */
export const LIMA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  LimaViatorPublicRating
> = {
  "20336P1": { rating: 4.9, reviewCount: 75 },
  "155286P1": { rating: 4.9, reviewCount: 98 },
  "148831P28": { rating: 4.9, reviewCount: 126 },
  "85155P2": { rating: 4.9, reviewCount: 187 },
  "89775P1": { rating: 4.9, reviewCount: 54 },
  "226342P3": { rating: 4.8, reviewCount: 177 },
  "141439P1": { rating: 4.6, reviewCount: 93 },
  "17020P17": { rating: 5.0, reviewCount: 40 },
  "5207LIMBIKE": { rating: 4.8, reviewCount: 84 },
};

export const LIMA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  LIMA_VIATOR_PUBLIC_RATINGS
);
