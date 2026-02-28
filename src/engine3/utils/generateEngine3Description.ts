const MIN_WORDS = 100;
const MAX_WORDS = 120;

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

const clampWordCount = (value: string): string => {
  let current = value.trim();

  if (countWords(current) > MAX_WORDS) {
    current = `${words(current)
      .slice(0, MAX_WORDS)
      .join(" ")
      .replace(/[.!?]*$/, "")}.`;
  }

  if (countWords(current) >= MIN_WORDS) {
    return current;
  }

  const authoritativePadding = [
    "The route is designed to balance scenic driving with guided interpretation and regular stops that add context to each landscape feature.",
    "Each segment is paced to maintain comfort while preserving enough time for observation, photographs, and focused discussion of the surrounding terrain.",
  ];

  for (const sentence of authoritativePadding) {
    if (countWords(current) >= MIN_WORDS) {
      break;
    }

    current = `${current} ${sentence}`.trim();
  }

  if (countWords(current) <= MAX_WORDS) {
    return current;
  }

  return `${words(current)
    .slice(0, MAX_WORDS)
    .join(" ")
    .replace(/[.!?]*$/, "")}.`;
};

export const generateEngine3Description = (input: {
  title: string;
  duration?: string;
  highlights?: string[];
  shortInclusions?: string[];
  meetingPoint?: string;
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
  const inclusions = dedupe(input.shortInclusions).slice(0, 3);

  const sanitizedMeetingPoint = cleanText(
    stripForbiddenTerms(input.meetingPoint ?? "")
  );

  const experienceSummary =
    highlights.length > 0
      ? highlights.join(", ")
      : "desert washes, geologic viewpoints, and notable landscape features";

  const inclusionSummary =
    inclusions.length > 0
      ? inclusions.join(", ")
      : "professional guide service and specialized vehicle transportation";

  const distinctiveness = sanitizedMeetingPoint
    ? `The itinerary maintains a relaxed, well-paced flow with practical arrival guidance and consistent interpretive commentary throughout the route`
    : `This experience stands out for its blend of scenic off-road segments, thoughtful interpretation, and a relaxed pacing that supports exploration at each stop`;

  const description = [
    toSentence(
      `${title} is a guided off-road adventure${
        location ? ` in ${location}` : ""
      } lasting approximately ${duration}`
    ),
    toSentence(
      `Guests travel through dramatic terrain as the guide explains the geology, ecology, and regional history that shape the landscape`
    ),
    toSentence(
      `Scenic driving segments include scheduled stops featuring ${experienceSummary}, with time for observation and photographs`
    ),
    toSentence(
      `Included services cover ${inclusionSummary}, supporting a comfortable and informative experience from start to finish`
    ),
    toSentence(distinctiveness),
  ].join(" ");

  return clampWordCount(description);
};
