const MIN_WORDS = 120;
const MAX_WORDS = 170;

const FORBIDDEN_TERMS = [
  /\bviator\b/gi,
  /\btripadvisor\b/gi,
  /\bthird-party\b/gi,
  /\bbooking page\b/gi,
  /\bconfirmation\b/gi,
  /\bcheckout\b/gi,
];

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");

const cleanText = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = stripHtml(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

  return normalized || undefined;
};

const stripForbiddenTerms = (value: string): string => {
  let sanitized = value;

  for (const pattern of FORBIDDEN_TERMS) {
    sanitized = sanitized.replace(pattern, "");
  }

  return sanitized.replace(/\s+/g, " ").trim();
};

const dedupe = (values?: string[]): string[] => {
  if (!values?.length) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(stripForbiddenTerms(value));
    if (!cleaned) {
      continue;
    }

    const key = cleaned.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
};

const toSentence = (value: string): string =>
  /[.!?]$/.test(value) ? value : `${value}.`;

const words = (value: string): string[] => value.split(/\s+/).filter(Boolean);

const countWords = (value: string): number => words(value).length;

const trimToWordLimit = (value: string, wordLimit: number): string =>
  `${words(value)
    .slice(0, wordLimit)
    .join(" ")
    .replace(/[.!?]*$/, "")}.`;

const appendUntilMinWords = (
  base: string,
  fallbackSentences: string[]
): string => {
  let current = base.trim();

  for (const sentence of fallbackSentences) {
    if (countWords(current) >= MIN_WORDS) {
      break;
    }
    current = `${current} ${toSentence(sentence)}`.trim();
  }

  return current;
};

const sanitizeFactValue = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const cleaned = cleanText(stripForbiddenTerms(value));

  if (!cleaned) {
    return undefined;
  }

  if (/(booking|confirmation|checkout|third-party)/i.test(cleaned)) {
    return undefined;
  }

  return cleaned;
};

const extractDepartureFromTitle = (title: string): string | undefined => {
  const match = title.match(/\bfrom\s+([^,.-]+(?:\s[^,.-]+){0,3})/i);
  if (!match?.[1]) {
    return undefined;
  }

  return sanitizeFactValue(match[1]);
};

const pickFactSentences = (input: {
  meetingPoint?: string;
  departureLocation?: string;
  maxGroupSize?: number;
  cancellationWindowHours?: number;
  minAge?: number;
  vehicleType?: string;
  specialHighlightPhrase?: string;
  shortInclusions?: string[];
  title: string;
}): string[] => {
  const facts: string[] = [];

  const departure =
    sanitizeFactValue(input.departureLocation) ??
    extractDepartureFromTitle(input.title) ??
    sanitizeFactValue(input.meetingPoint);

  if (departure) {
    facts.push(`Departures operate from ${departure}`);
  }

  if (input.maxGroupSize && input.maxGroupSize > 0) {
    facts.push(
      `Group size is limited to ${input.maxGroupSize} guests per vehicle for focused guide interaction`
    );
  }

  if (input.cancellationWindowHours && input.cancellationWindowHours > 0) {
    facts.push(
      `Cancellations are accepted up to ${input.cancellationWindowHours} hours before departure`
    );
  }

  if (input.minAge && input.minAge > 0) {
    facts.push(`Participants must be at least ${input.minAge} years old`);
  }

  const vehicleType = sanitizeFactValue(input.vehicleType);
  if (vehicleType) {
    facts.push(`Transportation is provided in a ${vehicleType}`);
  }

  const inclusionFacts = dedupe(input.shortInclusions)
    .filter(item =>
      /(water|guide|transport|vehicle|admission|ticket)/i.test(item)
    )
    .slice(0, 1)
    .map(item => `${item} is included`);

  facts.push(...inclusionFacts);

  const specialHighlight = sanitizeFactValue(input.specialHighlightPhrase);
  if (specialHighlight) {
    facts.push(specialHighlight);
  }

  return facts.slice(0, 3).map(toSentence);
};

export const generateEngine3Description = (input: {
  title: string;
  duration?: string;
  highlights?: string[];
  shortInclusions?: string[];
  meetingPoint?: string;
  departureLocation?: string;
  maxGroupSize?: number;
  cancellationWindowHours?: number;
  minAge?: number;
  vehicleType?: string;
  specialHighlightPhrase?: string;
  city?: string;
  region?: string;
  viatorDescription?: string;
}): string => {
  const title = cleanText(stripForbiddenTerms(input.title)) ?? "This tour";
  const location = [
    cleanText(stripForbiddenTerms(input.city ?? "")),
    cleanText(stripForbiddenTerms(input.region ?? "")),
  ]
    .filter(Boolean)
    .join(", ");

  const duration =
    cleanText(stripForbiddenTerms(input.duration ?? "")) ??
    "a half-day experience";

  const highlights = dedupe(input.highlights).slice(0, 3);
  const inclusionSummary = dedupe(input.shortInclusions).slice(0, 2);

  const activitySentence = toSentence(
    `${title} is a guided off-road experience${
      location ? ` in ${location}` : ""
    } lasting approximately ${duration}`
  );

  const terrainSentence = toSentence(
    `The route combines scenic desert driving with interpretive commentary on local geology, ecology, and regional history`
  );

  const highlightSentence = toSentence(
    highlights.length > 0
      ? `Scheduled stops feature ${highlights.join(", ")}, creating dedicated time for observation and photographs`
      : "Scheduled stops at key viewpoints and natural features provide time for photographs and guided discussion"
  );

  const factSentences = pickFactSentences({
    meetingPoint: input.meetingPoint,
    departureLocation: input.departureLocation,
    maxGroupSize: input.maxGroupSize,
    cancellationWindowHours: input.cancellationWindowHours,
    minAge: input.minAge,
    vehicleType: input.vehicleType,
    specialHighlightPhrase: input.specialHighlightPhrase,
    shortInclusions: input.shortInclusions,
    title,
  });

  const inclusionSentence = toSentence(
    inclusionSummary.length > 0
      ? `Included services include ${inclusionSummary.join(", ")}, supporting a comfortable and well-paced excursion`
      : "Professional guide service and specialized vehicle transportation are included for a comfortable and well-paced excursion"
  );

  const closingSentence =
    "This itinerary maintains a focused pace that balances scenic exploration, practical logistics, and consistent interpretive depth across each segment";

  const assembled = [
    activitySentence,
    terrainSentence,
    highlightSentence,
    ...factSentences,
    inclusionSentence,
    toSentence(closingSentence),
  ].join(" ");

  let description = assembled;

  if (countWords(description) > MAX_WORDS) {
    description = trimToWordLimit(description, MAX_WORDS);
  }

  if (countWords(description) < MIN_WORDS) {
    description = appendUntilMinWords(description, [
      "The pacing is designed to keep transitions efficient while preserving meaningful time at each featured stop",
      "Guide interpretation remains central throughout the route, connecting visible landmarks to broader environmental processes",
    ]);
  }

  if (countWords(description) > MAX_WORDS) {
    description = trimToWordLimit(description, MAX_WORDS);
  }

  return description;
};
