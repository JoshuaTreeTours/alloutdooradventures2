export type VeniceViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Venice d522 Engine6 products. */
export const VENICE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  VeniceViatorPublicRating
> = {
  "140596P2": { rating: 5.0, reviewCount: 155 },
  "17356P1": { rating: 4.9, reviewCount: 80 },
  "56417P12": { rating: 4.9, reviewCount: 48 },
  "126511P4": { rating: 4.9, reviewCount: 19 },
  "15693P31": { rating: 4.8, reviewCount: 2865 },
  "15693STMARK": { rating: 4.7, reviewCount: 1292 },
  "6718P153": { rating: 5.0, reviewCount: 235 },
  "9555P4": { rating: 4.6, reviewCount: 403 },
  "2635PDOLOMITE": { rating: 4.6, reviewCount: 1339 },
  "7812P214": { rating: 4.9, reviewCount: 176 },
  "3731MURANO": { rating: 4.6, reviewCount: 6166 },
  "92490P4": { rating: 4.7, reviewCount: 72 },
};

export const VENICE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  VENICE_VIATOR_PUBLIC_RATINGS
);
