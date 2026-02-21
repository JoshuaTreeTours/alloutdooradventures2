export type AuthorityLandmarkSpec = {
  name: string;
  type: string;
  wikiTitles: string[];
};

const COLORADO_AUTHORITY_LANDMARKS: Record<string, AuthorityLandmarkSpec[]> = {
  boulder: [
    {
      name: "Flatirons",
      type: "rock formation",
      wikiTitles: ["Flatirons", "Flatirons (Boulder, Colorado)"],
    },
    {
      name: "Chautauqua Park",
      type: "public park",
      wikiTitles: ["Chautauqua Park", "Chautauqua Park Historic District"],
    },
    {
      name: "University of Colorado Boulder",
      type: "public research university",
      wikiTitles: ["University of Colorado Boulder"],
    },
    {
      name: "Pearl Street Mall",
      type: "pedestrian mall",
      wikiTitles: ["Pearl Street Mall"],
    },
    {
      name: "Boulder Creek",
      type: "creek",
      wikiTitles: ["Boulder Creek (Colorado)", "Boulder Creek"],
    },
  ],
  "colorado-springs": [
    {
      name: "Garden of the Gods",
      type: "public park",
      wikiTitles: ["Garden of the Gods"],
    },
    {
      name: "Pikes Peak",
      type: "mountain summit",
      wikiTitles: ["Pikes Peak"],
    },
    {
      name: "United States Air Force Academy",
      type: "federal military academy",
      wikiTitles: ["United States Air Force Academy"],
    },
    {
      name: "Cheyenne Mountain",
      type: "mountain",
      wikiTitles: ["Cheyenne Mountain"],
    },
    {
      name: "Broadmoor Hotel",
      type: "historic resort hotel",
      wikiTitles: ["The Broadmoor", "Broadmoor Hotel"],
    },
  ],
  durango: [
    {
      name: "Durango & Silverton Narrow Gauge Railroad",
      type: "heritage railroad",
      wikiTitles: [
        "Durango and Silverton Narrow Gauge Railroad",
        "Durango & Silverton Narrow Gauge Railroad",
      ],
    },
    {
      name: "Animas River",
      type: "river",
      wikiTitles: ["Animas River"],
    },
    {
      name: "Mesa Verde National Park",
      type: "national park",
      wikiTitles: ["Mesa Verde National Park"],
    },
    {
      name: "San Juan National Forest",
      type: "national forest",
      wikiTitles: ["San Juan National Forest"],
    },
    {
      name: "Historic Downtown Durango",
      type: "historic district",
      wikiTitles: ["Durango, Colorado", "Downtown Durango Historic District"],
    },
  ],
};

export const getAuthorityLandmarkOverride = (
  citySlug: string,
  stateSlug: string
): AuthorityLandmarkSpec[] | null => {
  if (stateSlug !== "colorado") {
    return null;
  }

  return COLORADO_AUTHORITY_LANDMARKS[citySlug] ?? null;
};
