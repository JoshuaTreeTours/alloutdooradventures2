import type {
  CityLandmarkCandidate,
  LandmarkType,
} from "./extractCityLandmarksFromTours";

export type Tier2ThingToDo = {
  title: string;
  description: string;
};

const wordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const typeLead: Record<LandmarkType, string> = {
  park: "is a major outdoor area",
  museum: "is a key cultural stop",
  beach: "is a well-known waterfront destination",
  bridge: "is a prominent crossing and viewpoint",
  district: "is one of the city's defining districts",
  harbor: "is a central harbor area",
  mountain: "is a notable mountain landscape",
  river: "is an important water corridor",
  historic: "is a recognized historic site",
  other: "is a recognized local landmark",
};

const typeExperience: Record<LandmarkType, string> = {
  park: "walking trails, open green space, and relaxed time outdoors",
  museum:
    "curated exhibits, architecture, and a stronger sense of local identity",
  beach: "shoreline walks, water views, and an easy sunset stop",
  bridge: "river or bay views, photo angles, and nearby walking routes",
  district: "historic blocks, dining clusters, and neighborhood street life",
  harbor: "marina views, waterfront paths, and access to boat activity",
  mountain: "scenic overlooks, trail access, and elevation-driven views",
  river: "waterfront paths, bridges, and day-to-day city movement",
  historic: "documented local history and preserved architecture",
  other:
    "an easy way to connect with the destination beyond major transit corridors",
};

const buildDescription = (
  title: string,
  type: LandmarkType,
  cityName: string,
  stateName: string
) => {
  const sentence = `${title} ${typeLead[type]} in ${cityName}, ${stateName}, known for ${typeExperience[type]}. It provides historical and civic context by connecting the site to the city's broader institutions, built environment, and public memory.`;

  const words = sentence.split(/\s+/);
  if (words.length > 75) {
    return `${words.slice(0, 75).join(" ").replace(/[;,]$/, "")}.`;
  }

  if (wordCount(sentence) >= 45) {
    return sentence;
  }

  return `${sentence} It also serves as a straightforward reference point when connecting nearby neighborhoods, attractions, and waterfront or park routes.`;
};

export const buildTier2ThingsToDo = (
  cityName: string,
  stateName: string,
  landmarks: Array<Pick<CityLandmarkCandidate, "name" | "type">>
): Tier2ThingToDo[] => {
  const deduped = new Map<string, { name: string; type: LandmarkType }>();

  landmarks.forEach(item => {
    const key = item.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!key || deduped.has(key)) {
      return;
    }

    deduped.set(key, {
      name: item.name.trim(),
      type: item.type,
    });
  });

  return Array.from(deduped.values()).map(item => ({
    title: item.name,
    description: buildDescription(item.name, item.type, cityName, stateName),
  }));
};
