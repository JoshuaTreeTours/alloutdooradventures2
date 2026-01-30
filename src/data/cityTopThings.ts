import { getCityCoordinates } from "./cityCoordinates";
import { isTier1IntlCity } from "./cityTier1Intl";
import { isTier1City } from "./cityTier1";
import { cityLocalPois, type LocalPoi } from "./cityLocalPois";
import { getTier1PoisForCity } from "./cityPois/tier1";
import { getTier1IntlPoisForCity } from "./cityPois/tier1/world";
import { getCityBySlugs, getStateBySlug, states } from "./destinations";
import type { CityFacts } from "../lib/cityGuideFacts";
import { tours } from "./tours";
import { haversineMiles, normalizePlaceName } from "../utils/geo";

export const MAX_DRIVE_HOURS = 2;
export const ASSUMED_AVG_MPH = 55;
export const MAX_NEARBY_DESTINATION_MILES = 60;
export const MAX_NEARBY_MILES = MAX_NEARBY_DESTINATION_MILES;
export const MIN_TIER1_DESCRIPTION_LENGTH = 240;
export const MIN_TIER1_ITEMS = 8;

const TIER1_CITY_RADIUS_MILES: Record<string, number> = {
  "los-angeles": 20,
  "san-diego": 20,
  "san-francisco": 20,
  "san-jose": 20,
  sacramento: 20,
  seattle: 20,
  portland: 20,
  "las-vegas": 20,
  phoenix: 20,
  denver: 20,
  chicago: 20,
  "new-york": 20,
  miami: 20,
  boston: 20,
  washington: 20,
  philadelphia: 20,
  orlando: 20,
  anaheim: 15,
  "long-beach": 15,
  nashville: 15,
  "palm-springs": 12,
  "joshua-tree": 12,
  "santa-barbara": 12,
  "newport-beach": 12,
  "laguna-beach": 12,
  edinburgh: 12,
  rome: 15,
  florence: 12,
  barcelona: 15,
  madrid: 15,
  lisbon: 15,
  amsterdam: 12,
  berlin: 15,
  vienna: 12,
  sydney: 20,
};

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

export const TOP_THINGS_BANNED_PHRASES = [
  "take a short drive from",
  "easy change of scenery",
  "quick way to add variety",
  "add variety to your trip",
  "quick way to add variety to your trip",
];

const GENERIC_PLACEHOLDER_PHRASES = [
  "central plaza",
  "arts quarter",
  "riverfront walk",
  "regional parklands",
  "scenic viewpoint loop",
];

export type TopThingSource =
  | "local-poi"
  | "nearby-poi"
  | "nearby-destination"
  | "fallback"
  | "archetype";

export type TopThingCandidate = {
  name: string;
  source: TopThingSource;
  category?: LocalPoi["category"];
  description?: string;
  activityType?: string;
};

export type TopThingListItem = {
  title: string;
  description: string;
  activityType?: string;
};

export type NearbyDestination = {
  name: string;
  citySlug: string;
  stateSlug: string;
  lat: number;
  lng: number;
  distanceMiles: number;
};

type NearbyPoi = LocalPoi & { distanceMiles: number };

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

const COASTAL_STATE_SLUGS = new Set([
  "alabama",
  "alaska",
  "california",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "mississippi",
  "new-hampshire",
  "new-jersey",
  "new-york",
  "north-carolina",
  "oregon",
  "rhode-island",
  "south-carolina",
  "texas",
  "virginia",
  "washington",
]);

const MOUNTAIN_STATE_SLUGS = new Set([
  "arizona",
  "colorado",
  "idaho",
  "montana",
  "nevada",
  "new-mexico",
  "utah",
  "wyoming",
]);

const DESERT_STATE_SLUGS = new Set([
  "arizona",
  "california",
  "nevada",
  "new-mexico",
  "utah",
]);

const RIVER_HINT_STATES = new Set([
  "alabama",
  "arkansas",
  "colorado",
  "georgia",
  "idaho",
  "kentucky",
  "missouri",
  "montana",
  "north-carolina",
  "oregon",
  "south-carolina",
  "tennessee",
  "utah",
  "washington",
]);

const US_STATE_NEIGHBORS: Record<string, string[]> = {
  alabama: ["florida", "georgia", "mississippi", "tennessee"],
  alaska: [],
  arizona: ["california", "nevada", "new-mexico", "utah"],
  arkansas: [
    "louisiana",
    "mississippi",
    "missouri",
    "oklahoma",
    "tennessee",
    "texas",
  ],
  california: ["arizona", "nevada", "oregon"],
  colorado: [
    "arizona",
    "kansas",
    "nebraska",
    "new-mexico",
    "oklahoma",
    "utah",
    "wyoming",
  ],
  connecticut: ["massachusetts", "new-york", "rhode-island"],
  delaware: ["maryland", "new-jersey", "pennsylvania"],
  florida: ["alabama", "georgia"],
  georgia: [
    "alabama",
    "florida",
    "north-carolina",
    "south-carolina",
    "tennessee",
  ],
  hawaii: [],
  idaho: ["montana", "nevada", "oregon", "utah", "washington", "wyoming"],
  illinois: [
    "indiana",
    "iowa",
    "kentucky",
    "michigan",
    "missouri",
    "wisconsin",
  ],
  indiana: ["illinois", "kentucky", "michigan", "ohio"],
  iowa: [
    "illinois",
    "minnesota",
    "missouri",
    "nebraska",
    "south-dakota",
    "wisconsin",
  ],
  kansas: ["colorado", "missouri", "nebraska", "oklahoma"],
  kentucky: [
    "illinois",
    "indiana",
    "missouri",
    "ohio",
    "tennessee",
    "virginia",
    "west-virginia",
  ],
  louisiana: ["arkansas", "mississippi", "texas"],
  maine: ["new-hampshire"],
  maryland: [
    "delaware",
    "district-of-columbia",
    "pennsylvania",
    "virginia",
    "west-virginia",
  ],
  massachusetts: [
    "connecticut",
    "new-hampshire",
    "new-york",
    "rhode-island",
    "vermont",
  ],
  michigan: ["indiana", "ohio", "wisconsin"],
  minnesota: ["iowa", "north-dakota", "south-dakota", "wisconsin"],
  mississippi: ["alabama", "arkansas", "louisiana", "tennessee"],
  missouri: [
    "arkansas",
    "illinois",
    "iowa",
    "kansas",
    "kentucky",
    "nebraska",
    "oklahoma",
    "tennessee",
  ],
  montana: ["idaho", "north-dakota", "south-dakota", "wyoming"],
  nebraska: [
    "colorado",
    "iowa",
    "kansas",
    "missouri",
    "south-dakota",
    "wyoming",
  ],
  nevada: ["arizona", "california", "idaho", "oregon", "utah"],
  "new-hampshire": ["maine", "massachusetts", "vermont"],
  "new-jersey": ["delaware", "new-york", "pennsylvania"],
  "new-mexico": ["arizona", "colorado", "oklahoma", "texas", "utah"],
  "new-york": [
    "connecticut",
    "massachusetts",
    "new-jersey",
    "pennsylvania",
    "vermont",
  ],
  "north-carolina": ["georgia", "south-carolina", "tennessee", "virginia"],
  "north-dakota": ["minnesota", "montana", "south-dakota"],
  ohio: ["indiana", "kentucky", "michigan", "pennsylvania", "west-virginia"],
  oklahoma: [
    "arkansas",
    "colorado",
    "kansas",
    "missouri",
    "new-mexico",
    "texas",
  ],
  oregon: ["california", "idaho", "nevada", "washington"],
  pennsylvania: [
    "delaware",
    "maryland",
    "new-jersey",
    "new-york",
    "ohio",
    "west-virginia",
  ],
  "rhode-island": ["connecticut", "massachusetts"],
  "south-carolina": ["georgia", "north-carolina"],
  "south-dakota": [
    "iowa",
    "minnesota",
    "montana",
    "nebraska",
    "north-dakota",
    "wyoming",
  ],
  tennessee: [
    "alabama",
    "arkansas",
    "georgia",
    "kentucky",
    "mississippi",
    "missouri",
    "north-carolina",
    "virginia",
  ],
  texas: ["arkansas", "louisiana", "new-mexico", "oklahoma"],
  utah: ["arizona", "colorado", "idaho", "nevada", "new-mexico", "wyoming"],
  vermont: ["massachusetts", "new-hampshire", "new-york"],
  virginia: [
    "district-of-columbia",
    "kentucky",
    "maryland",
    "north-carolina",
    "tennessee",
    "west-virginia",
  ],
  washington: ["idaho", "oregon"],
  "west-virginia": ["kentucky", "maryland", "ohio", "pennsylvania", "virginia"],
  wisconsin: ["illinois", "iowa", "michigan", "minnesota"],
  wyoming: ["colorado", "idaho", "montana", "nebraska", "south-dakota", "utah"],
  "district-of-columbia": ["maryland", "virginia"],
};

const buildCityKey = (parentSlug: string, citySlug: string) =>
  `${parentSlug}/${citySlug}`;

export const getAllowedNeighborStates = (stateSlug: string) =>
  new Set([stateSlug, ...(US_STATE_NEIGHBORS[stateSlug] ?? [])]);

const US_STATE_SLUGS = new Set(states.map(state => state.slug));

let tourCityNameAllowlist: Map<string, Set<string>> | null = null;

const buildTourCityNameAllowlist = () => {
  const allowlist = new Map<string, Set<string>>();
  tours.forEach(tour => {
    const stateSlug = tour.destination.stateSlug;
    const cityName = tour.destination.city;
    if (!US_STATE_SLUGS.has(stateSlug) || !cityName) {
      return;
    }
    const normalized = normalizePlaceName(cityName);
    if (!normalized) {
      return;
    }
    const entry = allowlist.get(stateSlug) ?? new Set<string>();
    entry.add(normalized);
    allowlist.set(stateSlug, entry);
  });
  return allowlist;
};

const getTourCityNameAllowlist = () => {
  if (!tourCityNameAllowlist) {
    tourCityNameAllowlist = buildTourCityNameAllowlist();
  }
  return tourCityNameAllowlist;
};

export const getNearbyDestinationAllowlist = (
  parentSlug: string,
  regionType: "state" | "country",
  cityFacts?: CityFacts
) => {
  if (regionType !== "state") {
    return new Set<string>();
  }

  const allowlist = new Set<string>();
  const allowedStates = getAllowedNeighborStates(parentSlug);
  const tourAllowlist = getTourCityNameAllowlist();

  allowedStates.forEach(stateSlug => {
    const stateAllowlist = tourAllowlist.get(stateSlug);
    stateAllowlist?.forEach(name => allowlist.add(name));
  });

  cityFacts?.nearby?.forEach(name => {
    const normalized = normalizePlaceName(name);
    if (normalized) {
      allowlist.add(normalized);
    }
  });

  return allowlist;
};

const hasValidCoordinates = (
  lat: number | null | undefined,
  lng: number | null | undefined
) => Number.isFinite(lat) && Number.isFinite(lng);

export const containsBannedTopThingPhrase = (text: string) => {
  const lower = text.toLowerCase();
  return TOP_THINGS_BANNED_PHRASES.some(phrase => lower.includes(phrase));
};

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
  return TOP_THINGS_DENYLIST.some(phrase => lower.includes(phrase));
};

export const isGenericPlaceholderName = (name: string, cityName: string) => {
  const lower = name.toLowerCase();
  const cityLower = cityName.toLowerCase();

  if (GENERIC_PLACEHOLDER_PHRASES.some(phrase => lower.includes(phrase))) {
    return true;
  }

  if (
    lower.includes("historic downtown") &&
    cityLower &&
    lower.includes(cityLower)
  ) {
    return true;
  }

  if (lower.includes("downtown") && lower.includes(cityLower)) {
    return true;
  }

  return false;
};

export const getLocalPoisForCity = (parentSlug: string, citySlug: string) =>
  cityLocalPois.filter(
    poi => poi.citySlug === citySlug && poi.stateSlug === parentSlug
  );

export const getNearbyPoisForCity = (
  parentSlug: string,
  citySlug: string,
  maxMiles = MAX_NEARBY_MILES
): NearbyPoi[] => {
  const origin = getCityCoordinates(parentSlug, citySlug);
  if (!origin) {
    return [];
  }

  return cityLocalPois
    .filter(
      poi =>
        poi.stateSlug === parentSlug &&
        poi.citySlug !== citySlug &&
        hasValidCoordinates(poi.lat, poi.lng)
    )
    .map(poi => ({
      ...poi,
      distanceMiles: haversineMiles(origin, { lat: poi.lat, lng: poi.lng }),
    }))
    .filter(poi => poi.distanceMiles <= maxMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
};

const buildLocalPoiNameSet = (pois: ReadonlyArray<LocalPoi>) =>
  new Set(pois.map(poi => normalizePlaceName(poi.name)));

const buildDestinationList = () =>
  states.flatMap(state =>
    state.cities.map(city => ({
      name: city.name,
      citySlug: city.slug,
      stateSlug: state.slug,
      lat: city.lat,
      lng: city.lng,
    }))
  );

let destinationList: ReturnType<typeof buildDestinationList> | null = null;
let destinationNameIndex: Map<
  string,
  ReturnType<typeof buildDestinationList>
> | null = null;

const getDestinationList = () => {
  if (!destinationList) {
    destinationList = buildDestinationList();
  }

  return destinationList;
};

const getDestinationNameIndex = () => {
  if (!destinationNameIndex) {
    const index = new Map<
      string,
      ReturnType<typeof buildDestinationList>[number][]
    >();
    getDestinationList().forEach(destination => {
      const key = normalizePlaceName(destination.name);
      const matches = index.get(key) ?? [];
      matches.push(destination);
      index.set(key, matches);
    });
    destinationNameIndex = index;
  }

  return destinationNameIndex;
};

const getStateName = (stateSlug: string) =>
  getStateBySlug(stateSlug)?.name ?? "";

const getCityName = (stateSlug: string, citySlug: string) =>
  getCityBySlugs(stateSlug, citySlug)?.name ?? "";

export const getNearbyDestinations = (
  parentSlug: string,
  citySlug: string,
  maxMiles = MAX_NEARBY_DESTINATION_MILES
): NearbyDestination[] => {
  const origin = getCityCoordinates(parentSlug, citySlug);
  if (!origin) {
    return [];
  }

  const allowedStates = getAllowedNeighborStates(parentSlug);
  const nearbyMap = new Map<string, NearbyDestination>();

  getDestinationList()
    .filter(
      destination =>
        destination.citySlug !== citySlug &&
        allowedStates.has(destination.stateSlug) &&
        hasValidCoordinates(destination.lat, destination.lng)
    )
    .forEach(destination => {
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
    (a, b) => a.distanceMiles - b.distanceMiles
  );
};

export const applyTopThingsBackfill = (
  items: TopThingCandidate[],
  fallbackNames: string[],
  curatedPoiNames: Set<string>,
  nearbyDestinationNames: Set<string>,
  minItems = 10
) => {
  const results = [...items];
  const seen = new Set(results.map(item => normalizePlaceName(item.name)));

  fallbackNames.forEach(name => {
    if (results.length >= minItems) {
      return;
    }

    const normalized = normalizePlaceName(name);
    if (seen.has(normalized)) {
      return;
    }

    if (curatedPoiNames.has(normalized)) {
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
  curatedPoiNames: Set<string>,
  cityName?: string
) => {
  const seen = new Set<string>();

  return candidates.filter(candidate => {
    const normalized = normalizePlaceName(candidate.name);
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    if (
      candidate.source !== "archetype" &&
      isDenylistedTopThing(candidate.name) &&
      !curatedPoiNames.has(normalized)
    ) {
      return false;
    }

    if (
      cityName &&
      isGenericPlaceholderName(candidate.name, cityName) &&
      !curatedPoiNames.has(normalized)
    ) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

type DestinationTrait =
  | "coastal"
  | "waterfront"
  | "historic"
  | "mountain"
  | "desert"
  | "lake"
  | "river"
  | "arts"
  | "food"
  | "family"
  | "boardwalk"
  | "island"
  | "parks"
  | "wine"
  | "college"
  | "music";

const DESTINATION_TRAIT_OVERRIDES: Record<string, DestinationTrait[]> = {
  "new-jersey/atlantic-highlands": ["coastal", "waterfront"],
  "new-jersey/ocean-city": ["coastal", "boardwalk", "family"],
  "new-jersey/atlantic-city": ["coastal", "boardwalk", "food", "music"],
  "new-york/new-york": ["arts", "food", "waterfront"],
};

const ACTIVITY_TAG_TRAITS: Record<string, DestinationTrait> = {
  beach: "coastal",
  coastal: "coastal",
  hiking: "parks",
  paddling: "waterfront",
  cycling: "parks",
  historic: "historic",
  culture: "arts",
  arts: "arts",
  food: "food",
  family: "family",
  mountain: "mountain",
  desert: "desert",
  lake: "lake",
  river: "river",
  wine: "wine",
  college: "college",
  music: "music",
};

const DESTINATION_TRAIT_PRIORITY: DestinationTrait[] = [
  "coastal",
  "boardwalk",
  "waterfront",
  "lake",
  "river",
  "mountain",
  "desert",
  "historic",
  "arts",
  "food",
  "wine",
  "music",
  "college",
  "parks",
  "family",
  "island",
];

const inferTraitsFromName = (name: string): DestinationTrait[] => {
  const lower = name.toLowerCase();
  const traits: DestinationTrait[] = [];
  if (/(beach|shore|bay|harbor|harbour|port|coast|seaside|cove)/.test(lower)) {
    traits.push("coastal", "waterfront");
  }
  if (/(island|key)/.test(lower)) {
    traits.push("island", "waterfront");
  }
  if (/(lake|lakes)/.test(lower)) {
    traits.push("lake", "waterfront");
  }
  if (/(river|falls)/.test(lower)) {
    traits.push("river", "waterfront");
  }
  if (/(mountain|ridge|peak|summit|mesa)/.test(lower)) {
    traits.push("mountain");
  }
  if (/(historic|heritage)/.test(lower)) {
    traits.push("historic");
  }
  if (/(arts|gallery|theater|theatre)/.test(lower)) {
    traits.push("arts");
  }
  if (/(wine|vineyard)/.test(lower)) {
    traits.push("wine");
  }
  if (/(college|university)/.test(lower)) {
    traits.push("college");
  }
  if (/(boardwalk|pier)/.test(lower)) {
    traits.push("boardwalk", "coastal");
  }
  return traits;
};

const buildPoiDescription = (
  name: string,
  category: LocalPoi["category"] | undefined,
  cityName: string,
  parentName: string | undefined,
  options?: {
    poiCityName?: string;
    distanceMiles?: number;
    localHook?: string;
  }
) => {
  const regionLabel = parentName ? `${parentName} area` : "surrounding region";
  const placeLabel = options?.poiCityName
    ? `${options.poiCityName} area`
    : `${cityName} area`;
  const distanceNote =
    options?.distanceMiles && options.distanceMiles > 1
      ? `about ${Math.round(options.distanceMiles)} miles from ${cityName}`
      : undefined;
  const localHook = options?.localHook;

  const hooks = localHook ? `Pair it with ${localHook}.` : undefined;

  switch (category) {
    case "viewpoint":
      return [
        `${name} is a scenic overlook in the ${placeLabel} with wide views over the ${regionLabel}.`,
        distanceNote
          ? `It sits ${distanceNote} and is ideal for sunrise or sunset photos.`
          : "Visit near sunrise or sunset for the best light and open-sky panoramas.",
        hooks,
      ]
        .filter(Boolean)
        .join(" ");
    case "trail":
      return [
        `${name} is a go-to trail in the ${placeLabel} that showcases the outdoor side of ${cityName}.`,
        distanceNote
          ? `The trailhead is ${distanceNote}, making it an easy half-day outing.`
          : "Expect well-marked paths, natural viewpoints, and a steady pace for a relaxed hike.",
        hooks,
      ]
        .filter(Boolean)
        .join(" ");
    case "boulder-area":
      return [
        `${name} features iconic rock formations in the ${placeLabel} for short scrambles and photo stops.`,
        distanceNote
          ? `It is ${distanceNote} and rewards a quick detour with big scenery.`
          : "The boulder fields create quick, adventurous routes without a long trek.",
        hooks,
      ]
        .filter(Boolean)
        .join(" ");
    case "visitor-center":
      return [
        `${name} is the best starting point in the ${placeLabel} for maps, ranger tips, and trail updates.`,
        distanceNote
          ? `It is ${distanceNote}, so you can stop in before heading out.`
          : "Use it to confirm conditions before exploring nearby parks and trails.",
        hooks,
      ]
        .filter(Boolean)
        .join(" ");
    case "historic-site":
      return [
        `${name} highlights the historic side of the ${placeLabel} with preserved architecture and local stories.`,
        distanceNote
          ? `It sits ${distanceNote} and makes an easy cultural stop.`
          : "Plan time for interpretive exhibits, guided tours, or a slow photo walk.",
        hooks,
      ]
        .filter(Boolean)
        .join(" ");
    case "park":
      return [
        `${name} is a local park in the ${placeLabel} with easy walking loops and picnic-friendly spaces.`,
        distanceNote
          ? `It is ${distanceNote}, perfect for a quick outdoor reset.`
          : "Expect open lawns, shaded paths, and a relaxed pace close to town.",
        hooks,
      ]
        .filter(Boolean)
        .join(" ");
    default:
      return [
        `${name} is a standout stop in the ${placeLabel} that adds variety to your time in ${cityName}.`,
        distanceNote
          ? `It is ${distanceNote}, so it fits easily into a half-day plan.`
          : "Plan for a short visit that still feels tied to the local landscape.",
        hooks,
      ]
        .filter(Boolean)
        .join(" ");
  }
};

const buildNearbyDestinationDescription = (
  destination: NearbyDestination,
  cityName: string,
  parentName?: string,
  options?: {
    regionType?: "state" | "country";
    cityFacts?: CityFacts;
  }
) => {
  const destinationName = destination.name;
  const destinationKey = `${destination.stateSlug}/${destination.citySlug}`;
  const destinationMeta = getCityBySlugs(
    destination.stateSlug,
    destination.citySlug
  );
  const stateName = getStateName(destination.stateSlug);
  const traits = new Set<DestinationTrait>([
    ...(DESTINATION_TRAIT_OVERRIDES[destinationKey] ?? []),
    ...inferTraitsFromName(destinationName),
    ...(destinationMeta?.activityTags
      ?.map(tag => ACTIVITY_TAG_TRAITS[tag])
      .filter(Boolean) ?? []),
  ]);

  if (COASTAL_STATE_SLUGS.has(destination.stateSlug)) {
    traits.add("coastal");
  }
  if (MOUNTAIN_STATE_SLUGS.has(destination.stateSlug)) {
    traits.add("mountain");
  }
  if (DESERT_STATE_SLUGS.has(destination.stateSlug)) {
    traits.add("desert");
  }

  const primaryTrait =
    DESTINATION_TRAIT_PRIORITY.find(trait => traits.has(trait)) ?? "parks";
  const distance = Math.round(destination.distanceMiles);
  const driveBucket =
    destination.distanceMiles <= 25
      ? "quick hop"
      : destination.distanceMiles <= 45
        ? "short drive"
        : "longer day trip";
  const tripType =
    destination.distanceMiles <= 30 ? "half-day escape" : "day trip";
  const regionLabel = parentName ? `${parentName} area` : "surrounding region";
  const localHook =
    options?.cityFacts?.outdoors?.[0] ??
    options?.cityFacts?.anchors?.[0] ??
    options?.cityFacts?.corridors?.[0];

  const traitLabelMap: Record<DestinationTrait, string> = {
    coastal: "coastal town",
    waterfront: "waterfront stop",
    historic: "historic district",
    mountain: "mountain gateway",
    desert: "desert outpost",
    lake: "lakefront spot",
    river: "riverfront stop",
    arts: "arts-forward downtown",
    food: "food-focused destination",
    family: "family-friendly stop",
    boardwalk: "boardwalk town",
    island: "island escape",
    parks: "outdoor basecamp",
    wine: "wine-country stop",
    college: "college-town escape",
    music: "music-forward downtown",
  };

  const activityLabelMap: Record<DestinationTrait, string> = {
    coastal: "beach walks, salty-air viewpoints, and breezy shoreline paths",
    waterfront: "harbor views, waterfront promenades, and casual seafood stops",
    historic:
      "historic blocks, local museums, and architecture-focused strolls",
    mountain: "trailheads, scenic overlooks, and cooler highland air",
    desert: "sunset viewpoints, open-sky drives, and quiet desert trails",
    lake: "lakefront walks, calm-water paddling, and picnic-ready shorelines",
    river: "riverwalks, bridge views, and shaded park paths",
    arts: "galleries, markets, and creative neighborhoods",
    food: "local cafés, markets, and signature restaurants",
    family: "boardwalk games, easy walks, and low-key activities",
    boardwalk: "boardwalk strolls, classic shoreline snacks, and ocean breezes",
    island: "beach access, scenic overlooks, and a slower pace",
    parks: "park loops, easy trails, and scenic green space",
    wine: "tasting rooms, vineyard views, and relaxed afternoon pacing",
    college: "campus walks, bookshops, and local cafés",
    music: "live-music venues, nightlife, and walkable downtown blocks",
  };

  const description = [
    `Nearby day trip: ${destinationName} is a ${
      traitLabelMap[primaryTrait]
    } in ${stateName || regionLabel}, about ${distance} miles from ${cityName}.`,
    `It is a ${driveBucket} from ${cityName} with time for ${activityLabelMap[primaryTrait]}.`,
    localHook
      ? `Back in ${cityName}, pair the outing with ${localHook}.`
      : `Plan it as a ${tripType} and return to ${cityName} by evening.`,
  ]
    .filter(Boolean)
    .join(" ");

  if (containsBannedTopThingPhrase(description)) {
    return [
      `Nearby day trip: ${destinationName} sits ${distance} miles from ${cityName}.`,
      `Expect ${activityLabelMap[primaryTrait]} on a ${driveBucket}.`,
      localHook
        ? `Finish back in ${cityName} with ${localHook}.`
        : `Keep it to a ${tripType} and return to ${cityName} by evening.`,
    ].join(" ");
  }

  return description;
};

type CityLookup = {
  parentSlug: string;
  citySlug: string;
  tier: 1 | 2;
};

export const isPoiInCity = (
  poi: { lat: number; lng: number },
  city: CityLookup
) => {
  const origin = getCityCoordinates(city.parentSlug, city.citySlug);
  if (!origin) {
    return city.tier !== 1;
  }

  const distance = haversineMiles(origin, { lat: poi.lat, lng: poi.lng });
  const maxMiles =
    city.tier === 1
      ? (TIER1_CITY_RADIUS_MILES[city.citySlug] ?? 15)
      : MAX_NEARBY_MILES;

  return distance <= maxMiles;
};

type BuildTopThingsOptions = {
  maxItems?: number;
  minItems?: number;
  regionType?: "state" | "country";
  parentName?: string;
  cityFacts?: CityFacts;
};

type ArchetypeContext = {
  cityName: string;
  parentName?: string;
  parentSlug: string;
  regionType: "state" | "country";
  settlementType: CityFacts["type"];
  isCoastal: boolean;
  isMountain: boolean;
  isDesert: boolean;
  isUrban: boolean;
  isHistoric: boolean;
  isRiverState: boolean;
};

type ArchetypeDefinition = {
  title: string;
  activityType: string;
  appliesTo: (context: ArchetypeContext) => boolean;
  buildDescription: (context: ArchetypeContext) => string;
};

const getSettlementType = (
  cityFacts: CityFacts | undefined,
  regionType: "state" | "country",
  parentSlug: string
): CityFacts["type"] => {
  if (cityFacts?.type) {
    return cityFacts.type;
  }

  if (regionType === "state") {
    if (COASTAL_STATE_SLUGS.has(parentSlug)) {
      return "coastal-town";
    }
    if (MOUNTAIN_STATE_SLUGS.has(parentSlug)) {
      return "mountain-town";
    }
    if (DESERT_STATE_SLUGS.has(parentSlug)) {
      return "desert-town";
    }
  }

  return "town";
};

const buildArchetypeCandidates = (
  context: ArchetypeContext
): TopThingCandidate[] => {
  const definitions: ArchetypeDefinition[] = [
    {
      title: "Historic Downtown Walking Routes",
      activityType: "archetype",
      appliesTo: () => true,
      buildDescription: ({ cityName }) =>
        `Historic downtown walking routes in ${cityName} deliver architecture, storefronts, and easy sightseeing in a compact area. These short loops are perfect for a relaxed stroll with coffee stops and people-watching.`,
    },
    {
      title: "Regional Park and Preserve Trails",
      activityType: "archetype",
      appliesTo: () => true,
      buildDescription: ({ cityName }) =>
        `Regional parks and preserves near ${cityName} are ideal for nature loop hikes and family-friendly outdoor escapes. Expect well-marked trails, native landscapes, and quiet picnic areas for a slower pace.`,
    },
    {
      title: "Scenic Drive Loops",
      activityType: "archetype",
      appliesTo: () => true,
      buildDescription: ({ cityName, parentName }) => {
        const regionLabel = parentName
          ? `the ${parentName} area`
          : "the surrounding region";
        return `Plan a scenic drive loop around ${cityName} to link overlooks, trailheads, and quiet backroads. It is a flexible way to see more of ${regionLabel} without committing to a long hike.`;
      },
    },
    {
      title: "Local Greenways and Easy Nature Walks",
      activityType: "archetype",
      appliesTo: () => true,
      buildDescription: ({ cityName }) =>
        `Local greenways in ${cityName} are perfect for easy walks, casual bike rides, and family-friendly nature strolls. These routes keep you close to town while still feeling outdoorsy.`,
    },
    {
      title: "Viewpoint Overlooks and Photo Stops",
      activityType: "archetype",
      appliesTo: ({ isUrban, isHistoric }) => !isUrban || isHistoric,
      buildDescription: ({ cityName }) =>
        `Short viewpoint walks around ${cityName} create quick wins for panoramic photos and big-sky scenery. They are great add-ons between meals or before a longer trail.`,
    },
    {
      title: "Scenic Coastal Bluff Walks",
      activityType: "archetype",
      appliesTo: ({ isCoastal }) => isCoastal,
      buildDescription: ({ cityName }) =>
        `Scenic coastal bluff walks near ${cityName} deliver ocean panoramas, breezy trails, and dramatic cliffside views. Go early for calmer light and a quiet path that highlights the coastline.`,
    },
    {
      title: "Waterfront Promenade Strolls",
      activityType: "archetype",
      appliesTo: ({ isCoastal }) => isCoastal,
      buildDescription: ({ cityName }) =>
        `Waterfront promenade strolls in ${cityName} pair gentle sea breezes with wide, family-friendly paths. It is a relaxed way to take in harbor views and sunset light without a long outing.`,
    },
    {
      title: "Family-Friendly Beachfront Paths",
      activityType: "archetype",
      appliesTo: ({ isCoastal }) => isCoastal,
      buildDescription: ({ cityName }) =>
        `Family-friendly beachfront paths near ${cityName} combine sand access with paved walking routes for an easy afternoon. Expect stroller-friendly stretches, tide watching, and casual picnic spots.`,
    },
    {
      title: "Foothill and Ridgeline Hikes",
      activityType: "archetype",
      appliesTo: ({ isMountain }) => isMountain,
      buildDescription: ({ cityName }) =>
        `Foothill and ridgeline hikes outside ${cityName} deliver sweeping elevation views without an all-day trek. Look for classic mountain photo spots, rocky overlooks, and cooler air.`,
    },
    {
      title: "Mountain Lake Shoreline Walks",
      activityType: "archetype",
      appliesTo: ({ isMountain }) => isMountain,
      buildDescription: ({ cityName }) =>
        `Mountain lake shoreline walks near ${cityName} mix reflective water with alpine backdrops for a mellow outing. These easy paths are great for birdwatching and relaxed sunset loops.`,
    },
    {
      title: "Desert Preserve Loop Trails",
      activityType: "archetype",
      appliesTo: ({ isDesert }) => isDesert,
      buildDescription: ({ cityName }) =>
        `Desert preserve loop trails near ${cityName} highlight native cacti, open vistas, and quiet nature walks. Go early or late for cooler temperatures and warm desert light.`,
    },
    {
      title: "Canyon and Oasis Walks",
      activityType: "archetype",
      appliesTo: ({ isDesert }) => isDesert,
      buildDescription: ({ cityName }) =>
        `Canyon and oasis walks around ${cityName} offer shade pockets, textured rock walls, and dramatic desert scenery. These short routes feel adventurous without requiring a full-day plan.`,
    },
    {
      title: "Cultural District Galleries and Markets",
      activityType: "archetype",
      appliesTo: ({ isUrban, isHistoric }) => isUrban || isHistoric,
      buildDescription: ({ cityName }) =>
        `Cultural district galleries and markets in ${cityName} combine walkable blocks with public art and local makers. Plan an afternoon of browsing, then linger for a café break or evening lights.`,
    },
    {
      title: "Historic Main Street Cafés and Shops",
      activityType: "archetype",
      appliesTo: ({ isUrban, isHistoric }) => isUrban || isHistoric,
      buildDescription: ({ cityName }) =>
        `Historic main street corridors in ${cityName} are ideal for a relaxed afternoon with cafés, boutiques, and classic architecture. It is an easy, low-effort way to experience local character.`,
    },
    {
      title: "Riverfront Paths and Bridge Views",
      activityType: "archetype",
      appliesTo: ({ isRiverState, isCoastal }) => isRiverState && !isCoastal,
      buildDescription: ({ cityName }) =>
        `Riverfront paths in ${cityName} offer flat, scenic walking routes with bridges, parks, and skyline views. These calm trails are great for jogs, bike rides, and sunset strolls.`,
    },
  ];

  return definitions
    .filter(definition => definition.appliesTo(context))
    .map(definition => ({
      name: definition.title,
      source: "archetype",
      description: definition.buildDescription(context),
      activityType: definition.activityType,
    }));
};

export const buildTopThingsToDo = (
  cityName: string,
  parentSlug: string,
  citySlug: string,
  maxItemsOrOptions: number | BuildTopThingsOptions = {}
): TopThingListItem[] => {
  const options =
    typeof maxItemsOrOptions === "number"
      ? { maxItems: maxItemsOrOptions }
      : maxItemsOrOptions;
  const maxItems = options.maxItems ?? 15;
  const minItems = options.minItems ?? 10;
  const regionType = options.regionType ?? "state";
  const parentName = options.parentName;
  const isTier1Us = regionType === "state" && isTier1City(citySlug);
  const isTier1Intl =
    regionType === "country" && isTier1IntlCity(parentSlug, citySlug);
  const tier = isTier1Us || isTier1Intl ? 1 : 2;

  if (tier === 1) {
    const tier1Pois =
      regionType === "country"
        ? getTier1IntlPoisForCity(parentSlug, citySlug)
        : getTier1PoisForCity(parentSlug, citySlug);
    const filteredPois = tier1Pois.filter(
      poi =>
        isPoiInCity(poi, { parentSlug, citySlug, tier }) &&
        poi.description.trim().length >= MIN_TIER1_DESCRIPTION_LENGTH
    );

    if (filteredPois.length < MIN_TIER1_ITEMS) {
      console.warn(
        `Tier-1 POI coverage warning for ${parentSlug}/${citySlug}: ${filteredPois.length} items.`
      );
    }

    return filteredPois.slice(0, maxItems).map(poi => ({
      title: poi.name,
      description: poi.description.trim(),
    }));
  }
  const settlementType = getSettlementType(
    options.cityFacts,
    regionType,
    parentSlug
  );
  const archetypeContext: ArchetypeContext = {
    cityName,
    parentName,
    parentSlug,
    regionType,
    settlementType,
    isCoastal: settlementType === "coastal-town",
    isMountain: settlementType === "mountain-town",
    isDesert: settlementType === "desert-town",
    isUrban: settlementType === "urban",
    isHistoric: settlementType === "historic-district",
    isRiverState: regionType === "state" && RIVER_HINT_STATES.has(parentSlug),
  };

  const localPois = getLocalPoisForCity(parentSlug, citySlug);
  const nearbyPois = getNearbyPoisForCity(parentSlug, citySlug);
  const localPoiNames = buildLocalPoiNameSet(localPois);
  const nearbyPoiNames = buildLocalPoiNameSet(nearbyPois);
  const curatedPoiNames = new Set([...localPoiNames, ...nearbyPoiNames]);
  const nearbyDestinationAllowlist =
    tier === 2 && regionType === "state"
      ? getNearbyDestinationAllowlist(parentSlug, regionType, options.cityFacts)
      : null;
  const nearbyDestinations = getNearbyDestinations(parentSlug, citySlug).filter(
    destination => {
      if (!nearbyDestinationAllowlist) {
        return true;
      }
      const normalized = normalizePlaceName(destination.name);
      return normalized && nearbyDestinationAllowlist.has(normalized);
    }
  );
  const nearbyDestinationNames = new Set(
    nearbyDestinations.map(destination => normalizePlaceName(destination.name))
  );

  const localPoiCandidates: TopThingCandidate[] = localPois.map(poi => ({
    name: poi.name,
    source: "local-poi",
    category: poi.category,
  }));
  const nearbyPoiCandidates: TopThingCandidate[] = nearbyPois.map(poi => ({
    name: poi.name,
    source: "nearby-poi",
    category: poi.category,
  }));
  const nearbyCandidates: TopThingCandidate[] = nearbyDestinations.map(
    destination => ({
      name: destination.name,
      source: "nearby-destination",
    })
  );

  const candidates = filterTopThingsByRules(
    [...localPoiCandidates, ...nearbyPoiCandidates, ...nearbyCandidates],
    curatedPoiNames,
    cityName
  );

  const fallbackNames =
    CITY_TOP_THINGS_FALLBACKS[buildCityKey(parentSlug, citySlug)] ?? [];
  const withBackfill = applyTopThingsBackfill(
    candidates,
    fallbackNames,
    curatedPoiNames,
    nearbyDestinationNames
  );

  const withArchetypes = (() => {
    if (withBackfill.length >= minItems) {
      return withBackfill;
    }

    const archetypes = buildArchetypeCandidates(archetypeContext);
    const seen = new Set(
      withBackfill.map(item => normalizePlaceName(item.name))
    );
    const combined = [...withBackfill];
    archetypes.forEach(archetype => {
      if (combined.length >= minItems) {
        return;
      }
      const normalized = normalizePlaceName(archetype.name);
      if (!normalized || seen.has(normalized)) {
        return;
      }
      combined.push(archetype);
      seen.add(normalized);
    });

    return combined;
  })();

  return withArchetypes.slice(0, maxItems).map(candidate => {
    const title = toTitleCase(candidate.name);
    const normalizedName = normalizePlaceName(candidate.name);
    const localPoi = localPois.find(
      poi => normalizePlaceName(poi.name) === normalizedName
    );
    const nearbyPoi = nearbyPois.find(
      poi => normalizePlaceName(poi.name) === normalizedName
    );
    const nearbyDestination = nearbyDestinations.find(
      destination => normalizePlaceName(destination.name) === normalizedName
    );
    const localHook =
      options.cityFacts?.outdoors?.[0] ??
      options.cityFacts?.anchors?.[0] ??
      options.cityFacts?.corridors?.[0];
    const description =
      candidate.description ??
      (localPoi || nearbyPoi
        ? buildPoiDescription(title, candidate.category, cityName, parentName, {
            poiCityName: nearbyPoi
              ? getCityName(nearbyPoi.stateSlug, nearbyPoi.citySlug)
              : undefined,
            distanceMiles: nearbyPoi?.distanceMiles,
            localHook,
          })
        : nearbyDestination
          ? buildNearbyDestinationDescription(
              nearbyDestination,
              cityName,
              parentName,
              {
                regionType,
                cityFacts: options.cityFacts,
              }
            )
          : buildPoiDescription(
              title,
              candidate.category,
              cityName,
              parentName,
              {
                localHook,
              }
            ));
    const safeDescription = containsBannedTopThingPhrase(description)
      ? nearbyDestination
        ? buildNearbyDestinationDescription(nearbyDestination, cityName, parentName, {
            regionType,
            cityFacts: options.cityFacts,
          })
        : `Spend time at ${title} to experience the scenery and local character around ${cityName}. Plan for a focused visit that fits easily into a half-day outing.`
      : description;

    return {
      title,
      description: safeDescription,
      activityType: candidate.activityType,
    };
  });
};

export const getTopThingAuditContext = (
  parentSlug: string,
  citySlug: string,
  options?: { allowedStates?: Set<string> | null }
) => {
  const origin = getCityCoordinates(parentSlug, citySlug);
  const localPois = getLocalPoisForCity(parentSlug, citySlug);
  const localPoiNames = buildLocalPoiNameSet(localPois);
  const allDestinations = getDestinationList();
  const allowedStates = options?.allowedStates;
  const destinationNameMatches = (() => {
    const index = getDestinationNameIndex();
    if (!allowedStates) {
      return index;
    }
    const filtered = new Map<string, DestinationMatch[]>();
    index.forEach((matches, key) => {
      const allowedMatches = matches.filter(match =>
        allowedStates.has(match.stateSlug)
      );
      if (allowedMatches.length) {
        filtered.set(key, allowedMatches);
      }
    });
    return filtered;
  })();
  const destinationDistanceMap = new Map<string, number>();

  if (origin) {
    allDestinations.forEach(destination => {
      if (allowedStates && !allowedStates.has(destination.stateSlug)) {
        return;
      }
      if (!hasValidCoordinates(destination.lat, destination.lng)) {
        return;
      }
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
    destinationNameMatches,
    destinationDistanceMap,
  };
};
