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
  topThingsToDo?: Array<{ title?: string; description?: string }>;
  extraText?: string[];
};

type CityGuideAuditContext = {
  citySlug: string;
  parentSlug: string;
  regionType: "state" | "country";
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
      })),
      extraText: content.extraText?.map((text) => sanitizeText(text) ?? text),
    },
    changes,
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

  return issues;
};
