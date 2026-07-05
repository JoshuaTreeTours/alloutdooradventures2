export const NEW_NAPLES_PRODUCT_CODES = [
  "293665P1",
  "38075P18",
  "389518P4",
  "378404P5",
  "76258P6",
  "378404P1",
  "378404P4",
  "76258P2",
  "44152P10",
  "284504P1",
  "457279P1",
  "87912P1",
  "5609P13",
  "44152P9",
  "30481P16",
  "389518P3",
  "389518P9",
  "268216P7",
  "166513P2",
  "64741P1",
  "5698HALFWEST",
  "5609P10",
  "30481P3",
  "30481P13",
] as const;

export type NaplesViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Naples d22381 Engine6 products. */
export const NAPLES_VIATOR_PUBLIC_RATINGS: Record<
  string,
  NaplesViatorPublicRating
> = {
  "293665P1": { rating: 5, reviewCount: 24 },
  "38075P18": { rating: 5, reviewCount: 6 },
  "389518P4": { rating: 5, reviewCount: 90 },
  "378404P5": { rating: 5, reviewCount: 1 },
  "76258P6": { rating: 5, reviewCount: 51 },
  "378404P1": { rating: 5, reviewCount: 38 },
  "378404P4": { rating: 5, reviewCount: 147 },
  "76258P2": { rating: 5, reviewCount: 38 },
  "44152P10": { rating: 5, reviewCount: 49 },
  "284504P1": { rating: 5, reviewCount: 292 },
  "457279P1": { rating: 5, reviewCount: 52 },
  "87912P1": { rating: 5, reviewCount: 953 },
  "5609P13": { rating: 5, reviewCount: 50 },
  "44152P9": { rating: 5, reviewCount: 6 },
  "30481P16": { rating: 5, reviewCount: 101 },
  "389518P3": { rating: 5, reviewCount: 223 },
  "389518P9": { rating: 5, reviewCount: 44 },
  "268216P7": { rating: 5, reviewCount: 46 },
  "166513P2": { rating: 5, reviewCount: 250 },
  "64741P1": { rating: 5, reviewCount: 1020 },
  "5698HALFWEST": { rating: 5, reviewCount: 165 },
  "5609P10": { rating: 5, reviewCount: 539 },
  "30481P3": { rating: 5, reviewCount: 1105 },
  "30481P13": { rating: 5, reviewCount: 548 },
};

export const NAPLES_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  NAPLES_VIATOR_PUBLIC_RATINGS
);
