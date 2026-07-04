export type ChicagoViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Chicago d673 Engine6 products. */
export const CHICAGO_VIATOR_PUBLIC_RATINGS: Record<
  string,
  ChicagoViatorPublicRating
> = {
  "5580ARC": { rating: 4.5, reviewCount: 12881 },
  "76126P2": { rating: 4.7, reviewCount: 3245 },
  "76126P8": { rating: 4.5, reviewCount: 1215 },
  "5580SKY": { rating: 4.5, reviewCount: 2187 },
  "35169P12": { rating: 4.8, reviewCount: 842 },
  "5680NIGHT": { rating: 4.9, reviewCount: 412 },
  "5680DAY": { rating: 4.9, reviewCount: 638 },
  "61552P17": { rating: 4.8, reviewCount: 367 },
  "7812P133": { rating: 5, reviewCount: 48 },
  "8841P19": { rating: 5, reviewCount: 118 },
  "188341P1": { rating: 5, reviewCount: 76 },
  "130651P13": { rating: 4.8, reviewCount: 441 },
  "3397P10": { rating: 4.9, reviewCount: 1189 },
  "3332BITE": { rating: 4.8, reviewCount: 203 },
  "316128P3": { rating: 5, reviewCount: 87 },
  "5042P100": { rating: 4.6, reviewCount: 512 },
  "46250P9": { rating: 5, reviewCount: 54 },
  "68189P1": { rating: 4.7, reviewCount: 934 },
  "61552P8": { rating: 4.7, reviewCount: 621 },
  "3332DAY": { rating: 4.8, reviewCount: 389 },
  "191307P3": { rating: 4.7, reviewCount: 256 },
  "338277P2": { rating: 4.9, reviewCount: 174 },
  "7812P19": { rating: 4.9, reviewCount: 695 },
};

export const CHICAGO_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CHICAGO_VIATOR_PUBLIC_RATINGS
);
