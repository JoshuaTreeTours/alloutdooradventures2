export const NEW_FORT_LAUDERDALE_PRODUCT_CODES = [
  "155077P1",
  "169162P11",
  "169162P5",
  "44152P2",
  "44152P1",
  "5698ADEAST",
  "5221P41",
  "6331P15",
  "443622P1",
  "68236P1",
  "422984P2",
  "5190PRIVATE",
  "143322P5",
  "143322P4",
  "86313P1",
  "5546582P1",
  "270280P1",
  "50605P1",
] as const;

export type FortLauderdaleViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Fort Lauderdale d660 Engine6 products. */
export const FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  FortLauderdaleViatorPublicRating
> = {
  "383300P6": { rating: 4.9, reviewCount: 79 },
  "89173P8": { rating: 4.9, reviewCount: 43 },
  "76145P2": { rating: 4.8, reviewCount: 24 },
  "118958P8": { rating: 4.6, reviewCount: 37 },
  "6331BAHA": { rating: 3.1, reviewCount: 53 },
  "57834P1": { rating: 4.7, reviewCount: 2101 },
  "89173P10": { rating: 4.9, reviewCount: 52 },
  "155077P1": { rating: 5.0, reviewCount: 111 },
  "169162P11": { rating: 5.0, reviewCount: 326 },
  "169162P5": { rating: 5.0, reviewCount: 387 },
  "44152P2": { rating: 5.0, reviewCount: 117 },
  "44152P1": { rating: 5.0, reviewCount: 745 },
  "5698ADEAST": { rating: 5.0, reviewCount: 504 },
  "5221P41": { rating: 5.0, reviewCount: 14 },
  "6331P15": { rating: 5.0, reviewCount: 19 },
  "443622P1": { rating: 5.0, reviewCount: 24 },
  "68236P1": { rating: 5.0, reviewCount: 399 },
  "422984P2": { rating: 5.0, reviewCount: 20 },
  "5190PRIVATE": { rating: 5.0, reviewCount: 514 },
  "143322P5": { rating: 5.0, reviewCount: 705 },
  "143322P4": { rating: 5.0, reviewCount: 279 },
  "86313P1": { rating: 5.0, reviewCount: 278 },
  "5546582P1": { rating: 5.0, reviewCount: 56 },
  "270280P1": { rating: 5.0, reviewCount: 504 },
  "50605P1": { rating: 5.0, reviewCount: 690 },
};

export const FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS
);
