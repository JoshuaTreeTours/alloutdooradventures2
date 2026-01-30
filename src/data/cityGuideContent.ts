import {
  MAX_NEARBY_MILES,
  getTopThingAuditContext,
  isDenylistedTopThing,
  isGenericPlaceholderName,
  MIN_TIER1_DESCRIPTION_LENGTH,
  MIN_TIER1_ITEMS,
} from "./cityTopThings";
import { getTier1PoiNameSet } from "./cityPois/tier1";
import { normalizePlaceName } from "../utils/geo";

export type CityGuideIssue = {
  issueType: string;
  matchedText: string;
  contextSnippet: string;
  severity: "info" | "warn" | "error";
  suggestedFix?: string;
};

export type CityGuideTextContent = {
  intro?: string;
  bestTimeToVisit?: string;
  whatToPack?: string;
  itineraries?: Array<{ title?: string; description?: string }>;
  thingsToDoSections?: Array<{ title?: string; paragraphs?: string[] }>;
  topThingsToDo?: Array<{
    title?: string;
    description?: string;
    activityType?: string;
  }>;
  extraText?: string[];
};

type CityGuideAuditContext = {
  cityName: string;
  citySlug: string;
  parentSlug: string;
  regionType: "state" | "country";
  tier: 1 | 2;
  knownPois?: Set<string>;
};

const RIVERWALK_ALLOWLIST = new Set(["san-antonio", "chicago", "tampa"]);

const DAY_TRIP_DENYLIST: Array<{
  destination: string;
  allowCities: Set<string>;
}> = [
  {
    destination: "napa",
    allowCities: new Set([
      "san-francisco",
      "oakland",
      "san-jose",
      "sacramento",
      "napa",
    ]),
  },
  {
    destination: "yosemite",
    allowCities: new Set(["fresno", "mariposa", "oakhurst", "merced"]),
  },
  {
    destination: "grand canyon",
    allowCities: new Set(["flagstaff", "tusayan", "grand-canyon-village", "page"]),
  },
  {
    destination: "yellowstone",
    allowCities: new Set(["jackson", "west-yellowstone", "bozeman", "gardiner"]),
  },
  {
    destination: "glacier national park",
    allowCities: new Set(["whitefish", "kalispell"]),
  },
  {
    destination: "moab",
    allowCities: new Set(["moab"]),
  },
  {
    destination: "zion",
    allowCities: new Set(["springdale", "st-george"]),
  },
];

const STATE_NAME_TO_SLUG = new Map(
  [
    ["alabama", "alabama"],
    ["alaska", "alaska"],
    ["arizona", "arizona"],
    ["arkansas", "arkansas"],
    ["california", "california"],
    ["colorado", "colorado"],
    ["connecticut", "connecticut"],
    ["delaware", "delaware"],
    ["florida", "florida"],
    ["georgia", "georgia"],
    ["hawaii", "hawaii"],
    ["idaho", "idaho"],
    ["illinois", "illinois"],
    ["indiana", "indiana"],
    ["iowa", "iowa"],
    ["kansas", "kansas"],
    ["kentucky", "kentucky"],
    ["louisiana", "louisiana"],
    ["maine", "maine"],
    ["maryland", "maryland"],
    ["massachusetts", "massachusetts"],
    ["michigan", "michigan"],
    ["minnesota", "minnesota"],
    ["mississippi", "mississippi"],
    ["missouri", "missouri"],
    ["montana", "montana"],
    ["nebraska", "nebraska"],
    ["nevada", "nevada"],
    ["new hampshire", "new-hampshire"],
    ["new jersey", "new-jersey"],
    ["new mexico", "new-mexico"],
    ["new york", "new-york"],
    ["north carolina", "north-carolina"],
    ["north dakota", "north-dakota"],
    ["ohio", "ohio"],
    ["oklahoma", "oklahoma"],
    ["oregon", "oregon"],
    ["pennsylvania", "pennsylvania"],
    ["rhode island", "rhode-island"],
    ["south carolina", "south-carolina"],
    ["south dakota", "south-dakota"],
    ["tennessee", "tennessee"],
    ["texas", "texas"],
    ["utah", "utah"],
    ["vermont", "vermont"],
    ["virginia", "virginia"],
    ["washington", "washington"],
    ["west virginia", "west-virginia"],
    ["wisconsin", "wisconsin"],
    ["wyoming", "wyoming"],
    ["district of columbia", "district-of-columbia"],
  ].map(([name, slug]) => [name, slug]),
);

const DAY_TRIP_REGEX = /day[-\s]trip(?:s)? to\s+([^.,;:()]+)/gi;
const RIVERWALK_REGEX = /\bRiver\s*walk\b|\bRiverwalk\b/gi;
const RIVERWALK_TEST_REGEX = /\bRiver\s*walk\b|\bRiverwalk\b/i;
const MUST_SEE_REGEX = /must[-\s]see/i;

const getContextSnippet = (text: string, index: number, length = 140) => {
  const start = Math.max(0, index - Math.floor(length / 2));
  const end = Math.min(text.length, start + length);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
};

const collectTextEntries = (content: CityGuideTextContent) => {
  const entries: string[] = [
    content.intro,
    content.bestTimeToVisit,
    content.whatToPack,
    ...(content.itineraries?.flatMap((itinerary) => [
      itinerary.title,
      itinerary.description,
    ]) ?? []),
    ...(content.thingsToDoSections?.flatMap((section) => [
      section.title,
      ...(section.paragraphs ?? []),
    ]) ?? []),
    ...(content.topThingsToDo?.flatMap((item) => [item.title, item.description]) ?? []),
    ...(content.extraText ?? []),
  ].filter(Boolean);

  return entries;
};

const getDayTripMatches = (text: string) => {
  const matches: Array<{ index: number; phrase: string; destination: string }> = [];
  DAY_TRIP_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null = null;
  while ((match = DAY_TRIP_REGEX.exec(text)) !== null) {
    const phrase = match[0];
    const destination = match[1]
      .replace(/\bfor\b.*$/i, "")
      .replace(/\bfrom\b.*$/i, "")
      .replace(/\bin\b.*$/i, "")
      .trim();
    matches.push({ index: match.index, phrase, destination });
  }

  return matches;
};

const isDayTripDenied = (
  destination: string,
  citySlug: string,
  parentSlug: string,
  regionType: "state" | "country",
  sentence: string,
) => {
  const destinationLower = destination.toLowerCase();
  const denyMatch = DAY_TRIP_DENYLIST.find((entry) =>
    destinationLower.includes(entry.destination),
  );
  if (denyMatch && !denyMatch.allowCities.has(citySlug)) {
    return true;
  }

  if (regionType === "state") {
    const sentenceLower = sentence.toLowerCase();
    for (const [stateName, stateSlug] of STATE_NAME_TO_SLUG) {
      if (stateSlug === parentSlug) {
        continue;
      }
      if (sentenceLower.includes(stateName)) {
        return true;
      }
    }
  }

  return false;
};

const isRiverwalkAllowed = (citySlug: string) => RIVERWALK_ALLOWLIST.has(citySlug);

const getMustSeeIssues = (
  sentence: string,
  knownPois: Set<string>,
  issueType: string,
  severity: CityGuideIssue["severity"],
  suggestedFix?: string,
) => {
  if (!MUST_SEE_REGEX.test(sentence)) {
    return [];
  }

  const sentenceLower = sentence.toLowerCase();
  const hasKnownPoi = Array.from(knownPois).some((poi) => sentenceLower.includes(poi));

  if (hasKnownPoi) {
    return [];
  }

  return [
    {
      issueType,
      matchedText: sentence.trim(),
      contextSnippet: sentence.trim(),
      severity,
      suggestedFix,
    },
  ];
};

const sanitizeSentence = (
  sentence: string,
  context: CityGuideAuditContext,
  knownPois: Set<string>,
  changes: string[],
) => {
  const dayTripMatches = getDayTripMatches(sentence);
  const hasDeniedDayTrip = dayTripMatches.some((match) =>
    isDayTripDenied(
      match.destination,
      context.citySlug,
      context.parentSlug,
      context.regionType,
      sentence,
    ),
  );

  if (hasDeniedDayTrip) {
    changes.push("day-trip");
    return "Plan a nearby scenic drive or short nature loop to keep travel time reasonable.";
  }

  const mustSeeIssues = getMustSeeIssues(
    sentence,
    knownPois,
    "Unverified POI claim",
    "info",
    "Replace with a general highlight statement.",
  );
  if (mustSeeIssues.length) {
    changes.push("must-see");
    return "Look for standout neighborhoods, parks, and cultural hubs that showcase the city’s character.";
  }

  return sentence;
};

export const sanitizeCityGuideContent = (
  content: CityGuideTextContent,
  context: CityGuideAuditContext,
) => {
  const changes: string[] = [];
  const knownPois = context.knownPois ?? new Set<string>();

  const sanitizeText = (text?: string) => {
    if (!text) {
      return text;
    }

    let updated = text;
    if (!isRiverwalkAllowed(context.citySlug) && RIVERWALK_TEST_REGEX.test(updated)) {
      updated = updated.replace(RIVERWALK_REGEX, "riverfront walk");
      changes.push("riverwalk");
    }

    const sentences = updated.split(/(?<=[.!?])\s+/);
    const sanitizedSentences = sentences.map((sentence) =>
      sanitizeSentence(sentence, context, knownPois, changes),
    );
    return sanitizedSentences.join(" ");
  };

  return {
    content: {
      ...content,
      intro: sanitizeText(content.intro),
      bestTimeToVisit: sanitizeText(content.bestTimeToVisit),
      whatToPack: sanitizeText(content.whatToPack),
      itineraries: content.itineraries?.map((itinerary) => ({
        ...itinerary,
        title: sanitizeText(itinerary.title),
        description: sanitizeText(itinerary.description),
      })),
      thingsToDoSections: content.thingsToDoSections?.map((section) => ({
        ...section,
        title: sanitizeText(section.title),
        paragraphs: section.paragraphs?.map((paragraph) => sanitizeText(paragraph) ?? paragraph),
      })),
      topThingsToDo: content.topThingsToDo?.map((item) => ({
        ...item,
        title: sanitizeText(item.title),
        description: sanitizeText(item.description),
        activityType: item.activityType,
      })),
      extraText: content.extraText?.map((text) => sanitizeText(text) ?? text),
    },
    changes,
  };
};

type TopThingsAuditMetrics = {
  topThingsPoiBackedPct: number;
  topThingsAvgDescriptionLength: number;
  hasGenericPlaceholders: boolean;
  hasFarAwayTrips: boolean;
  poiBackedTitles: string[];
  nonPoiTitles: string[];
  shortDescriptionTitles: string[];
};

export const buildTopThingsAuditMetrics = (
  content: CityGuideTextContent,
  context: CityGuideAuditContext,
): TopThingsAuditMetrics => {
  const topThings = content.topThingsToDo ?? [];
  const total = topThings.length;
  const { localPoiNames, destinationDistanceMap } = getTopThingAuditContext(
    context.parentSlug,
    context.citySlug,
  );
  const tier1PoiNames =
    context.tier === 1
      ? getTier1PoiNameSet(context.parentSlug, context.citySlug)
      : new Set<string>();

  const poiBackedTitles: string[] = [];
  const nonPoiTitles: string[] = [];
  const shortDescriptionTitles: string[] = [];
  const genericPlaceholderTitles: string[] = [];
  let farAwayTrips = false;
  let totalDescriptionLength = 0;

  topThings.forEach((item) => {
    const title = item.title ?? "";
    const normalized = normalizePlaceName(title);
    const isTier1Poi = tier1PoiNames.has(normalized);
    const isKnownLocal = localPoiNames.has(normalized);
    const destinationDistance = destinationDistanceMap.get(normalized);
    const isBacked =
      context.tier === 1
        ? isTier1Poi
        : isKnownLocal || destinationDistance !== undefined;

    if (isBacked) {
      poiBackedTitles.push(title);
    } else {
      nonPoiTitles.push(title);
    }

    if (
      title &&
      isGenericPlaceholderName(title, context.cityName) &&
      !isKnownLocal &&
      !isTier1Poi
    ) {
      genericPlaceholderTitles.push(title);
    }

    if (
      destinationDistance !== undefined &&
      destinationDistance > MAX_NEARBY_MILES
    ) {
      farAwayTrips = true;
    }

    const descriptionLength = item.description?.trim().length ?? 0;
    totalDescriptionLength += descriptionLength;
    if (context.tier === 1 && descriptionLength < MIN_TIER1_DESCRIPTION_LENGTH) {
      shortDescriptionTitles.push(title);
    }
  });

  return {
    topThingsPoiBackedPct: total
      ? Math.round((poiBackedTitles.length / total) * 100)
      : 0,
    topThingsAvgDescriptionLength: total
      ? Math.round(totalDescriptionLength / total)
      : 0,
    hasGenericPlaceholders: genericPlaceholderTitles.length > 0,
    hasFarAwayTrips: farAwayTrips,
    poiBackedTitles,
    nonPoiTitles,
    shortDescriptionTitles,
  };
};

export const auditCityGuideContent = (
  content: CityGuideTextContent,
  context: CityGuideAuditContext,
) => {
  const issues: CityGuideIssue[] = [];
  const inferredPois = new Set(
    [
      ...(content.topThingsToDo?.map((item) => item.title) ?? []),
      ...(content.thingsToDoSections?.map((section) => section.title) ?? []),
    ]
      .filter(Boolean)
      .map((item) => item.toLowerCase()),
  );
  const knownPois = context.knownPois ?? inferredPois;

  const textEntries = collectTextEntries(content);

  textEntries.forEach((text) => {
    if (!isRiverwalkAllowed(context.citySlug)) {
      RIVERWALK_REGEX.lastIndex = 0;
      let match: RegExpExecArray | null = null;
      while ((match = RIVERWALK_REGEX.exec(text)) !== null) {
        issues.push({
          issueType: "Riverwalk",
          matchedText: match[0],
          contextSnippet: getContextSnippet(text, match.index),
          severity: "warn",
          suggestedFix: "Use a generic riverfront walk unless allowlisted.",
        });
      }
    }

    const dayTripMatches = getDayTripMatches(text);
    dayTripMatches.forEach((match) => {
      if (
        isDayTripDenied(
          match.destination,
          context.citySlug,
          context.parentSlug,
          context.regionType,
          text,
        )
      ) {
        issues.push({
          issueType: "Unrealistic day trip",
          matchedText: match.phrase.trim(),
          contextSnippet: getContextSnippet(text, match.index),
          severity: "error",
          suggestedFix:
            "Remove the day-trip recommendation or replace with a closer destination.",
        });
      }
    });

    const sentences = text.split(/(?<=[.!?])\s+/);
    sentences.forEach((sentence) => {
      const mustSeeIssues = getMustSeeIssues(
        sentence,
        knownPois,
        "Unverified POI claim",
        "info",
        "Replace with a general highlight statement.",
      );
      mustSeeIssues.forEach((issue) => issues.push(issue));
    });
  });

  if (content.topThingsToDo?.length) {
    const { localPoiNames, destinationDistanceMap } = getTopThingAuditContext(
      context.parentSlug,
      context.citySlug,
    );

    content.topThingsToDo.forEach((item) => {
      if (!item.title) {
        return;
      }

      const normalized = normalizePlaceName(item.title);
      const isLocalPoi = localPoiNames.has(normalized);
      const destinationDistance = destinationDistanceMap.get(normalized);
      const isArchetype = item.activityType?.startsWith("archetype") ?? false;

      if (isDenylistedTopThing(item.title) && !isLocalPoi) {
        issues.push({
          issueType: "Denylisted top thing",
          matchedText: item.title,
          contextSnippet: item.title,
          severity: isArchetype ? "warn" : "error",
          suggestedFix: isArchetype
            ? "Confirm the archetype matches the local landscape."
            : "Replace with a curated local POI or nearby destination.",
        });
      }

      if (!isLocalPoi && destinationDistance === undefined) {
        issues.push({
          issueType: "Unverified top thing",
          matchedText: item.title,
          contextSnippet: item.title,
          severity: isArchetype ? "warn" : "error",
          suggestedFix: isArchetype
            ? "Confirm the archetype stays general and city-appropriate."
            : "Replace with a curated local POI or a nearby destination within two hours.",
        });
        if (!isArchetype) {
          return;
        }
      }

      if (
        destinationDistance !== undefined &&
        destinationDistance > MAX_NEARBY_MILES
      ) {
        issues.push({
          issueType: "Top thing too far",
          matchedText: item.title,
          contextSnippet: item.title,
          severity: "error",
          suggestedFix: "Swap for a destination within 110 miles.",
        });
      }
    });
  }

  const topThingsMetrics = buildTopThingsAuditMetrics(content, context);

  if (context.tier === 1) {
    if ((content.topThingsToDo?.length ?? 0) < MIN_TIER1_ITEMS) {
      issues.push({
        issueType: "insufficient_poi_coverage",
        matchedText: String(content.topThingsToDo?.length ?? 0),
        contextSnippet: "Top Things to Do",
        severity: "warn",
        suggestedFix: "Add more Tier-1 POIs to meet minimum coverage.",
      });
    }

    topThingsMetrics.nonPoiTitles.forEach((title) => {
      if (!title) {
        return;
      }
      issues.push({
        issueType: "Tier-1 top thing not POI-backed",
        matchedText: title,
        contextSnippet: title,
        severity: "error",
        suggestedFix: "Replace with a curated Tier-1 POI entry.",
      });
    });

    topThingsMetrics.shortDescriptionTitles.forEach((title) => {
      if (!title) {
        return;
      }
      issues.push({
        issueType: "Tier-1 top thing description too short",
        matchedText: title,
        contextSnippet: title,
        severity: "error",
        suggestedFix: "Expand the description to 2–4 SEO-rich sentences.",
      });
    });

    if (topThingsMetrics.hasGenericPlaceholders) {
      issues.push({
        issueType: "Tier-1 generic placeholder",
        matchedText: "Generic placeholder detected",
        contextSnippet: "Top Things to Do",
        severity: "error",
        suggestedFix: "Replace with a named POI from the Tier-1 registry.",
      });
    }

    if (topThingsMetrics.hasFarAwayTrips) {
      issues.push({
        issueType: "Tier-1 far-away top thing",
        matchedText: "Top thing too far",
        contextSnippet: "Top Things to Do",
        severity: "error",
        suggestedFix: "Remove far-away destinations from Tier-1 lists.",
      });
    }
  }

  return issues;
};
