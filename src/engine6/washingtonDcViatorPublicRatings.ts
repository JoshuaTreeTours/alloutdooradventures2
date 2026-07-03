export type WashingtonDcViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Washington D.C. d657 Engine6 products. */
export const WASHINGTON_DC_VIATOR_PUBLIC_RATINGS: Record<
  string,
  WashingtonDcViatorPublicRating
> = {
  "67327P4": { rating: 5, reviewCount: 278 },
  "7953P7": { rating: 4.9, reviewCount: 450 },
  "67327P13": { rating: 5, reviewCount: 13 },
  "149066P1": { rating: 5, reviewCount: 189 },
  "255730P191": { rating: 4.8, reviewCount: 95 },
  "67327P5": { rating: 5, reviewCount: 142 },
  "41503P1": { rating: 5, reviewCount: 55 },
  "41503P2": { rating: 4.9, reviewCount: 48 },
  "6349P59": { rating: 4.8, reviewCount: 288 },
  "6766SIGTOUR": { rating: 4.7, reviewCount: 1215 },
  "67327P3": { rating: 5, reviewCount: 167 },
  "7812P219": { rating: 4.9, reviewCount: 210 },
  "6349DAYTOUR": { rating: 4.7, reviewCount: 2941 },
  "6349NIGHT": { rating: 4.7, reviewCount: 6284 },
  "6766P11": { rating: 4.6, reviewCount: 4189 },
  "41377P2": { rating: 4.8, reviewCount: 1584 },
  "60725P1": { rating: 4.9, reviewCount: 1828 },
  "14782P1": { rating: 4.8, reviewCount: 253 },
  "5046WAS_MON": { rating: 4.6, reviewCount: 3748 },
  "6349VIPDC": { rating: 4.5, reviewCount: 2349 },
  "2384P20": { rating: 4.8, reviewCount: 1245 },
  "5769MTVN": { rating: 4.7, reviewCount: 806 },
};

export const WASHINGTON_DC_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  WASHINGTON_DC_VIATOR_PUBLIC_RATINGS
);
