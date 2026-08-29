export type CuscoViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Cusco d50859 Engine6 products. */
export const CUSCO_VIATOR_PUBLIC_RATINGS: Record<
  string,
  CuscoViatorPublicRating
> = {
  "89089P57": { rating: 4.9, reviewCount: 1418 },
  "49313P1": { rating: 4.7, reviewCount: 702 },
  "120993P16": { rating: 4.9, reviewCount: 408 },
  "200691P13": { rating: 4.6, reviewCount: 247 },
  "173630P1": { rating: 4.6, reviewCount: 350 },
  "44685P2": { rating: 5.0, reviewCount: 74 },
  "101268P6": { rating: 5.0, reviewCount: 72 },
  "168853P1": { rating: 4.9, reviewCount: 315 },
  "19345P9": { rating: 4.9, reviewCount: 1108 },
  "19345P27": { rating: 4.8, reviewCount: 35 },
};

export const CUSCO_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CUSCO_VIATOR_PUBLIC_RATINGS
);
