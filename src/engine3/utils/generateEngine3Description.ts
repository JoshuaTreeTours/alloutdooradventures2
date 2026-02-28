const MIN_WORDS = 100;
const MAX_WORDS = 120;

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

const dedupe = (values?: string[]): string[] => {
  if (!values?.length) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(value);
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

const clampWordCount = (value: string, targetMin = MIN_WORDS): string => {
  let current = value.trim();

  if (countWords(current) > MAX_WORDS) {
    current = `${words(current)
      .slice(0, MAX_WORDS)
      .join(" ")
      .replace(/[.!?]*$/, "")}.`;
  }

  if (countWords(current) >= targetMin) {
    return current;
  }

  const paddingSentences = [
    "Published details focus on route conditions, guide interpretation, and practical pacing for a half-day desert excursion around Palm Desert and Joshua Tree.",
    "The itinerary emphasizes scenic driving segments with scheduled stops, while final timing and meeting logistics remain listed directly in the Viator confirmation.",
  ];

  for (const padding of paddingSentences) {
    if (countWords(current) >= targetMin) {
      break;
    }

    current = `${current} ${padding}`.trim();
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
  const title = cleanText(input.title) ?? "This tour";
  const location = [cleanText(input.city), cleanText(input.region)]
    .filter(Boolean)
    .join(", ");
  const duration = cleanText(input.duration);
  const highlights = dedupe(input.highlights).slice(0, 3);
  const inclusions = dedupe(input.shortInclusions).slice(0, 2);
  const meetingPoint = cleanText(input.meetingPoint);

  const normalizedViatorDescription = cleanText(input.viatorDescription);
  if (normalizedViatorDescription) {
    return clampWordCount(normalizedViatorDescription);
  }

  const sentenceOne = toSentence(
    `${title} is a guided off-road sightseeing tour${
      location ? ` in ${location}` : ""
    }`
  );

  const sentenceTwo = toSentence(
    `The route typically covers ${
      highlights.length
        ? highlights.join(", ")
        : "desert washes, geological viewpoints, and notable Joshua Tree landscapes"
    } with interpretation from a local guide`
  );

  const logistics = [
    duration ? `Viator lists a duration of ${duration}` : undefined,
    inclusions.length
      ? `common inclusions are ${inclusions.join(" and ")}`
      : undefined,
    meetingPoint
      ? `meeting details are provided as ${meetingPoint}`
      : undefined,
  ]
    .filter(Boolean)
    .join("; ");

  const sentenceThree = toSentence(
    logistics ||
      "Logistics are published with standard check-in timing, transport details, and confirmation steps on the booking page"
  );

  return clampWordCount(`${sentenceOne} ${sentenceTwo} ${sentenceThree}`);
};
