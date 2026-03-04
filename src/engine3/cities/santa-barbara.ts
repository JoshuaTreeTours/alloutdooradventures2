export const santaBarbaraConfig = {
  citySlug: "santa-barbara",
  cityName: "Santa Barbara",
  stateSlug: "california",
  stateName: "California",
  viatorDestinationId: "4372",
  categories: [
    "sailing",
    "wine-tours",
    "e-bike",
    "walking-tours",
    "food-tours",
    "day-trips",
  ],
  ranking: {
    minRating: 4.5,
    minReviews: 25,
    limitPerCategory: 10,
  },
} as const;

export type SantaBarbaraCategory =
  (typeof santaBarbaraConfig.categories)[number];

export const santaBarbaraCategoryHeadings: Record<
  SantaBarbaraCategory,
  string
> = {
  sailing: "Santa Barbara Sailing & Cruises",
  "wine-tours": "Santa Barbara Wine Country",
  "e-bike": "Santa Barbara Bike & E-Bike",
  "walking-tours": "Santa Barbara Walking & History",
  "food-tours": "Santa Barbara Food Tours",
  "day-trips": "Santa Barbara Day Trips",
};
