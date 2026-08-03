export type MauiViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Maui d671 Engine6 products. */
export const MAUI_VIATOR_PUBLIC_RATINGS: Record<
  string,
  MauiViatorPublicRating
> = {
  "5501HASKY": { rating: 4.9, reviewCount: 674 },
  "5069WEST60": { rating: 4.7, reviewCount: 75 },
  "5069COMP60": { rating: 4.7, reviewCount: 183 },
  "7029OGGHAN": { rating: 4.9, reviewCount: 209 },
  "5069DOM": { rating: 4.8, reviewCount: 409 },
  "7029OGGVOY": { rating: 4.8, reviewCount: 293 },
  "326167P1": { rating: 5, reviewCount: 872 },
  "320015P2": { rating: 5, reviewCount: 162 },
  "64708P2": { rating: 4.9, reviewCount: 488 },
  "200419P2": { rating: 5, reviewCount: 595 },
  "105668P1": { rating: 4.9, reviewCount: 220 },
  "104589P11": { rating: 4.7, reviewCount: 140 },
  "2360M5": { rating: 4.5, reviewCount: 209 },
  "62707P3": { rating: 4.9, reviewCount: 198 },
  "241329P1": { rating: 4.8, reviewCount: 637 },
  "2784P8": { rating: 4.6, reviewCount: 1033 },
  "3087MOLL": { rating: 4.7, reviewCount: 446 },
  "166701P1": { rating: 4.4, reviewCount: 197 },
  "124957P2": { rating: 4.5, reviewCount: 113 },
  "5069WEST45": { rating: 4.8, reviewCount: 721 },
};

export const MAUI_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  MAUI_VIATOR_PUBLIC_RATINGS
);
