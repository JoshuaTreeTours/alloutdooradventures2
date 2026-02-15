export type Engine2Destination = {
  country: string;
  region: string;
  city: string;
  csvPath: string;
  canonicalBasePath: string;
};

export const ENGINE2_DESTINATIONS: Record<string, Engine2Destination> = {
  palmSprings: {
    country: "United States",
    region: "California",
    city: "Palm Springs",
    csvPath: "data/palm-springs.csv",
    canonicalBasePath: "/destinations/california/palm-springs/tours",
  },
};
