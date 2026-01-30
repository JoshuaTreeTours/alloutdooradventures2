import { getCityCoordinates } from "./cityCoordinates";
import { isTier1IntlCity } from "./cityTier1Intl";
import { isTier1City } from "./cityTier1";
import { cityLocalPois, type LocalPoi } from "./cityLocalPois";
import { getTier1PoisForCity } from "./cityPois/tier1";
import { getTier1IntlPoisForCity } from "./cityPois/tier1Intl";
import { states } from "./destinations";
import type { CityFacts } from "../lib/cityGuideFacts";
import { haversineMiles, normalizePlaceName } from "../utils/geo";

export const MAX_DRIVE_HOURS = 2;
export const ASSUMED_AVG_MPH = 55;
export const MAX_NEARBY_MILES = 60;
export const MIN_TIER1_DESCRIPTION_LENGTH = 240;
export const MIN_TIER1_ITEMS = 8;

const TIER1_CITY_RADIUS_MILES: Record<string, number> = {
  "los-angeles": 20,
  "san-diego": 20,
  "san-francisco": 20,
  "san-jose": 20,
  "sacramento": 20,
  "seattle": 20,
  "portland": 20,
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

const GENERIC_PLACEHOLDER_PHRASES = [
  "central plaza",
  "arts quarter",
  "riverfront walk",
  "regional parklands",
  "scenic viewpoint loop",
];

export type TopThingSource =
  | "local-poi"
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

export const isGenericPlaceholderName = (name: string, cityName: string) => {
  const lower = name.toLowerCase();
  const cityLower = cityName.toLowerCase();

  if (GENERIC_PLACEHOLDER_PHRASES.some((phrase) => lower.includes(phrase))) {
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
  cityName?: string,
) => {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const normalized = normalizePlaceName(candidate.name);
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    if (
      candidate.source !== "archetype" &&
      isDenylistedTopThing(candidate.name) &&
      !localPoiNames.has(normalized)
    ) {
      return false;
    }

    if (
      cityName &&
      isGenericPlaceholderName(candidate.name, cityName) &&
      !localPoiNames.has(normalized)
    ) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const buildLocalPoiDescription = (
  name: string,
  category: LocalPoi["category"] | undefined,
  cityName: string,
  parentName?: string,
) => {
  const regionLabel = parentName ? `${parentName} region` : "surrounding landscape";

  switch (category) {
    case "viewpoint":
      return `${name} delivers panoramic viewpoints over ${cityName} and the ${regionLabel}. Visit near sunrise or sunset for softer light and the best photo angles.`;
    case "trail":
      return `Start at ${name} for a signature trail that highlights the outdoor character of ${cityName}. Expect well-marked paths with scenic overlooks and plenty of space to slow down and explore.`;
    case "boulder-area":
      return `Explore the rock formations around ${name} for a classic scramble-and-photo stop near ${cityName}. The boulder fields create short, adventurous routes with big scenery.`;
    case "visitor-center":
      return `Stop by ${name} to pick up maps, trail updates, and ranger tips for exploring around ${cityName}. It is the best place to confirm conditions before you head out.`;
    case "historic-site":
      return `Spend time at ${name} to connect with ${cityName}'s cultural history and architecture. Plan for a relaxed stroll with photo stops and any seasonal exhibits.`;
    case "park":
      return `Plan a visit to ${name} for a mix of easy walks, picnic spots, and signature landscapes near ${cityName}. It is a low-effort outing that still feels immersive.`;
    default:
      return `Add ${name} to your list for a focused highlight while exploring ${cityName}. It is a simple way to experience the local scenery without a long drive.`;
  }
};

const buildNearbyDestinationDescription = (
  name: string,
  cityName: string,
  parentName?: string,
) => {
  const regionLabel = parentName ? `the ${parentName} area` : "the surrounding region";
  return `Take a short drive from ${cityName} to ${name} for an easy change of scenery. It is a quick way to add variety to your trip while staying close to ${regionLabel}.`;
};

type CityLookup = {
  parentSlug: string;
  citySlug: string;
  tier: 1 | 2;
};

export const isPoiInCity = (
  poi: { lat: number; lng: number },
  city: CityLookup,
) => {
  const origin = getCityCoordinates(city.parentSlug, city.citySlug);
  if (!origin) {
    return city.tier !== 1;
  }

  const distance = haversineMiles(origin, { lat: poi.lat, lng: poi.lng });
  const maxMiles =
    city.tier === 1
      ? TIER1_CITY_RADIUS_MILES[city.citySlug] ?? 15
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
  parentSlug: string,
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

const buildArchetypeCandidates = (context: ArchetypeContext): TopThingCandidate[] => {
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
        const regionLabel = parentName ? `the ${parentName} area` : "the surrounding region";
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
    .filter((definition) => definition.appliesTo(context))
    .map((definition) => ({
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
  maxItemsOrOptions: number | BuildTopThingsOptions = {},
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
      (poi) =>
        isPoiInCity(poi, { parentSlug, citySlug, tier }) &&
        poi.description.trim().length >= MIN_TIER1_DESCRIPTION_LENGTH,
    );

    if (filteredPois.length < MIN_TIER1_ITEMS) {
      console.warn(
        `Tier-1 POI coverage warning for ${parentSlug}/${citySlug}: ${filteredPois.length} items.`,
      );
    }

    return filteredPois.slice(0, maxItems).map((poi) => ({
      title: poi.name,
      description: poi.description.trim(),
    }));
  }
  const settlementType = getSettlementType(options.cityFacts, regionType, parentSlug);
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
    cityName,
  );

  const fallbackNames =
    CITY_TOP_THINGS_FALLBACKS[buildCityKey(parentSlug, citySlug)] ?? [];
  const withBackfill = applyTopThingsBackfill(
    candidates,
    fallbackNames,
    localPoiNames,
    nearbyDestinationNames,
  );

  const withArchetypes = (() => {
    if (withBackfill.length >= minItems) {
      return withBackfill;
    }

    const archetypes = buildArchetypeCandidates(archetypeContext);
    const seen = new Set(
      withBackfill.map((item) => normalizePlaceName(item.name)),
    );
    const combined = [...withBackfill];
    archetypes.forEach((archetype) => {
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

  return withArchetypes.slice(0, maxItems).map((candidate) => {
    const title = toTitleCase(candidate.name);
    const localPoi = localPois.find(
      (poi) => normalizePlaceName(poi.name) === normalizePlaceName(candidate.name),
    );
    const description =
      candidate.description ??
      (localPoi
        ? buildLocalPoiDescription(title, localPoi.category, cityName, parentName)
        : buildNearbyDestinationDescription(title, cityName, parentName));

    return {
      title,
      description,
      activityType: candidate.activityType,
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
