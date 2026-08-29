export type CaboSanLucasViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Cabo San Lucas d50859 Engine6 products. */
export const CABO_SAN_LUCAS_VIATOR_PUBLIC_RATINGS: Record<
  string,
  CaboSanLucasViatorPublicRating
> = {
  "3714LUXSUNSET": { rating: 4.8, reviewCount: 1827 },
  "3714P32": { rating: 4.9, reviewCount: 1753 },
  "18372P1": { rating: 4.9, reviewCount: 924 },
  "8056P2": { rating: 4.9, reviewCount: 709 },
  "3714P39": { rating: 4.8, reviewCount: 703 },
  "220975P1": { rating: 4.8, reviewCount: 548 },
  "7054P7": { rating: 5.0, reviewCount: 519 },
  "13221P9": { rating: 4.7, reviewCount: 499 },
  "177104P1": { rating: 4.6, reviewCount: 406 },
  "303247P1": { rating: 4.7, reviewCount: 237 },
  "34186P2": { rating: 4.7, reviewCount: 191 },
  "16451P2": { rating: 4.8, reviewCount: 87 },
  "190377P1": { rating: 5.0, reviewCount: 81 },
  "30877P4": { rating: 4.6, reviewCount: 117 },
};

export const CABO_SAN_LUCAS_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CABO_SAN_LUCAS_VIATOR_PUBLIC_RATINGS
);
