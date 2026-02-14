export const ENGINE2_DEFAULT_IMAGE = "/images/default-tour.jpg";

export const ENGINE2_DESTINATIONS = {
  palmSprings: {
    key: "palm-springs",
    csvPaths: ["data/palm-springs.csv", "data/palm-springs-jeeps.csv"],
    country: "United States",
    region: "California",
    city: "Palm Springs",
    stateSlug: "california",
    citySlug: "palm-springs",
    canonicalBasePath: "/destinations/california/palm-springs/tours",
  },
} as const;
