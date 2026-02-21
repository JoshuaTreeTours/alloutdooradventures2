import { cleanThingDescription } from "./cleanThingDescription";
import { pickWikiImageUrl } from "../wiki/wikiImageUrl";

export type AuthorityLandmarkSpec = {
  name: string;
  type: string;
  wikiTitles: string[];
};

type StateAuthorityLandmarks = Record<string, AuthorityLandmarkSpec[]>;

const COLORADO_AUTHORITY_LANDMARKS: StateAuthorityLandmarks = {
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

const UTAH_AUTHORITY_LANDMARKS: StateAuthorityLandmarks = {
  "bryce-canyon-city": [
    {
      name: "Bryce Canyon National Park",
      type: "national park",
      wikiTitles: ["Bryce Canyon National Park"],
    },
    {
      name: "Bryce Amphitheater",
      type: "natural amphitheater",
      wikiTitles: ["Bryce Amphitheater", "Bryce Canyon National Park"],
    },
    {
      name: "Sunrise Point",
      type: "viewpoint",
      wikiTitles: ["Sunrise Point", "Bryce Canyon National Park"],
    },
    {
      name: "Sunset Point",
      type: "viewpoint",
      wikiTitles: ["Sunset Point", "Bryce Canyon National Park"],
    },
    {
      name: "Ruby's Inn",
      type: "historic resort complex",
      wikiTitles: ["Ruby's Inn", "Bryce Canyon City, Utah"],
    },
  ],
  hurricane: [
    {
      name: "Sand Hollow State Park",
      type: "state park",
      wikiTitles: ["Sand Hollow State Park", "Sand Hollow Reservoir"],
    },
    {
      name: "Quail Creek State Park",
      type: "state park",
      wikiTitles: ["Quail Creek State Park", "Quail Creek Reservoir"],
    },
    {
      name: "Gooseberry Mesa",
      type: "mesa",
      wikiTitles: ["Gooseberry Mesa", "Hurricane, Utah"],
    },
    {
      name: "Pah Tempe Hot Springs",
      type: "hot springs site",
      wikiTitles: ["Pah Tempe Hot Springs", "La Verkin, Utah"],
    },
    {
      name: "Red Cliffs National Conservation Area",
      type: "conservation area",
      wikiTitles: [
        "Red Cliffs National Conservation Area",
        "Red Cliffs Desert Reserve",
      ],
    },
  ],
  moab: [
    {
      name: "Arches National Park",
      type: "national park",
      wikiTitles: ["Arches National Park"],
    },
    {
      name: "Canyonlands National Park",
      type: "national park",
      wikiTitles: ["Canyonlands National Park"],
    },
    {
      name: "Dead Horse Point State Park",
      type: "state park",
      wikiTitles: ["Dead Horse Point State Park"],
    },
    {
      name: "Colorado River",
      type: "river corridor",
      wikiTitles: ["Colorado River", "Moab, Utah"],
    },
    {
      name: "Slickrock Trail",
      type: "mountain biking trail",
      wikiTitles: ["Slickrock Trail", "Moab, Utah"],
    },
  ],
  springdale: [
    {
      name: "Zion National Park",
      type: "national park",
      wikiTitles: ["Zion National Park"],
    },
    {
      name: "Zion Canyon Scenic Drive",
      type: "scenic park road",
      wikiTitles: ["Zion Canyon Scenic Drive", "Zion National Park"],
    },
    {
      name: "Zion-Mount Carmel Tunnel",
      type: "historic highway tunnel",
      wikiTitles: ["Zion–Mount Carmel Tunnel", "Zion-Mount Carmel Tunnel"],
    },
    {
      name: "Pa'rus Trail",
      type: "multi-use trail",
      wikiTitles: ["Pa'rus Trail", "Zion National Park"],
    },
    {
      name: "Zion Human History Museum",
      type: "park museum",
      wikiTitles: ["Zion Human History Museum", "Zion National Park"],
    },
  ],
  "st-george": [
    {
      name: "Snow Canyon State Park",
      type: "state park",
      wikiTitles: ["Snow Canyon State Park"],
    },
    {
      name: "Red Hills Desert Garden",
      type: "desert botanical garden",
      wikiTitles: ["Red Hills Desert Garden", "St. George, Utah"],
    },
    {
      name: "St. George Utah Temple",
      type: "historic temple",
      wikiTitles: ["St. George Utah Temple"],
    },
    {
      name: "Pioneer Park",
      type: "city park",
      wikiTitles: ["Pioneer Park (St. George, Utah)", "St. George, Utah"],
    },
    {
      name: "Dinosaur Discovery Site at Johnson Farm",
      type: "paleontology museum",
      wikiTitles: [
        "St. George Dinosaur Discovery Site",
        "Dinosaur Discovery Site at Johnson Farm",
      ],
    },
  ],
};

const AUTHORITY_LANDMARKS_BY_STATE: Record<string, StateAuthorityLandmarks> = {
  colorado: COLORADO_AUTHORITY_LANDMARKS,
  utah: UTAH_AUTHORITY_LANDMARKS,
};

const MIN_WORDS = 60;
const MAX_WORDS = 90;

const FORBIDDEN_PHRASES = [
  "practical stop for understanding",
  "orientation stop",
  "surrounding area usually offers",
  "site gives visitors context",
  "identifiable design features",
];

type BuildAuthorityLandmarkArgs = {
  citySlug: string;
  stateSlug: string;
  landmarkSpec: AuthorityLandmarkSpec;
  wikiExtract: string;
  wikiUrl: string;
  pageTitle?: string;
  originalImageUrl?: string | null;
  thumbnailUrl?: string | null;
  fallbackImageUrl?: string | null;
};

export type BuiltAuthorityLandmark = {
  title: string;
  description: string;
  wikiUrl: string;
  imageUrl: string;
};

const wordCount = (value: string) => value.split(/\s+/).filter(Boolean).length;

const ensurePeriod = (value: string) =>
  /[.!?]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`;

const splitSentences = (value: string) =>
  value
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const trimToWordLimit = (value: string, maxWords: number) => {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return value;
  }
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

const withFallbackSentences = (seed: string[], fallback: string[]) => {
  const combined = [...seed];
  for (const sentence of fallback) {
    if (wordCount(combined.join(" ")) >= MIN_WORDS) {
      break;
    }
    combined.push(sentence);
  }
  return combined;
};

export const buildAuthorityLandmark = ({
  citySlug,
  stateSlug,
  landmarkSpec,
  wikiExtract,
  wikiUrl,
  pageTitle,
  originalImageUrl,
  thumbnailUrl,
  fallbackImageUrl,
}: BuildAuthorityLandmarkArgs): BuiltAuthorityLandmark | null => {
  const resolvedImage =
    pickWikiImageUrl({ originalImageUrl, thumbnailUrl }) ?? fallbackImageUrl ?? null;
  if (!resolvedImage) {
    return null;
  }

  const cityName = citySlug
    .split("-")
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
  const summarySentences = splitSentences(wikiExtract).slice(0, 3);

  const initialSentences = [
    `${landmarkSpec.name} is a ${landmarkSpec.type} in ${cityName}, ${stateSlug}.`,
    ...summarySentences,
    pageTitle && pageTitle !== landmarkSpec.name
      ? `${landmarkSpec.name} is documented in Wikipedia records under ${pageTitle}.`
      : "",
  ]
    .filter(Boolean)
    .map(sentence => ensurePeriod(sentence));

  const fallbackSentences = [
    `${landmarkSpec.name} is one of the best-known public landmarks linked to travel patterns around ${cityName}.`,
    `Its geography and management history help explain why this part of ${stateSlug} is a major destination corridor.`,
  ];

  let description = cleanThingDescription(
    withFallbackSentences(initialSentences, fallbackSentences).join(" ")
  );
  description = trimToWordLimit(description, MAX_WORDS);

  if (wordCount(description) < MIN_WORDS) {
    description = trimToWordLimit(
      `${description} ${ensurePeriod(fallbackSentences[fallbackSentences.length - 1])}`,
      MAX_WORDS
    );
  }

  const lowered = description.toLowerCase();
  if (FORBIDDEN_PHRASES.some(phrase => lowered.includes(phrase))) {
    return null;
  }

  if (wordCount(description) < MIN_WORDS || wordCount(description) > MAX_WORDS) {
    return null;
  }

  return {
    title: landmarkSpec.name,
    description,
    wikiUrl,
    imageUrl: resolvedImage,
  };
};

export const getAuthorityLandmarkOverride = (
  citySlug: string,
  stateSlug: string
): AuthorityLandmarkSpec[] | null => {
  const byState = AUTHORITY_LANDMARKS_BY_STATE[stateSlug];
  if (!byState) {
    return null;
  }

  return byState[citySlug] ?? null;
};
