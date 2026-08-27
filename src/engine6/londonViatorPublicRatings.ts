export type LondonViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for London d737 Engine6 products. */
export const LONDON_VIATOR_PUBLIC_RATINGS: Record<
  string,
  LondonViatorPublicRating
> = {
  "8607P1": { rating: 5.0, reviewCount: 46 },
  "106826P1": { rating: 4.9, reviewCount: 449 },
  "60273P32": { rating: 5.0, reviewCount: 109 },
  "349592P2": { rating: 5.0, reviewCount: 40 },
  "103194P1": { rating: 5.0, reviewCount: 545 },
  "12389P8": { rating: 5.0, reviewCount: 40 },
  "306564P1": { rating: 5.0, reviewCount: 253 },
  "110975P32": { rating: 4.6, reviewCount: 16 },
  "13106P1": { rating: 5.0, reviewCount: 29 },
  "62043P1": { rating: 4.8, reviewCount: 529 },
  "2452L02": { rating: 4.3, reviewCount: 2487 },
  "75760P71": { rating: 4.8, reviewCount: 862 },
  "6295LOBLEGFD": { rating: 4.9, reviewCount: 26 },
  "75760P69": { rating: 4.7, reviewCount: 19 },
  "24338P83": { rating: 4.3, reviewCount: 149 },
  "3862BICYCLE": { rating: 4.9, reviewCount: 1301 },
  "40046P15": { rating: 5.0, reviewCount: 19 },
  "5936WHOWALK": { rating: 4.7, reviewCount: 140 },
};

export const LONDON_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  LONDON_VIATOR_PUBLIC_RATINGS
);
