export type KeyWestViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Key West d661 Engine6 products. */
export const KEY_WEST_VIATOR_PUBLIC_RATINGS: Record<
  string,
  KeyWestViatorPublicRating
> = {
  "331502P3": { rating: 5, reviewCount: 11 },
  "362955P2": { rating: 5, reviewCount: 31 },
  "119664P1": { rating: 5, reviewCount: 444 },
  "288166P2": { rating: 5, reviewCount: 137 },
  "328038P9": { rating: 5, reviewCount: 180 },
  "102533P9": { rating: 5, reviewCount: 22 },
  "2642P5": { rating: 5, reviewCount: 368 },
  "418765P2": { rating: 5, reviewCount: 26 },
  "2642P21": { rating: 5, reviewCount: 1426 },
  "2642P34": { rating: 5, reviewCount: 602 },
  "2642P30": { rating: 5, reviewCount: 386 },
  "7506P2": { rating: 5, reviewCount: 1457 },
  "7506P1": { rating: 5, reviewCount: 1788 },
  "5395SUNSET": { rating: 5, reviewCount: 893 },
  "5264HDRS": { rating: 5, reviewCount: 447 },
  "3800P30": { rating: 5, reviewCount: 143 },
  "6426SHARKECO": { rating: 5, reviewCount: 3305 },
  "2642P6": { rating: 5, reviewCount: 1864 },
  "44502P1": { rating: 5, reviewCount: 1904 },
  "7812P77": { rating: 5, reviewCount: 309 },
  "328038P8": { rating: 5, reviewCount: 179 },
  "18235P1": { rating: 5, reviewCount: 2359 },
  "5264DC": { rating: 5, reviewCount: 1205 },
  "2642P16": { rating: 5, reviewCount: 148 },
};

export const KEY_WEST_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  KEY_WEST_VIATOR_PUBLIC_RATINGS
);
