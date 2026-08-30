export type OsakaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Osaka Engine6 products. */
export const OSAKA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  OsakaViatorPublicRating
> = {
  "92136P44": { rating: 4.8, reviewCount: 146 },
  "92136P45": { rating: 4.9, reviewCount: 300 },
  "30791P615": { rating: 4.8, reviewCount: 487 },
  "429399P2": { rating: 4.9, reviewCount: 142 },
  "425662P3": { rating: 5.0, reviewCount: 880 },
  "130036P2": { rating: 4.8, reviewCount: 1564 },
  "62558P5": { rating: 4.9, reviewCount: 865 },
  "63670P21": { rating: 4.9, reviewCount: 785 },
  "62558P2": { rating: 5.0, reviewCount: 131 },
  "20415P6": { rating: 4.6, reviewCount: 297 },
  "6806OSAKOSAKA": { rating: 5.0, reviewCount: 225 },
  "218199P1": { rating: 5.0, reviewCount: 43 },
  "22288P1": { rating: 4.8, reviewCount: 262 },
  "425662P2": { rating: 5.0, reviewCount: 581 },
  "63670P11": { rating: 4.9, reviewCount: 393 },
  "130036P1": { rating: 4.9, reviewCount: 1193 },
  "130036P4": { rating: 4.8, reviewCount: 94 },
  "460493P3": { rating: 4.9, reviewCount: 47 },
  "394526P1": { rating: 4.8, reviewCount: 135 },
  "427786P5": { rating: 5.0, reviewCount: 70 },
};

export const OSAKA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  OSAKA_VIATOR_PUBLIC_RATINGS
);

/**
 * Public Viator From$ / From US$ / FromUSD amounts in USD for the selected Osaka products.
 * Source currency was verified as USD on US-facing listings; JPY/EUR/GBP/AUD amounts were rejected.
 */
export const OSAKA_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "92136P44": 156.59,
  "92136P45": 106.77,
  "30791P615": 60.93,
  "429399P2": 128.12,
  "425662P3": 93.38,
  "130036P2": 92.94,
  "62558P5": 117.45,
  "63670P21": 110.71,
  "62558P2": 88.77,
  "20415P6": 90.35,
  "6806OSAKOSAKA": 109.47,
  "218199P1": 83.67,
  "22288P1": 55.35,
  "425662P2": 90.64,
  "63670P11": 49,
  "130036P1": 57.46,
  "130036P4": 68,
  "460493P3": 155,
  "394526P1": 79,
  "427786P5": 82,
};
