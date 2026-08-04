export type BoulderViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Boulder d22773 Engine6 products. */
export const BOULDER_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BoulderViatorPublicRating
> = {
  "87324P1": { rating: 5.0, reviewCount: 381 },
  "326597P1": { rating: 5.0, reviewCount: 283 },
  "134767P1": { rating: 5.0, reviewCount: 249 },
  "326597P4": { rating: 5.0, reviewCount: 31 },
  "326597P3": { rating: 5.0, reviewCount: 50 },
  "283446P3": { rating: 5.0, reviewCount: 7 },
  "411989P1": { rating: 5.0, reviewCount: 4 },
  "205114P1": { rating: 5.0, reviewCount: 32 },
  "5653780P1": { rating: 5.0, reviewCount: 27 },
  "210815P2": { rating: 5.0, reviewCount: 26 },
  "438442P1": { rating: 5.0, reviewCount: 9 },
  "404160P1": { rating: 5.0, reviewCount: 7 },
  "87324P2": { rating: 5.0, reviewCount: 4 },
  "5554564P5": { rating: 5.0, reviewCount: 3 },
  "397161P1": { rating: 5.0, reviewCount: 3 },
};

export const BOULDER_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BOULDER_VIATOR_PUBLIC_RATINGS
);
