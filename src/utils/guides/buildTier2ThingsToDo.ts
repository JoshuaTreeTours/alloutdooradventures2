import type {
  CityLandmarkCandidate,
  LandmarkType,
} from "./extractCityLandmarksFromTours";
import { buildWikiLandmarkDescription } from "./buildWikiLandmarkDescription";

export type Tier2ThingToDo = {
  title: string;
  description: string;
};

export const buildTier2ThingsToDo = async (
  cityName: string,
  stateName: string,
  landmarks: Array<Pick<CityLandmarkCandidate, "name" | "type">>
): Promise<Tier2ThingToDo[]> => {
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

  const things: Tier2ThingToDo[] = [];

  for (const item of Array.from(deduped.values())) {
    const result = await buildWikiLandmarkDescription({
      landmarkName: item.name,
      cityName,
      stateName,
      tier: "tier2",
      existingDescriptions: things.map(entry => entry.description),
    });

    things.push({
      title: item.name,
      description: result.description,
    });
  }

  return things;
};
