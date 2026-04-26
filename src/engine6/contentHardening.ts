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

const GENERIC_ITINERARY_PHRASES = [
  /take in the surrounding scenery/i,
  /enjoy the views?/i,
  /pass by and see/i,
] as const;

const STOP_CONTEXT_RULES: Array<{ pattern: RegExp; context: string }> = [
  { pattern: /\bliberty\b/i, context: "the Statue of Liberty and the harbor approaches" },
  { pattern: /\bellis\b/i, context: "Ellis Island and its immigration history" },
  { pattern: /\bbattery\s*park\b/i, context: "Battery Park's waterfront paths and harbor views" },
  { pattern: /\bbridge\b/i, context: "the bridge engineering and skyline framing" },
  { pattern: /\bvillage\b/i, context: "village streets with shops, marinas, and local activity" },
  { pattern: /\bcliffs?\b/i, context: "coastal cliffs and wide ocean outlooks" },
];

const VARIED_OPENERS = ["Cruise past", "See", "Glide by", "Take in", "View"] as const;

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

  const punctuationSlice = normalized
    .slice(0, maxLength)
    .match(/^(.+[.!?])\s*[^.!?]*$/);
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
  return normalizedTitle.includes(normalizedCity) || /\bfrom\s+[a-z]/i.test(title);
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

const descriptionIsWeak = (value: string) =>
  GENERIC_ITINERARY_PHRASES.some(pattern => pattern.test(value));

const inferStopContext = (stopTitle: string) => {
  for (const rule of STOP_CONTEXT_RULES) {
    if (rule.pattern.test(stopTitle)) return rule.context;
  }
  return null;
};

const ensureSentence = (value: string) => {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
};

const normalizeForSimilarity = (value: string) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\b(pass|by|enjoy|views?|take|in|the|and|to|of|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

const similarityScore = (a: string, b: string) => {
  const aTokens = new Set(normalizeForSimilarity(a).split(" ").filter(Boolean));
  const bTokens = new Set(normalizeForSimilarity(b).split(" ").filter(Boolean));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }
  return overlap / Math.max(aTokens.size, bTokens.size);
};

const isNearDuplicate = (value: string, existing: string[]) =>
  existing.some(item => similarityScore(value, item) >= 0.78);

const withLengthControl = (value: string) => {
  const sentence = ensureSentence(value);
  if (!sentence) return sentence;
  if (sentence.length <= 180) return sentence;
  const shortened = trimSentenceWithoutMidWordCut(sentence, 180);
  return ensureSentence(shortened);
};

const buildContextEnhancedSentence = ({
  stopTitle,
  opener,
}: {
  stopTitle: string;
  opener: string;
}) => {
  const context = inferStopContext(stopTitle);
  const detail = context ?? `${stopTitle} along the route`;
  return withLengthControl(`${opener} ${stopTitle} and note ${detail} as the route continues`);
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

export const buildEngine6ItineraryDescriptions = ({
  itinerary,
}: {
  itinerary: Engine6ItineraryItem[];
}) => {
  const generated: string[] = [];
  const duplicateWarnings: string[] = [];

  const withDescriptions = itinerary.map((item, index) => {
    const title = normalizeWhitespace(item.title ?? "");
    const apiSentence = item.description
      ? extractFirstCompleteSentence(item.description)
      : "";
    const shouldEnhance = !apiSentence || descriptionIsWeak(apiSentence);

    let candidate = apiSentence;
    if (shouldEnhance) {
      const opener = VARIED_OPENERS[index % VARIED_OPENERS.length] ?? "See";
      candidate = buildContextEnhancedSentence({ stopTitle: title, opener });
    }

    if (isNearDuplicate(candidate, generated)) {
      const opener = VARIED_OPENERS[(index + 2) % VARIED_OPENERS.length] ?? "View";
      candidate = buildContextEnhancedSentence({ stopTitle: title, opener });
    }

    candidate = withLengthControl(candidate);
    generated.push(candidate);

    return {
      ...item,
      title,
      description: candidate,
    };
  });

  const nearDuplicateCount = generated.reduce((count, sentence, index) => {
    const previous = generated.slice(0, index);
    return count + (isNearDuplicate(sentence, previous) ? 1 : 0);
  }, 0);

  if (nearDuplicateCount > 2) {
    duplicateWarnings.push(
      `engine6-itinerary-warning: ${nearDuplicateCount} itinerary descriptions are near-identical`
    );
  }

  return { itinerary: withDescriptions, warnings: duplicateWarnings };
};

export const buildEngine6ItineraryStopDescription = ({
  item,
}: {
  item: Pick<Engine6ItineraryItem, "title" | "description" | "stopType">;
}) => {
  const description = normalizeWhitespace(item.description ?? "");
  if (description) return ensureSentence(description);
  return ensureSentence(`Pass by ${item.title} and continue along the route`);
};

export const hasEngine6TitleCityOrDepartureContext = ({
  title,
  city,
}: {
  title: string;
  city: string;
}) => titleHasCityContext(title, city);
