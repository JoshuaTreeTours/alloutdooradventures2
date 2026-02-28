const MIN_WORDS = 100;
const MAX_WORDS = 140;

const FORBIDDEN_TERMS = [
  /\bviator\b/gi,
  /\btripadvisor\b/gi,
  /\btacdn\b/gi,
  /\bconfirmation\b/gi,
  /\bbooking page\b/gi,
  /\blisted as\b/gi,
  /\bpublished details\b/gi,
  /\bthird-party\b/gi,
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

const toSentence = (value: string): string =>
  /[.!?]$/.test(value) ? value : `${value}.`;

const words = (value: string): string[] => value.split(/\s+/).filter(Boolean);

const countWords = (value: string): number => words(value).length;

const clampWords = (value: string, maxWords: number): string =>
  `${words(value)
    .slice(0, maxWords)
    .join(" ")
    .replace(/[.!?]*$/, "")}.`;

const sanitize = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const cleaned = cleanText(stripForbiddenTerms(value));
  if (!cleaned) {
    return undefined;
  }

  return cleaned;
};

const dedupe = (values?: string[]): string[] => {
  if (!values?.length) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of values) {
    const value = sanitize(item);
    if (!value) {
      continue;
    }

    const key = value.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
};

const parseHours = (value?: string): string | undefined => {
  const cleaned = sanitize(value);
  if (!cleaned) {
    return undefined;
  }

  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*(hour|hr)/i);
  if (match?.[1]) {
    return `${match[1]} hours`;
  }

  return cleaned;
};

const withFallback = <T>(...values: Array<T | undefined>): T | undefined =>
  values.find(value => value !== undefined);

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
  const title = sanitize(input.title) ?? "This guided tour";
  const city = sanitize(input.city) ?? "Palm Springs";
  const region = sanitize(input.region) ?? "California";
  const duration = parseHours(input.duration) ?? "3 hours";

  const highlights = dedupe(input.highlights).slice(0, 2);
  const inclusions = dedupe(input.shortInclusions).slice(0, 2);

  const signatureHighlight =
    sanitize(input.specialHighlightPhrase) ??
    withFallback(
      highlights.find(item => /fault|joshua|oasis|geologic|desert/i.test(item)),
      highlights[0],
      "The route focuses on geologic landmarks, scenic terrain, and guided interpretation"
    )!;

  const meetingPoint =
    sanitize(input.departureLocation) ?? sanitize(input.meetingPoint);

  const factSentences = [
    duration ? `The guided route runs about ${duration}` : undefined,
    meetingPoint ? `Departures operate from ${meetingPoint}` : undefined,
    input.cancellationWindowHours
      ? `Cancel up to ${input.cancellationWindowHours} hours in advance for a full refund`
      : undefined,
    input.maxGroupSize
      ? `Group size is limited to ${input.maxGroupSize} guests per vehicle`
      : undefined,
    input.minAge ? `The minimum participant age is ${input.minAge}` : undefined,
    input.vehicleType
      ? `Transportation is provided in a ${sanitize(input.vehicleType)}`
      : undefined,
    inclusions.length
      ? `Included services cover ${inclusions.join(" and ")}`
      : undefined,
  ].filter((item): item is string => Boolean(item));

  const selectedFacts = factSentences.slice(0, 5);

  const sentences = [
    `${title} is a guided off-road tour in ${city}, ${region}`,
    signatureHighlight,
    selectedFacts[0] ??
      "The itinerary includes planned stops for photographs and field interpretation",
    selectedFacts[1] ??
      "Professional guide service keeps the route informative and well paced",
    selectedFacts[2] ??
      "The experience balances scenic driving with focused regional context at key viewpoints",
    selectedFacts[3],
    selectedFacts[4],
  ].filter((item): item is string => Boolean(item)).map(toSentence);

  let description = sentences.join(" ");

  if (countWords(description) < MIN_WORDS) {
    const remainingFacts = factSentences.slice(3, 5).map(toSentence);
    for (const fact of remainingFacts) {
      if (countWords(description) >= MIN_WORDS) {
        break;
      }
      description = `${description} ${fact}`.trim();
    }
  }

  const fallbackSentences = [
    "Interpretive commentary connects visible terrain features to regional natural history throughout the outing",
    "Planned stop timing is structured to allow photographs, short walks, and clear orientation at each location",
    "This small-format approach keeps the experience efficient while preserving depth at key points along the route",
  ];

  for (const sentence of fallbackSentences) {
    if (countWords(description) >= MIN_WORDS) {
      break;
    }

    description = `${description} ${toSentence(sentence)}`.trim();
  }

  if (countWords(description) > MAX_WORDS) {
    description = clampWords(description, MAX_WORDS);
  }

  return description;
};
