export type KonaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Kona d669 Engine6 products. */
export const KONA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  KonaViatorPublicRating
> = {
  "28456P13": { rating: 4.9, reviewCount: 16 },
  "110657P1": { rating: 5.0, reviewCount: 9 },
  "190952P1": { rating: 4.9, reviewCount: 28 },
  "190952P2": { rating: 4.8, reviewCount: 17 },
  "287816P1": { rating: 4.9, reviewCount: 30 },
  "2804MKS": { rating: 4.8, reviewCount: 1378 },
  "8945P14": { rating: 4.8, reviewCount: 239 },
  "88002P3": { rating: 4.7, reviewCount: 1046 },
  "358276P1": { rating: 4.8, reviewCount: 347 },
  "26811P1": { rating: 4.9, reviewCount: 988 },
  "26811P4": { rating: 4.5, reviewCount: 172 },
  "2804PINZHH": { rating: 4.9, reviewCount: 96 },
  "5527LUAU": { rating: 4.1, reviewCount: 771 },
  "418633P1": { rating: 4.8, reviewCount: 226 },
  "207802P1": { rating: 5.0, reviewCount: 392 },
};

export const KONA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  KONA_VIATOR_PUBLIC_RATINGS
);
