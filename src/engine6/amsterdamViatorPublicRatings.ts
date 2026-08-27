export type AmsterdamViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Amsterdam d525 Engine6 products. */
export const AMSTERDAM_VIATOR_PUBLIC_RATINGS: Record<
  string,
  AmsterdamViatorPublicRating
> = {
  "139660P3": { rating: 5.0, reviewCount: 234 },
  "6290AMS4": { rating: 4.7, reviewCount: 140 },
  "7812P33": { rating: 5.0, reviewCount: 308 },
  "221267P4": { rating: 4.9, reviewCount: 344 },
  "9093P9": { rating: 4.7, reviewCount: 104 },
  "6624FOOD": { rating: 4.9, reviewCount: 2033 },
  "375412P1": { rating: 4.9, reviewCount: 1428 },
  "6464CITY": { rating: 4.8, reviewCount: 990 },
  "6464COUNTRY": { rating: 4.8, reviewCount: 1321 },
  "6412WALK": { rating: 4.8, reviewCount: 1089 },
  "61268P6": { rating: 4.8, reviewCount: 4557 },
  "75227P6": { rating: 4.9, reviewCount: 30121 },
};

export const AMSTERDAM_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  AMSTERDAM_VIATOR_PUBLIC_RATINGS
);
