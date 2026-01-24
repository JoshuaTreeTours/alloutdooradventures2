export type CityLandmarkMetadata = {
  neighborhoods: string[];
  culturalAreas?: string[];
  scenicAreas?: string[];
};

export const cityLandmarks: Record<string, CityLandmarkMetadata> = {
  "portland-or": {
    neighborhoods: [
      "NW / Nob Hill",
      "Pearl District",
      "Downtown",
      "Hawthorne",
      "Alberta Arts District",
      "Mississippi Avenue",
      "Sellwood",
      "St. Johns",
      "East Burnside",
      "Laurelhurst",
    ],
    scenicAreas: [
      "Forest Park",
      "Washington Park",
      "Willamette River waterfront",
    ],
  },
  "atlanta-ga": {
    neighborhoods: [
      "Midtown",
      "Old Fourth Ward",
      "Virginia-Highland",
      "Little Five Points",
      "Buckhead",
      "Inman Park",
      "West End",
    ],
  },
};
