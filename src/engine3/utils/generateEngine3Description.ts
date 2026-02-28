const MIN_WORDS = 100;
const MAX_WORDS = 120;

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
  itineraryStopNames?: string[];
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
  const city = sanitize(input.city) ?? "Palm Springs";
  const region = sanitize(input.region) ?? "California";
  const duration = parseHours(input.duration) ?? "3 hours";

  const highlights = dedupe(input.highlights).slice(0, 2);
  const itineraryStops = dedupe(input.itineraryStopNames).slice(0, 3);

  const locationLabel = [city, region].filter(Boolean).join(", ");

  const signatureHighlight =
    sanitize(input.specialHighlightPhrase) ??
    withFallback(
      highlights.find(item => /fault|joshua|oasis|geologic|desert/i.test(item)),
      highlights[0],
      "The route focuses on geologic landmarks, scenic terrain, and guided interpretation"
    )!;

  const meetingPoint =
    sanitize(input.departureLocation) ?? sanitize(input.meetingPoint);

  const optionalPolicyFact = withFallback(
    input.maxGroupSize
      ? `Group size is capped at ${input.maxGroupSize} guests per vehicle`
      : undefined,
    input.minAge
      ? `Guests should be at least ${input.minAge} years old`
      : undefined,
    input.cancellationWindowHours
      ? `Free cancellation is available up to ${input.cancellationWindowHours} hours before departure`
      : undefined
  );

  const stopSentence =
    itineraryStops.length >= 3
      ? `Notable itinerary stops include ${itineraryStops[0]}, ${itineraryStops[1]}, and ${itineraryStops[2]}`
      : itineraryStops.length === 2
        ? `Notable itinerary stops include ${itineraryStops[0]} and ${itineraryStops[1]}`
        : itineraryStops.length === 1
          ? `A featured itinerary stop is ${itineraryStops[0]}`
          : highlights.length >= 2
            ? `Route highlights include ${highlights[0]} and ${highlights[1]}`
            : highlights.length === 1
              ? `A route highlight is ${highlights[0]}`
              : "The route emphasizes scenic overlooks and geologic interpretation across desert terrain";

  const sentences = [
    `Travel by ${sanitize(input.vehicleType) ?? "open-air off-road vehicle"} on a guided route near ${locationLabel} in about ${duration}`,
    meetingPoint
      ? `After meeting in ${meetingPoint}, guides set context on terrain, route pacing, and safety before departure`
      : `Guides set context on terrain, route pacing, and safety before departure`,
    stopSentence,
    signatureHighlight,
    "The itinerary is paced to reduce long transfers while preserving time at major viewpoints for photos and on-site interpretation",
    "This format works well for visitors seeking iconic desert landscapes in a focused half-day outing",
    optionalPolicyFact,
  ]
    .filter((item): item is string => Boolean(item))
    .map(toSentence);

  let description = sentences.join(" ");

  const fallbackSentences = [
    "Interpretive commentary links visible fault lines, rock formations, and desert ecology to regional natural history",
    "Stop sequencing is arranged to keep transitions efficient while still allowing meaningful time at key pullouts",
    "It is a practical option for travelers who want field context and signature views without committing a full day",
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
