import type { Engine6ItineraryItem } from "./types";

type GovernedItinerarySourceItem = Pick<
  Engine6ItineraryItem,
  "title" | "stopType" | "description" | "duration" | "admissionNote"
>;

type RewriteArgs = {
  item: GovernedItinerarySourceItem;
  index: number;
};

export type GovernedItineraryValidationArgs = {
  renderedItems: GovernedItinerarySourceItem[];
  sourceItems?: Array<{ title: string; description: string | null }>;
  overviewText?: string | null;
};

const STOP_VERBS = [
  "Visit",
  "Explore",
  "Stop at",
  "Walk through",
  "Spend time at",
  "Head to",
  "Continue to",
  "Travel through",
] as const;
const PASS_BY_VERBS = [
  "Pass",
  "Travel past",
  "View",
  "Continue past",
  "Glide by",
  "Move past",
  "Look toward",
  "Skirt",
] as const;

const GENERIC_ITINERARY_PATTERNS = [
  /\bthis stop provides\b/i,
  /\bfocused destination experience\b/i,
  /\blocal context and guided interpretation\b/i,
  /\bguided interpretation\b/i,
  /\bdestination experience\b/i,
  /\bstandout local highlights\b/i,
  /\btop outdoor highlights\b/i,
  /\bvisit this (?:location|stop)\b/i,
  /\bexplore this (?:location|stop)\b/i,
  /\benjoy this stop\b/i,
  /\bsee this location\b/i,
  /\bstop here\b/i,
] as const;

const GOVERNED_TITLE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bBay Bridge\b/i, label: "Bay Bridge crossing" },
  { pattern: /\bTuolumne Grove\b/i, label: "Tuolumne Grove" },
  {
    pattern: /\bGiant Sequoia\b|\bSequoia Grove\b/i,
    label: "giant sequoia grove",
  },
  { pattern: /\bYosemite Falls\b/i, label: "Yosemite Falls" },
  {
    pattern: /\bfree time\b|\bexploring on your own\b/i,
    label: "Yosemite free time",
  },
  {
    pattern: /\blakes\b|\bsummits\b|\bmeadows\b/i,
    label: "Yosemite High Country",
  },
  { pattern: /\bAnsel Adams\b/i, label: "Ansel Adams Gallery" },
  { pattern: /\bYosemite Village\b/i, label: "Yosemite Village" },
  { pattern: /\bYosemite Valley\b/i, label: "Yosemite Valley" },
  {
    pattern:
      /\bYosemite National Park\b.*\bentrance\b|\bentrance\b.*\bYosemite National Park\b/i,
    label: "Yosemite National Park entrance",
  },
  { pattern: /\bYosemite National Park\b/i, label: "Yosemite National Park" },
  { pattern: /\bEl Capitan Meadow\b/i, label: "El Capitan Meadow" },
  { pattern: /\bSan Francisco Hilton\b/i, label: "San Francisco return" },
  {
    pattern: /\bcamp(?:site)?\b|\bcamping gear\b/i,
    label: "Yosemite campsite",
  },
];

const SUPPLIER_VOICE_PATTERNS = [
  /\byou(?:'ll|’ll| will| can| are| get)\b/i,
  /\byour guide\b/i,
  /\bwe(?:'ll|’ll| will| meet| stop| continue)\b/i,
  /\bour (?:tour|guide|driver|day)\b/i,
] as const;

export const normalizeEngine6ItineraryComparisonText = (value: string) =>
  value
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[^\x20-\x7E]/g, match => (match === "’" ? "'" : " "))
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(
      /\b(?:the|a|an|and|or|with|for|to|of|in|on|at|by|from|this|that|these|those)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

const wordTokens = (value: string) =>
  normalizeEngine6ItineraryComparisonText(value)
    .split(" ")
    .filter(token => token.length > 2);

const buildNgrams = (tokens: string[], size: number) => {
  const ngrams = new Set<string>();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    ngrams.add(tokens.slice(index, index + size).join(" "));
  }
  return ngrams;
};

const sharedNgramRatio = (source: string, target: string, size: number) => {
  const sourceNgrams = buildNgrams(wordTokens(source), size);
  const targetNgrams = buildNgrams(wordTokens(target), size);
  if (sourceNgrams.size === 0 || targetNgrams.size === 0) return 0;
  let shared = 0;
  for (const ngram of targetNgrams) {
    if (sourceNgrams.has(ngram)) shared += 1;
  }
  return shared / Math.min(sourceNgrams.size, targetNgrams.size);
};

export const countEngine6ItinerarySentences = (value: string) => {
  const stripped = value.trim();
  if (!stripped) return 0;
  const matches = stripped.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (!matches) return 1;
  const trailing = stripped.replace(matches.join(""), "").trim();
  return matches.length + (trailing ? 1 : 0);
};

const toTitle = (value: string | undefined) => {
  const compact = (value?.trim() || "This stop").replace(/\s+/g, " ");
  const governedMatch = GOVERNED_TITLE_PATTERNS.find(entry =>
    entry.pattern.test(compact)
  );
  if (governedMatch) return governedMatch.label;

  if (
    compact.length > 80 ||
    compact.includes("?") ||
    /\b(?:you(?:'ll| will| can)|we(?:'ll| will)|your guide|our guide)\b/i.test(
      compact
    )
  ) {
    return (
      compact
        .replace(
          /\b(?:you(?:'ll| will| can)|we(?:'ll| will)|your guide|our guide)\b/gi,
          ""
        )
        .split(/[,.!?]/)[0]
        ?.trim()
        .slice(0, 60) || "This stop"
    );
  }

  return compact;
};

const titleTokenSet = (title: string) => new Set(wordTokens(title));

const sanitizeSourcePhrase = (value: string, title: string) => {
  const titleTokens = titleTokenSet(title);
  const firstSentence =
    value
      .replace(/<[^>]+>/g, " ")
      .replace(/\([^)]*\)/g, " ")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)[0]
      ?.trim() ?? "";

  const cleaned = firstSentence
    .replace(
      /\b(?:you(?:'ll|’ll| will| can)?|we(?:'ll|’ll| will)?|your guide(?: will)?|our guide(?: will)?|guests?|travelers?)\b/gi,
      ""
    )
    .replace(
      /^(?:enjoy|experience|discover|visit|explore|see|take in|check out|pass(?: by)?)\s+/i,
      ""
    )
    .replace(/[;:]+/g, ",")
    .replace(/[.!?]+$/g, "")
    .trim();

  const lowerCleaned = cleaned.toLowerCase();
  const featurePhrases = [
    /\bferr(?:y|ies)\b/.test(lowerCleaned) ? "ferry access" : null,
    /\bformer prison\b|\bcellhouse\b|\bprison\b/.test(lowerCleaned)
      ? "former prison site context"
      : null,
    /\bapp[- ]guided\b|\bself[- ]guided\b|\baudio guide\b/.test(lowerCleaned)
      ? "app-guided format"
      : null,
    /\bwaterfall\b|\bfalls\b/.test(lowerCleaned) ? "waterfall views" : null,
    /\btrail\b|\bhik(?:e|ing)\b|\bwalk\b/.test(lowerCleaned)
      ? "trail time"
      : null,
    /\bwildlife\b|\banimals?\b/.test(lowerCleaned) ? "wildlife viewing" : null,
    /\bpanoramic\b|\bscenic\b|\bview(?:s|point)?\b/.test(lowerCleaned)
      ? "scenic views"
      : null,
    /\bwine\b|\btast(?:e|ing)\b|\bvineyard\b/.test(lowerCleaned)
      ? "wine-country context"
      : null,
    /\bhistoric\b|\bhistory\b|\blandmark\b/.test(lowerCleaned)
      ? "historic context"
      : null,
  ].filter((phrase): phrase is string => Boolean(phrase));

  if (featurePhrases.length > 0) {
    return featurePhrases
      .slice(0, 3)
      .join(", ")
      .replace(/, ([^,]*)$/, " and $1");
  }

  const tokens = cleaned
    .split(/\s+/)
    .map(token => token.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ""))
    .filter(Boolean);

  const usefulTokens = tokens.filter(token => {
    const normalized = token.toLowerCase();
    return (
      normalized.length > 2 &&
      !titleTokens.has(normalized) &&
      !/^(?:the|and|with|from|into|onto|that|this|there|their|your|will|can|for|you|our|are|has|have|guide|guests|guest|travelers|traveler|group|everyone|comfortable|make|sure|well|ll)$/.test(
        normalized
      )
    );
  });

  if (usefulTokens.length < 3) return null;
  return usefulTokens.slice(0, 8).join(" ").toLowerCase().replace(/,$/, "");
};

const contextClause = (item: GovernedItinerarySourceItem, title: string) => {
  const sourceContext = item.description
    ? sanitizeSourcePhrase(item.description, title)
    : null;
  if (sourceContext) return `with ${sourceContext}`;

  const admission = item.admissionNote?.trim();
  if (admission) return `with ${admission.replace(/[.!?]+$/g, "")}`;

  const duration = item.duration?.trim();
  if (duration) return `during the ${duration.replace(/[.!?]+$/g, "")} stop`;

  return item.stopType === "pass-by"
    ? "as part of the route"
    : "as a scheduled tour stop";
};

const enforceSingleSentence = (value: string) => {
  const compact = value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/,+/g, ",")
    .replace(/[;:]/g, ",")
    .trim();
  const firstSentence = compact.split(/(?<=[.!?])\s+/)[0]?.trim() ?? compact;
  return `${firstSentence.replace(/[.!?]+$/g, "")}.`;
};

export const rewriteEngine6ItineraryDescription = ({
  item,
  index,
}: RewriteArgs) => {
  const title = toTitle(item.title);
  const verbs = item.stopType === "pass-by" ? PASS_BY_VERBS : STOP_VERBS;
  const verb = verbs[index % verbs.length];
  const clause = contextClause(item, title);
  return enforceSingleSentence(`${verb} ${title} ${clause}`);
};

export const isEngine6GenericItineraryDescription = (value: string) =>
  GENERIC_ITINERARY_PATTERNS.some(pattern => pattern.test(value));

export const isEngine6SupplierMirroredItineraryText = ({
  source,
  target,
}: {
  source: string;
  target: string;
}) => {
  const normalizedSource = normalizeEngine6ItineraryComparisonText(source);
  const normalizedTarget = normalizeEngine6ItineraryComparisonText(target);
  if (!normalizedSource || !normalizedTarget) return false;
  if (normalizedSource === normalizedTarget) return true;
  if (
    normalizedSource.length >= 40 &&
    normalizedTarget.length >= 40 &&
    (normalizedSource.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedSource))
  ) {
    return true;
  }
  const sourceTokenCount = wordTokens(source).length;
  const targetTokenCount = wordTokens(target).length;
  if (sourceTokenCount < 10 || targetTokenCount < 10) {
    return false;
  }

  return (
    sharedNgramRatio(source, target, 3) >= 0.65 ||
    sharedNgramRatio(source, target, 4) >= 0.5
  );
};

const sentenceStarter = (value: string) =>
  value.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase();

export const validateEngine6GovernedItinerary = ({
  renderedItems,
  sourceItems = [],
  overviewText = null,
}: GovernedItineraryValidationArgs) => {
  const violations: string[] = [];
  const starterCounts = new Map<string, number>();

  renderedItems.forEach((item, index) => {
    const description = item.description?.trim() ?? "";
    if (!description) return;

    const sentenceCount = countEngine6ItinerarySentences(description);
    if (sentenceCount !== 1) {
      violations.push(
        `governed itinerary validation failed: stop ${index + 1} description must be exactly one concise sentence`
      );
    }

    const wordCount = description.split(/\s+/).filter(Boolean).length;
    if (wordCount > 32) {
      violations.push(
        `governed itinerary validation failed: stop ${index + 1} description must stay concise`
      );
    }

    if (isEngine6GenericItineraryDescription(description)) {
      violations.push(
        `governed itinerary validation failed: stop ${index + 1} description uses generic or mechanical phrasing`
      );
    }

    if (SUPPLIER_VOICE_PATTERNS.some(pattern => pattern.test(description))) {
      violations.push(
        `governed itinerary validation failed: stop ${index + 1} description keeps supplier-facing voice`
      );
    }

    const titleTokens = wordTokens(item.title ?? "");
    const descriptionTokens = new Set(wordTokens(description));
    if (
      titleTokens.length > 0 &&
      !titleTokens.some(token => descriptionTokens.has(token))
    ) {
      violations.push(
        `governed itinerary validation failed: stop ${index + 1} description lost destination/activity identity`
      );
    }

    const sourceDescription = sourceItems[index]?.description?.trim();
    if (
      sourceDescription &&
      isEngine6SupplierMirroredItineraryText({
        source: sourceDescription,
        target: description,
      })
    ) {
      violations.push(
        `governed itinerary validation failed: stop ${index + 1} description closely mirrors Viator itinerary prose`
      );
    }

    if (
      overviewText &&
      isEngine6SupplierMirroredItineraryText({
        source: overviewText,
        target: description,
      })
    ) {
      violations.push(
        `governed itinerary validation failed: stop ${index + 1} description repeats overview wording`
      );
    }

    const starter = sentenceStarter(description);
    if (starter) {
      starterCounts.set(starter, (starterCounts.get(starter) ?? 0) + 1);
    }
  });

  for (const [starter, count] of starterCounts) {
    if (renderedItems.length >= 3 && count >= 3) {
      violations.push(
        `governed itinerary validation failed: repetitive sentence structure starts with "${starter}"`
      );
    }
  }

  return violations;
};
