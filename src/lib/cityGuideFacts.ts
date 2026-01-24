import type { CityLandmarkMetadata } from "../data/cityLandmarks";
import { cityContext } from "../data/cityContext";
import type { Tour } from "../data/tours.types";

export type SettlementType =
  | "urban"
  | "mountain-town"
  | "coastal-town"
  | "desert-town"
  | "historic-district"
  | "town";

export type CityFacts = {
  type: SettlementType;
  anchors: string[];
  corridors: string[];
  outdoors: string[];
  nearby: string[];
};

type CityFactsInput = {
  cityName: string;
  citySlug: string;
  parentName: string;
  parentSlug: string;
  regionType: "state" | "country";
  tours: Tour[];
  landmarks: {
    neighborhoods: string[];
    districts: string[];
    outdoors: string[];
  } | null;
  metadata: CityLandmarkMetadata | null;
};

const STATE_ABBREVIATIONS: Record<string, string> = {
  alabama: "al",
  alaska: "ak",
  arizona: "az",
  arkansas: "ar",
  california: "ca",
  colorado: "co",
  connecticut: "ct",
  delaware: "de",
  florida: "fl",
  georgia: "ga",
  hawaii: "hi",
  idaho: "id",
  illinois: "il",
  indiana: "in",
  iowa: "ia",
  kansas: "ks",
  kentucky: "ky",
  louisiana: "la",
  maine: "me",
  maryland: "md",
  massachusetts: "ma",
  michigan: "mi",
  minnesota: "mn",
  mississippi: "ms",
  missouri: "mo",
  montana: "mt",
  nebraska: "ne",
  nevada: "nv",
  "new-hampshire": "nh",
  "new-jersey": "nj",
  "new-mexico": "nm",
  "new-york": "ny",
  "north-carolina": "nc",
  "north-dakota": "nd",
  ohio: "oh",
  oklahoma: "ok",
  oregon: "or",
  pennsylvania: "pa",
  "rhode-island": "ri",
  "south-carolina": "sc",
  "south-dakota": "sd",
  tennessee: "tn",
  texas: "tx",
  utah: "ut",
  vermont: "vt",
  virginia: "va",
  washington: "wa",
  "west-virginia": "wv",
  wisconsin: "wi",
  wyoming: "wy",
  "district-of-columbia": "dc",
};

const MAJOR_METRO_SLUGS = new Set([
  "new-york",
  "los-angeles",
  "chicago",
  "denver",
  "seattle",
  "portland",
  "san-francisco",
  "boston",
  "miami",
  "austin",
  "atlanta",
  "san-diego",
  "las-vegas",
  "phoenix",
  "philadelphia",
  "houston",
  "dallas",
  "washington",
  "nashville",
  "new-orleans",
  "minneapolis",
  "charlotte",
  "orlando",
  "toronto",
  "vancouver",
  "montreal",
  "london",
  "paris",
  "rome",
  "madrid",
  "barcelona",
  "lisbon",
  "amsterdam",
  "berlin",
]);

const COASTAL_STATE_SLUGS = new Set([
  "california",
  "oregon",
  "washington",
  "florida",
  "maine",
  "massachusetts",
  "new-hampshire",
  "rhode-island",
  "connecticut",
  "new-jersey",
  "delaware",
  "maryland",
  "virginia",
  "north-carolina",
  "south-carolina",
  "georgia",
  "alabama",
  "mississippi",
  "louisiana",
  "texas",
  "alaska",
  "hawaii",
]);

const MOUNTAIN_STATE_SLUGS = new Set([
  "colorado",
  "utah",
  "wyoming",
  "montana",
  "idaho",
  "new-mexico",
  "arizona",
  "nevada",
]);

const DESERT_STATE_SLUGS = new Set([
  "arizona",
  "new-mexico",
  "nevada",
  "utah",
  "california",
]);

const STATE_NEARBY_ANCHORS: Record<string, string[]> = {
  colorado: ["Boulder", "Golden", "Fort Collins", "Colorado Springs"],
  oregon: ["Columbia River Gorge", "Mount Hood", "Willamette Valley"],
  washington: ["Puget Sound", "Olympic Peninsula", "Snoqualmie Pass"],
  california: ["Monterey", "Napa Valley", "Big Sur"],
  arizona: ["Sedona", "Flagstaff", "Sonoran Desert"],
  utah: ["Park City", "Wasatch Range", "Moab"],
  florida: ["Everglades", "Florida Keys", "Gulf Coast"],
  texas: ["Hill Country", "San Antonio", "Galveston"],
  "new-york": ["Hudson Valley", "Long Island", "Catskills"],
  "north-carolina": ["Blue Ridge Parkway", "Outer Banks", "Asheville"],
  "south-carolina": ["Charleston", "Hilton Head", "Lowcountry"],
  georgia: ["Savannah", "Tybee Island", "North Georgia mountains"],
  maine: ["Acadia National Park", "Portland, Maine", "Midcoast"],
  massachusetts: ["Cape Cod", "Salem", "Berkshires"],
};

const STATE_OUTDOOR_HINTS: Record<string, string[]> = {
  colorado: ["Front Range foothills", "South Platte River Trail"],
  oregon: ["forested greenways", "riverfront paths"],
  washington: ["lakefront parks", "evergreen greenways"],
  california: ["coastal bluffs", "regional parklands"],
  arizona: ["red rock trails", "desert preserves"],
  utah: ["canyon overlooks", "high desert trails"],
  florida: ["waterfront parks", "coastal preserves"],
  texas: ["river trails", "hill country overlooks"],
  "north-carolina": ["mountain overlooks", "river greenways"],
};

const RIVER_HINT_STATES = new Set([
  "colorado",
  "oregon",
  "washington",
  "california",
  "utah",
  "montana",
  "idaho",
  "missouri",
  "tennessee",
  "kentucky",
  "arkansas",
  "alabama",
  "georgia",
  "north-carolina",
  "south-carolina",
]);

const COASTAL_KEYWORDS = [
  "beach",
  "harbor",
  "island",
  "coast",
  "bay",
  "ocean",
  "sea",
  "marina",
  "pier",
  "shore",
];

const MOUNTAIN_KEYWORDS = [
  "mountain",
  "alpine",
  "peak",
  "ridge",
  "summit",
  "canyon",
  "foothill",
  "glacier",
];

const DESERT_KEYWORDS = ["desert", "canyon", "mesa", "red rock", "dunes"];

const HISTORIC_KEYWORDS = ["historic", "heritage", "old town", "mining"];

const uniqueValues = (items: string[], limit?: number) => {
  const seen = new Set<string>();
  const results: string[] = [];

  items.forEach((item) => {
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }

    seen.add(trimmed);
    results.push(trimmed);
  });

  return typeof limit === "number" ? results.slice(0, limit) : results;
};

const getCityContextKey = (parentSlug: string, citySlug: string) => {
  const stateAbbreviation = STATE_ABBREVIATIONS[parentSlug];
  const contextSuffix = stateAbbreviation ?? parentSlug;
  return `${citySlug}-${contextSuffix}`;
};

const getCityContext = (parentSlug: string, citySlug: string) =>
  cityContext[getCityContextKey(parentSlug, citySlug)] ?? null;

const hasKeyword = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

const getSettlementType = ({
  cityName,
  citySlug,
  parentSlug,
  regionType,
  tours,
}: CityFactsInput): SettlementType => {
  const context = getCityContext(parentSlug, citySlug);
  if (context?.type) {
    return context.type;
  }

  const tourText = tours.map((tour) => tour.title).join(" ").toLowerCase();
  const hasCoastal = hasKeyword(tourText, COASTAL_KEYWORDS);
  const hasMountain = hasKeyword(tourText, MOUNTAIN_KEYWORDS);
  const hasDesert = hasKeyword(tourText, DESERT_KEYWORDS);
  const hasHistoric = hasKeyword(tourText, HISTORIC_KEYWORDS);
  const hasAdventure = tours.some((tour) =>
    ["hiking", "cycling", "canoeing"].some((slug) =>
      tour.activitySlugs.includes(slug),
    ),
  );

  if (MAJOR_METRO_SLUGS.has(citySlug) || tours.length >= 35) {
    return "urban";
  }

  if (
    regionType === "state" &&
    COASTAL_STATE_SLUGS.has(parentSlug) &&
    hasCoastal
  ) {
    return "coastal-town";
  }

  if (
    regionType === "state" &&
    MOUNTAIN_STATE_SLUGS.has(parentSlug) &&
    (hasMountain || hasAdventure || cityName.toLowerCase().includes("city"))
  ) {
    return "mountain-town";
  }

  if (regionType === "state" && DESERT_STATE_SLUGS.has(parentSlug) && hasDesert) {
    return "desert-town";
  }

  if (hasHistoric) {
    return "historic-district";
  }

  return "town";
};

const buildAnchorPlaceholders = (
  cityName: string,
  type: SettlementType,
  parentSlug: string,
) => {
  const isRiverState = RIVER_HINT_STATES.has(parentSlug);

  switch (type) {
    case "urban":
      return uniqueValues([
        `Downtown ${cityName}`,
        `${cityName} Arts District`,
        `Historic ${cityName}`,
        `${cityName} Central Core`,
        isRiverState ? `${cityName} Riverfront` : `${cityName} Central Market`,
      ]);
    case "coastal-town":
      return uniqueValues([
        `${cityName} Waterfront`,
        `${cityName} Harbor`,
        `${cityName} Beachfront`,
        `Old Town ${cityName}`,
        `${cityName} Promenade`,
      ]);
    case "desert-town":
      return uniqueValues([
        `Historic Downtown ${cityName}`,
        `${cityName} Arts District`,
        `${cityName} Desert Overlook`,
        `Old Town ${cityName}`,
        `${cityName} Scenic Loop`,
      ]);
    case "mountain-town":
      return uniqueValues([
        `Historic Downtown ${cityName}`,
        `${cityName} Main Street`,
        `${cityName} Trailhead District`,
        `Old Town ${cityName}`,
        `${cityName} Scenic Loop`,
      ]);
    case "historic-district":
      return uniqueValues([
        `Historic Downtown ${cityName}`,
        `Old Town ${cityName}`,
        `${cityName} Heritage Row`,
        `${cityName} Main Street`,
        `${cityName} Riverwalk`,
      ]);
    default:
      return uniqueValues([
        `Historic Downtown ${cityName}`,
        `${cityName} Main Street`,
        `Old Town ${cityName}`,
        `${cityName} Arts Quarter`,
        `${cityName} Central Plaza`,
      ]);
  }
};

const buildNearbyFallback = (
  cityName: string,
  type: SettlementType,
  parentSlug: string,
) => {
  const regionalAnchors = STATE_NEARBY_ANCHORS[parentSlug] ?? [];
  if (regionalAnchors.length) {
    return regionalAnchors;
  }

  switch (type) {
    case "coastal-town":
      return [`${cityName} Coastal Drive`, `${cityName} Lighthouse Point`];
    case "mountain-town":
      return [`${cityName} Scenic Byway`, `${cityName} Overlook Loop`];
    case "desert-town":
      return [`${cityName} Desert Scenic Drive`, `${cityName} Canyon Loop`];
    default:
      return [
        `${cityName} Scenic Byway`,
        `${cityName} Regional Parklands`,
      ];
  }
};

const buildOutdoorPlaceholders = (
  cityName: string,
  type: SettlementType,
  parentSlug: string,
) => {
  const stateHints = STATE_OUTDOOR_HINTS[parentSlug] ?? [];
  const isRiverState = RIVER_HINT_STATES.has(parentSlug);
  const base = [
    `${cityName} Regional Park`,
    isRiverState ? `${cityName} Riverwalk` : `${cityName} Greenway`,
  ];

  const typeSpecific =
    type === "coastal-town"
      ? [`${cityName} Coastal Trail`, `${cityName} Beachfront`]
      : type === "mountain-town"
        ? [`${cityName} Trailhead Network`, `${cityName} Scenic Overlook`]
        : type === "desert-town"
          ? [`${cityName} Desert Preserve`, `${cityName} Canyon Viewpoint`]
          : [`${cityName} Nature Preserve`, `${cityName} Viewpoint Loop`];

  return uniqueValues([...stateHints, ...base, ...typeSpecific]);
};

export const buildCityGuideFacts = (input: CityFactsInput): CityFacts => {
  const type = getSettlementType(input);
  const context = getCityContext(input.parentSlug, input.citySlug);
  const anchorCandidates = uniqueValues([
    ...(context?.anchors ?? []),
    ...(input.metadata?.neighborhoods ?? []),
    ...(input.landmarks?.neighborhoods ?? []),
    ...(input.landmarks?.districts ?? []),
  ]);

  const anchors = uniqueValues([
    ...anchorCandidates,
    ...buildAnchorPlaceholders(input.cityName, type, input.parentSlug),
  ]);

  const outdoors = uniqueValues([
    ...(input.landmarks?.outdoors ?? []),
    ...(input.metadata?.scenicAreas ?? []),
    ...buildOutdoorPlaceholders(input.cityName, type, input.parentSlug),
  ]);

  const nearby = uniqueValues([
    ...(context?.nearby ?? []),
    ...buildNearbyFallback(input.cityName, type, input.parentSlug),
  ]);

  const corridors = uniqueValues([
    `Downtown ${input.cityName}`,
    `${input.cityName} Arts District`,
    `Historic ${input.cityName}`,
  ]);

  return {
    type,
    anchors: anchors.slice(0, type === "urban" ? 10 : 6),
    corridors: corridors.slice(0, 3),
    outdoors: outdoors.slice(0, 6),
    nearby: nearby.slice(0, 4),
  };
};
