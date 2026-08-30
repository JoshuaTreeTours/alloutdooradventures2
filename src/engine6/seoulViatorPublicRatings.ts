export type SeoulViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Seoul d973 Engine6 products. */
export const SEOUL_VIATOR_PUBLIC_RATINGS: Record<
  string,
  SeoulViatorPublicRating
> = {
  "42053P19": { rating: 4.9, reviewCount: 196 },
  "6780P36": { rating: 4.8, reviewCount: 81 },
  "470724P1": { rating: 5.0, reviewCount: 77 },
  "11214P21": { rating: 4.9, reviewCount: 34 },
  "6780CITY_FULLDAY": { rating: 4.8, reviewCount: 1372 },
  "6780P26": { rating: 4.8, reviewCount: 96 },
  "30023P9": { rating: 4.7, reviewCount: 47 },
  "42053P14": { rating: 4.9, reviewCount: 461 },
  "48881P11": { rating: 4.7, reviewCount: 277 },
  "55262P2": { rating: 4.8, reviewCount: 531 },
  "48881P82": { rating: 4.8, reviewCount: 56 },
  "33054P5": { rating: 5.0, reviewCount: 79 },
  "121170P1": { rating: 5.0, reviewCount: 907 },
  "359901P1": { rating: 4.9, reviewCount: 55 },
  "255235P5": { rating: 5.0, reviewCount: 53 },
  "47013P23": { rating: 5.0, reviewCount: 50 },
};

export const SEOUL_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  SEOUL_VIATOR_PUBLIC_RATINGS
);

/** Public Viator From$ / From US$ amounts in USD for the selected Seoul products. */
export const SEOUL_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "42053P19": 230,
  "6780P36": 240,
  "470724P1": 130,
  "11214P21": 245,
  "6780CITY_FULLDAY": 80,
  "6780P26": 79,
  "30023P9": 43.66,
  "42053P14": 53,
  "48881P11": 73.33,
  "55262P2": 91.89,
  "48881P82": 53.33,
  "33054P5": 89,
  "121170P1": 91,
  "359901P1": 47,
  "255235P5": 61.75,
  "47013P23": 45,
};
