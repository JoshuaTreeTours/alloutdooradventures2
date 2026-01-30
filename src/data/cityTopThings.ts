import { getCityCoordinates } from "./cityCoordinates";
import { cityLocalPois, type LocalPoi } from "./cityLocalPois";
import { states } from "./destinations";
import { haversineMiles, normalizePlaceName } from "../utils/geo";

export const MAX_DRIVE_HOURS = 2;
export const ASSUMED_AVG_MPH = 55;
export const MAX_NEARBY_MILES = MAX_DRIVE_HOURS * ASSUMED_AVG_MPH;

export const TOP_THINGS_DENYLIST = [
  "riverfront",
  "river walk",
  "riverwalk",
  "coastal bluffs",
  "regional parklands",
  "arts district",
  "scenic loop",
  "desert overlook",
];

export type TopThingSource = "local-poi" | "nearby-destination" | "fallback";

export type TopThingCandidate = {
  name: string;
  source: TopThingSource;
  category?: LocalPoi["category"];
};

export type TopThingListItem = {
  title: string;
  description: string;
};

export type NearbyDestination = {
  name: string;
  citySlug: string;
  stateSlug: string;
  lat: number;
  lng: number;
  distanceMiles: number;
};

const TITLE_CASE_LOWER_WORDS = new Set([
  "and",
  "or",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "for",
  "by",
  "with",
  "a",
  "an",
]);

const CITY_TOP_THINGS_FALLBACKS: Record<string, string[]> = {
  "california/joshua-tree": [
    "Joshua Tree National Park (West Entrance)",
    "Hidden Valley",
    "Keys View",
    "Barker Dam",
    "Skull Rock",
    "Cholla Cactus Garden",
    "Ryan Mountain Trailhead",
    "Cap Rock",
    "Indian Cove",
    "Joshua Tree Visitor Center",
    "Palm Springs",
  ],
};

const buildCityKey = (parentSlug: string, citySlug: string) =>
  `${parentSlug}/${citySlug}`;

const toTitleCase = (name: string) =>
  name.replace(/\b([A-Za-z][A-Za-z']*)\b/g, (match, word, offset) => {
    const lower = word.toLowerCase();
    const isFirst = offset === 0;

    if (!isFirst && TITLE_CASE_LOWER_WORDS.has(lower)) {
      return lower;
    }

    if (word === word.toUpperCase() && word.length > 1) {
      return word;
    }

    return `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`;
  });

export const isDenylistedTopThing = (name: string) => {
  const lower = name.toLowerCase();
  return TOP_THINGS_DENYLIST.some((phrase) => lower.includes(phrase));
};

export const getLocalPoisForCity = (parentSlug: string, citySlug: string) =>
  cityLocalPois.filter(
    (poi) => poi.citySlug === citySlug && poi.stateSlug === parentSlug,
  );

const buildLocalPoiNameSet = (pois: LocalPoi[]) =>
  new Set(pois.map((poi) => normalizePlaceName(poi.name)));

const buildDestinationList = () =>
  states.flatMap((state) =>
    state.cities.map((city) => ({
      name: city.name,
      citySlug: city.slug,
      stateSlug: state.slug,
      lat: city.lat,
      lng: city.lng,
    })),
  );

let destinationList: ReturnType<typeof buildDestinationList> | null = null;

const getDestinationList = () => {
  if (!destinationList) {
    destinationList = buildDestinationList();
  }

  return destinationList;
};

export const getNearbyDestinations = (
  parentSlug: string,
  citySlug: string,
  maxMiles = MAX_NEARBY_MILES,
): NearbyDestination[] => {
  const origin = getCityCoordinates(parentSlug, citySlug);
  if (!origin) {
    return [];
  }

  const nearbyMap = new Map<string, NearbyDestination>();

  getDestinationList()
    .filter((destination) => destination.citySlug !== citySlug)
    .forEach((destination) => {
      const distanceMiles = haversineMiles(origin, {
        lat: destination.lat,
        lng: destination.lng,
      });

      if (distanceMiles > maxMiles) {
        return;
      }

      const key = normalizePlaceName(destination.name);
      const existing = nearbyMap.get(key);

      if (!existing || distanceMiles < existing.distanceMiles) {
        nearbyMap.set(key, {
          ...destination,
          distanceMiles,
        });
      }
    });

  return Array.from(nearbyMap.values()).sort(
    (a, b) => a.distanceMiles - b.distanceMiles,
  );
};

export const applyTopThingsBackfill = (
  items: TopThingCandidate[],
  fallbackNames: string[],
  localPoiNames: Set<string>,
  nearbyDestinationNames: Set<string>,
  minItems = 10,
) => {
  const results = [...items];
  const seen = new Set(results.map((item) => normalizePlaceName(item.name)));

  fallbackNames.forEach((name) => {
    if (results.length >= minItems) {
      return;
    }

    const normalized = normalizePlaceName(name);
    if (seen.has(normalized)) {
      return;
    }

    if (localPoiNames.has(normalized)) {
      results.push({ name, source: "fallback" });
      seen.add(normalized);
      return;
    }

    if (nearbyDestinationNames.has(normalized)) {
      results.push({ name, source: "fallback" });
      seen.add(normalized);
    }
  });

  return results;
};

export const filterTopThingsByRules = (
  candidates: TopThingCandidate[],
  localPoiNames: Set<string>,
) => {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const normalized = normalizePlaceName(candidate.name);
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    if (
      isDenylistedTopThing(candidate.name) &&
      !localPoiNames.has(normalized)
    ) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const buildLocalPoiDescription = (name: string, category?: LocalPoi["category"]) => {
  switch (category) {
    case "viewpoint":
      return `Take in the panoramic desert views at ${name}.`;
    case "trail":
      return `Start a well-loved trail from ${name} for a signature route.`;
    case "boulder-area":
      return `Explore the rock formations and boulder fields around ${name}.`;
    case "visitor-center":
      return `Stop by ${name} for up-to-date maps, permits, and ranger guidance.`;
    case "historic-site":
      return `Spend time at ${name} to connect with local history.`;
    case "park":
      return `Plan a visit to ${name} to experience the park’s signature landscapes.`;
    default:
      return `Add ${name} to your list for a focused desert highlight.`;
  }
};

const buildNearbyDestinationDescription = (name: string, cityName: string) =>
  `Take a short drive from ${cityName} to ${name} for an easy change of scenery.`;

export const buildTopThingsToDo = (
  cityName: string,
  parentSlug: string,
  citySlug: string,
  maxItems = 15,
): TopThingListItem[] => {
  const localPois = getLocalPoisForCity(parentSlug, citySlug);
  const localPoiNames = buildLocalPoiNameSet(localPois);
  const nearbyDestinations = getNearbyDestinations(parentSlug, citySlug);
  const nearbyDestinationNames = new Set(
    nearbyDestinations.map((destination) => normalizePlaceName(destination.name)),
  );

  const localPoiCandidates: TopThingCandidate[] = localPois.map((poi) => ({
    name: poi.name,
    source: "local-poi",
    category: poi.category,
  }));
  const nearbyCandidates: TopThingCandidate[] = nearbyDestinations.map(
    (destination) => ({
      name: destination.name,
      source: "nearby-destination",
    }),
  );

  const candidates = filterTopThingsByRules(
    [...localPoiCandidates, ...nearbyCandidates],
    localPoiNames,
  );

  const fallbackNames =
    CITY_TOP_THINGS_FALLBACKS[buildCityKey(parentSlug, citySlug)] ?? [];
  const withBackfill = applyTopThingsBackfill(
    candidates,
    fallbackNames,
    localPoiNames,
    nearbyDestinationNames,
  );

  return withBackfill.slice(0, maxItems).map((candidate) => {
    const title = toTitleCase(candidate.name);
    const localPoi = localPois.find(
      (poi) => normalizePlaceName(poi.name) === normalizePlaceName(candidate.name),
    );
    const description = localPoi
      ? buildLocalPoiDescription(title, localPoi.category)
      : buildNearbyDestinationDescription(title, cityName);

    return {
      title,
      description,
    };
  });
};

export const getTopThingAuditContext = (
  parentSlug: string,
  citySlug: string,
) => {
  const origin = getCityCoordinates(parentSlug, citySlug);
  const localPois = getLocalPoisForCity(parentSlug, citySlug);
  const localPoiNames = buildLocalPoiNameSet(localPois);
  const allDestinations = getDestinationList();
  const destinationDistanceMap = new Map<string, number>();

  if (origin) {
    allDestinations.forEach((destination) => {
      const distance = haversineMiles(origin, {
        lat: destination.lat,
        lng: destination.lng,
      });
      const key = normalizePlaceName(destination.name);
      const existing = destinationDistanceMap.get(key);

      if (existing === undefined || distance < existing) {
        destinationDistanceMap.set(key, distance);
      }
    });
  }

  return {
    origin,
    localPoiNames,
    destinationDistanceMap,
  };
};
