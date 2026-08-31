export type CairnsViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Cairns Engine6 products. */
export const CAIRNS_VIATOR_PUBLIC_RATINGS: Record<
  string,
  CairnsViatorPublicRating
> = {
  "3253P11": { rating: 4.9, reviewCount: 52 },
  "2845P3": { rating: 4.3, reviewCount: 122 },
  "22448P1": { rating: 4.6, reviewCount: 811 },
  "76865P1": { rating: 4.8, reviewCount: 375 },
  "5364FREE": { rating: 4.9, reviewCount: 606 },
  "2845MIC_C": { rating: 4.5, reviewCount: 150 },
  "5641FITZROY": { rating: 4.2, reviewCount: 648 },
  "2570CTR": { rating: 4.7, reviewCount: 449 },
  "611960119T1": { rating: 4.8, reviewCount: 378 },
  "11730P6": { rating: 4.9, reviewCount: 258 },
  "20046P3": { rating: 4.8, reviewCount: 131 },
  "42277P10": { rating: 4.9, reviewCount: 38 },
  "2570KURANDA": { rating: 4.5, reviewCount: 519 },
  "37685P1": { rating: 4.8, reviewCount: 270 },
  "2845P1": { rating: 4.2, reviewCount: 348 },
};

export const CAIRNS_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CAIRNS_VIATOR_PUBLIC_RATINGS
);

/**
 * Public Viator USD adult From amounts for Cairns Engine6 products.
 * Source of truth is the product-page price widget:
 * FromUS$ / FromUSD / US-facing From$ / $ leg of an A$+$ pair.
 * AUD From$ (including en-AU From$249.00) is never stored as USD.
 * Fitzroy 5641FITZROY stores 65.15 USD from the dual A$100 / $65.15 pair.
 */
export const CAIRNS_VIATOR_PUBLIC_USD_FROM_PRICES: Record<string, number> = {
  "3253P11": 520.74,
  "2845P3": 194.79,
  "22448P1": 212.96,
  "76865P1": 162.21,
  "5364FREE": 181.76,
  "2845MIC_C": 179.8,
  "5641FITZROY": 65.15,
  "2570CTR": 192.16,
  "611960119T1": 143.37,
  "11730P6": 166.18,
  "20046P3": 170.24,
  "42277P10": 190.61,
  "2570KURANDA": 180.77,
  "37685P1": 124.14,
  "2845P1": 97.72,
};
