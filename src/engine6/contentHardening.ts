import type { Engine6ItineraryItem } from "./types";

const PROMOTIONAL_TITLE_PATTERNS = [
  /\bamazing\b/gi,
  /\bultimate\b/gi,
  /\bbest\b/gi,
  /\bunforgettable\b/gi,
  /\bonce[-\s]in[-\s]a[-\s]lifetime\b/gi,
] as const;

const TITLE_TYPE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bhelicopter\b/i, label: "Helicopter Tour" },
  { pattern: /\b(sailing|sail)\b/i, label: "Sailing Tour" },
  { pattern: /\bcharter\b/i, label: "Charter" },
  { pattern: /\bfood\b|\bculinary\b|\btasting\b/i, label: "Food Tour" },
  { pattern: /\bday\s*trip\b/i, label: "Day Trip" },
  { pattern: /\bwalking\b/i, label: "Walking Tour" },
  { pattern: /\bbike|cycling\b/i, label: "Bike Tour" },
  { pattern: /\bboat\b|\bcruise\b/i, label: "Boat Tour" },
  { pattern: /\b(kayak|canoe|paddle)\b/i, label: "Paddle Tour" },
  { pattern: /\btour\b/i, label: "Tour" },
];

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const removePromoWords = (value: string) => {
  let output = value;
  for (const pattern of PROMOTIONAL_TITLE_PATTERNS) {
    output = output.replace(pattern, " ");
  }
  return normalizeWhitespace(output.replace(/\s+[-,:|]\s+/g, " "));
};

const trimSentenceWithoutMidWordCut = (value: string, maxLength: number) => {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;

  const punctuationSlice = normalized.slice(0, maxLength).match(/^(.+[.!?])\s*[^.!?]*$/);
  if (punctuationSlice?.[1]) {
    return punctuationSlice[1].trim();
  }

  const sliced = normalized.slice(0, maxLength);
  const trimmed = sliced.replace(/\s+\S*$/, "").trim();
  return (trimmed || sliced).trim();
};

const extractFirstCompleteSentence = (value: string) => {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map(item => item.trim())
    .filter(Boolean);

  if (sentences.length === 0) return "";

  const first = sentences[0] ?? "";
  if (first.length <= 180) {
    return first;
  }

  const shortened = trimSentenceWithoutMidWordCut(first, 180);
  return /[.!?]$/.test(shortened) ? shortened : `${shortened}.`;
};

const deriveDurationToken = (durationText: string | null | undefined) => {
  const duration = normalizeWhitespace(durationText ?? "");
  if (!duration) return null;
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*hour/i);
  if (hourMatch?.[1]) {
    return `${hourMatch[1]}-Hour`;
  }
  const dayMatch = duration.match(/(\d+)\s*day/i);
  if (dayMatch?.[1]) {
    return `${dayMatch[1]}-Day`;
  }
  return null;
};

const findDeparturePhrase = (title: string) => {
  const match = title.match(/\bfrom\s+([A-Za-z][A-Za-z\s'.-]{1,50})/i);
  if (!match) return null;
  return `from ${normalizeWhitespace(match[1] ?? "")}`;
};

const titleHasCityContext = (title: string, city: string) => {
  const normalizedTitle = title.toLowerCase();
  const normalizedCity = city.toLowerCase();
  return (
    normalizedTitle.includes(normalizedCity) || /\bfrom\s+[a-z]/i.test(title)
  );
};

const titleHasType = (title: string) =>
  /(tour|trip|charter|flight|sailing|helicopter|cruise|walk|bike|kayak)/i.test(
    title
  );

const inferTypeLabel = (title: string) => {
  for (const entry of TITLE_TYPE_PATTERNS) {
    if (entry.pattern.test(title)) return entry.label;
  }
  return "Tour";
};

export const buildEngine6DisplayTitle = ({
  rawTitle,
  city,
  durationText,
}: {
  rawTitle: string;
  city: string;
  durationText?: string | null;
}) => {
  const normalizedRaw = normalizeWhitespace(rawTitle);
  const dePromoted = removePromoWords(normalizedRaw);
  const base = dePromoted || normalizedRaw;
  const departure = findDeparturePhrase(base);
  const typeLabel = inferTypeLabel(base);

  let composed = base;
  if (!titleHasCityContext(composed, city)) {
    composed = `${city} ${composed}`;
  }
  if (!titleHasType(composed)) {
    composed = `${composed} ${typeLabel}`;
  }

  if (departure && !/\bfrom\s+[A-Za-z]/i.test(composed)) {
    composed = `${composed} ${departure}`;
  }

  const durationToken = deriveDurationToken(durationText);
  if (durationToken && !new RegExp(durationToken, "i").test(composed)) {
    composed = `${composed} (${durationToken})`;
  }

  composed = normalizeWhitespace(
    composed
      .replace(/\s*\|\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/^[-,:\s]+|[-,:\s]+$/g, "")
  );

  if (composed.length > 90) {
    composed = trimSentenceWithoutMidWordCut(composed, 90)
      .replace(/\s*\([^)]*$/, "")
      .replace(/\s+$/, "");
  }

  composed = composed.replace(/[\s\-,:|]+$/, "").trim();

  if (!titleHasCityContext(composed, city)) {
    composed = `${city} ${inferTypeLabel(base)}`;
  }

  return normalizeWhitespace(composed);
};

export const isLikelyPromotionalViatorTitle = (title: string) =>
  PROMOTIONAL_TITLE_PATTERNS.some(pattern => pattern.test(title));

export const buildEngine6ItineraryStopDescription = ({
  item,
}: {
  item: Pick<Engine6ItineraryItem, "title" | "description" | "stopType">;
}) => {
  const fromApi = item.description ? extractFirstCompleteSentence(item.description) : "";
  if (fromApi) {
    return fromApi;
  }

  return `Pass by ${item.title} and take in the surrounding scenery.`;
};

export const hasEngine6TitleCityOrDepartureContext = ({
  title,
  city,
}: {
  title: string;
  city: string;
}) => titleHasCityContext(title, city);
