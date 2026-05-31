import { slugify } from "../utils/slugify";

import type { Engine6CategorySlug, Engine6Tour } from "./types";

const ENGINE6_META_DESCRIPTION_CLAMP_AT = 155;
const ENGINE6_BLOCKED_META_PATTERNS = [
  /public transportation options are available nearby/i,
  /confirmation will be received/i,
  /not wheelchair accessible/i,
  /most travelers can participate/i,
  /near public transportation/i,
  /infants must sit on laps/i,
  /service animals allowed/i,
  /not recommended for travelers/i,
  /this experience requires good weather/i,
];

export const ENGINE6_CATEGORY_LABELS: Record<Engine6CategorySlug, string> = {
  "off-road-tour": "Jeep Tour",
  "hiking-tour": "Hiking Tour",
  "bike-tour": "Bike Tour",
  "boat-tour": "Boat Tour",
  "paddle-tour": "Paddle Tour",
  "wildlife-tour": "Wildlife Tour",
  "snorkeling-tour": "Snorkeling Tour",
  "food-and-drink-tour": "Food & Drink Tour",
  "air-tour": "Air Tour",
  "sightseeing-tour": "Sightseeing Tour",
  "adventure-tour": "Adventure Tour",
  adventure: "Adventure Tour",
  hiking: "Hiking Tour",
  sightseeing: "Sightseeing Tour",
  wildlife: "Wildlife Tour",
  water: "Boat Tour",
};

export const formatEngine6CategoryLabel = (
  value: Engine6CategorySlug | string | null
): string | null => {
  if (!value) {
    return null;
  }

  const knownLabel = ENGINE6_CATEGORY_LABELS[value as Engine6CategorySlug];
  if (knownLabel) {
    return knownLabel;
  }

  return value.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
};

const ENGINE6_GENERATED_DESCRIPTION_PREFIX_PATTERN =
  /^[A-Za-z]+(?:[ -][A-Za-z]+)*\s+(?:guided tour|Bike tour|Boat tour|Hiking tour|Paddle tour|Air tour|Airboat Tours|Water Sports|Cruises And Sailing|Attractions And Museums|Multi Day Tours):\s*/i;

export const stripEngine6GeneratedDescriptionPrefix = (value: string) =>
  value
    .replace(ENGINE6_GENERATED_DESCRIPTION_PREFIX_PATTERN, "")
    .replace(/^[-:|\s]+/, "")
    .trim();

export const hasEngine6GeneratedDescriptionPrefix = (value: string) =>
  ENGINE6_GENERATED_DESCRIPTION_PREFIX_PATTERN.test(value.trim());

export const cleanEngine6Description = (text: string): string => {
  if (!text) {
    return "";
  }

  const cleaned = text
    .replace(/\.\./g, ".")
    .replace(/Best tour.*?reviews\./gi, "")
    .replace(/Rated\s*\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?[^.]*\./gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();

  return stripEngine6GeneratedDescriptionPrefix(cleaned);
};

export const clampEngine6MetaDescription = (
  text: string,
  maxLength = ENGINE6_META_DESCRIPTION_CLAMP_AT
) => {
  if (text.length <= maxLength) {
    return text;
  }

  const clipped = text.slice(0, maxLength).trim();
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const safeClipped =
    lastWordBoundary > 100 ? clipped.slice(0, lastWordBoundary) : clipped;

  return `${safeClipped.trim()}...`;
};

export const buildMetaDescription = (input: string | undefined | null) => {
  if (!input) {
    return "";
  }

  const clean = cleanEngine6Description(
    input
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  if (clean.length <= ENGINE6_META_DESCRIPTION_CLAMP_AT) {
    return clean;
  }

  return clampEngine6MetaDescription(clean);
};

export const buildEngine6MetaDescription = (description: string) =>
  buildMetaDescription(description);

const ENGINE6_TITLE_STOP_WORDS = new Set([
  "tour",
  "tours",
  "experience",
  "experiences",
  "trip",
  "trips",
  "activity",
  "activities",
]);

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const normalizeEngine6ReadableTitle = (rawTitle: string) => {
  const compact = rawTitle.replace(/[_|]+/g, " ").replace(/\s+/g, " ").trim();
  const withoutStitching = compact
    .replace(/(\b\w+\b)\s+\1\b/gi, "$1")
    .replace(/\b(in)\s+([a-z][a-z\s]+?)\s+\1\s+\2\b/gi, "in $2")
    .replace(/\bjail\s+house\b/gi, "jailhouse")
    .replace(/\bapp\s+guided\b/gi, "App-Guided")
    .replace(/\bself\s+guided\b/gi, "Self-Guided")
    .replace(/\s+/g, " ")
    .trim();

  const words = withoutStitching.split(" ");
  if (words.length <= 2) {
    return withoutStitching;
  }

  const tail = words[words.length - 1] ?? "";
  if (tail.length <= 4 && !ENGINE6_TITLE_STOP_WORDS.has(tail.toLowerCase())) {
    return words.slice(0, -1).join(" ");
  }

  return withoutStitching;
};

export const buildEngine6SeoTitle = ({
  title,
  city,
  state,
}: {
  title: string;
  city: string;
  state: string;
}) => {
  const normalizedTitle = normalizeEngine6ReadableTitle(title);
  const normalizedCity = toTitleCase(city.trim());
  const normalizedState = toTitleCase(state.trim());
  const locationLabel = [normalizedCity, normalizedState]
    .filter(Boolean)
    .join(", ");

  if (!locationLabel) {
    return normalizedTitle;
  }

  const titleIncludesCity = normalizedTitle
    .toLowerCase()
    .includes(normalizedCity.toLowerCase());

  if (titleIncludesCity) {
    return normalizedTitle;
  }

  return `${normalizedTitle} | ${normalizedCity}`;
};

const removeBlockedOperationalFiller = (value: string) => {
  let cleaned = value;
  for (const pattern of ENGINE6_BLOCKED_META_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();
};

export const isEngine6OperationalFiller = (value: string) =>
  ENGINE6_BLOCKED_META_PATTERNS.some(pattern => pattern.test(value));

const ENGINE6_OPTIMIZED_DESCRIPTION_MIN = 135;
const ENGINE6_OPTIMIZED_DESCRIPTION_MAX = 155;
const ENGINE6_META_DESCRIPTION_HARD_MAX = 160;
const ENGINE6_ACTIVE_DESCRIPTION_START_PATTERN =
  /^(Explore|Ride|Paddle|Sail|Discover|Visit|Fly|See|Cruise|Hike|Kayak|Bike|Drive|Taste|Tour|Walk|Glide)\b/i;
const ENGINE6_GENERIC_MARKETING_LEAD_PATTERNS = [
  /^this\s+(?:private\s+)?(?:tour|experience|outing|activity)\s+(?:offers|provides|gives|is)\s+(?:an?\s+)?(?:unparalleled\s+opportunity\s+to\s+)?/i,
  /^this\s+[^.!?]{0,90}?\s+private\s+tour,?\s+(?:offers\s+)?(?:an?\s+)?(?:unparalleled\s+opportunity\s+(?:to|for\s+travelers\s+to)\s+)?/i,
  /^unparalleled\s+opportunity\s+(?:to|for\s+travelers\s+to)\s+/i,
  /^the\s+private\s+tour\s+"?[^"]+"?\s+combines\s+/i,
  /^join\s+us\s+for\s+(?:an?\s+)?/i,
  /^come\s+discover\s+/i,
  /^we\s+created\s+[^.!?]*[.!?]\s*/i,
  /^your\s+private\s+[^.!?]*?\s+will\s+showcase\s+/i,
];

const ENGINE6_AWKWARD_META_BOILERPLATE_PATTERNS = [
  /\bthis tour offers\b/gi,
  /\bthis experience provides\b/gi,
  /\bwith clear logistics\b/gi,
  /\bclear logistics\b/gi,
  /\btraveler-friendly pace\b/gi,
  /\btraveler-focused logistics\b/gi,
  /\beasy logistics\b/gi,
  /\bguide support\b/gi,
  /\bguided local context\b/gi,
  /\bscenic views\b/gi,
  /\bmemorable experience\b/gi,
];

const ENGINE6_BAD_SOURCE_PROSE_PATTERNS = [
  ...ENGINE6_BLOCKED_META_PATTERNS,
  /\bbest tour in\b/i,
  /\brated\s*\d+(?:\.\d+)?\s*\/\s*5\b/i,
  /\b\d+\s+reviews?\b/i,
  /\bSEO_CANONICAL\b/i,
  /\bguide support\b/i,
  /\beasy logistics\b/i,
  /\btraveler-friendly pace\b/i,
  /\bguided local context\b/i,
  /\bscenic views\b/i,
  /\bmemorable experience\b/i,
];

const sentenceCase = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

const stripGenericMarketingLead = (value: string) => {
  let cleaned = value.trim();
  for (const pattern of ENGINE6_GENERIC_MARKETING_LEAD_PATTERNS) {
    cleaned = cleaned.replace(pattern, "").trim();
  }
  return sentenceCase(cleaned);
};

const splitDescriptionSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const chooseEngine6ExperienceVerb = ({
  categoryLabel,
  title,
  sourceDescription,
}: {
  categoryLabel?: string | null;
  title: string;
  sourceDescription: string;
}) => {
  const category = (categoryLabel ?? "").toLowerCase();
  const titleIdentity = `${title} ${category}`.toLowerCase();
  const identity = `${title} ${sourceDescription}`.toLowerCase();
  if (
    /bike|cycling|e-bike/.test(titleIdentity) ||
    /bike|cycling/.test(category)
  ) {
    return "Ride";
  }
  if (
    /paddle|kayak|canoe|sup/.test(titleIdentity) ||
    /paddle|kayak|canoe|sup/.test(category)
  ) {
    return "Paddle";
  }
  if (
    /\b(?:helicopter|paraglid|parasail(?:ing)?|flight|fly)\b/.test(identity)
  ) {
    return "Fly";
  }
  if (
    /\b(?:hiking|hike|walking)\b/.test(titleIdentity) ||
    /hiking|walk/.test(category)
  ) {
    return "Hike";
  }
  if (
    /museum|admission|ticket|attraction|theme park|universal studios/.test(
      titleIdentity
    ) ||
    /museum|attraction/.test(category)
  ) {
    return "Visit";
  }
  if (
    /sightseeing|celebrity|hollywood|beverly|landmark|city tour|private.*tour/.test(
      titleIdentity
    )
  ) {
    return "Explore";
  }
  if (
    /boat|cruise|sail|yacht|catamaran|harbor/.test(titleIdentity) ||
    (/boat|water|cruise|sailing/.test(category) &&
      /boat|cruise|sail|yacht|catamaran|harbor|bay|water/.test(identity))
  ) {
    return "Sail";
  }
  if (
    /food|drink|wine|tasting|chocolate/.test(identity) ||
    /food|drink|wine/.test(category)
  ) {
    return "Taste";
  }
  return "Explore";
};

const ENGINE6_ATTRACTION_HINT_PATTERN =
  /\b(?:The\s+)?[A-Z][A-Za-z'’]+(?:\s+[A-Z][A-Za-z'’]+){0,4}\s+(?:Sign|Bridge|Bay|Harbor|Lake|Park|Canyon|Falls|Waterfalls|Glacier|Island|Pier|Wharf|Beach|Valley|Mountain|Mount|Museum|Studios?|Observatory|River)\b/;

const extractEngine6TitleSubject = (title: string, city: string) => {
  const readableTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+\d{4,}$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const subject = /\b(?:of|on|through|around|at|to|in)\s+(?:the\s+)?(.+)$/i
    .exec(readableTitle)?.[1]
    ?.replace(/^the\s+/i, "")
    .trim();

  if (
    !subject ||
    subject.length < 4 ||
    subject.length > 70 ||
    subject.toLowerCase() === city.toLowerCase()
  ) {
    return null;
  }

  return subject;
};

const extractEngine6PriorityAttraction = (value: string) => {
  const match = ENGINE6_ATTRACTION_HINT_PATTERN.exec(value);
  return match?.[0]?.replace(/^Iconic\s+/i, "").trim() ?? null;
};

const buildEngine6ExperienceLead = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const verb = chooseEngine6ExperienceVerb({
    categoryLabel,
    title,
    sourceDescription,
  });
  const readableTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\s+\d{4,}$/i, "")
    .trim();
  const normalizedCity = city.trim();
  const subject = extractEngine6TitleSubject(readableTitle, normalizedCity);

  if (subject && /^(Ride|Paddle|Sail|Fly|Hike)$/i.test(verb)) {
    const subjectIncludesCity =
      normalizedCity.length > 0 &&
      subject.toLowerCase().includes(normalizedCity.toLowerCase());
    return `${verb} ${subject}${normalizedCity && !subjectIncludesCity ? ` in ${normalizedCity}` : ""}`
      .replace(/\s+/g, " ")
      .trim();
  }

  const titleIncludesCity =
    normalizedCity.length > 0 &&
    readableTitle.toLowerCase().includes(normalizedCity.toLowerCase());
  const destination =
    titleIncludesCity || !normalizedCity
      ? readableTitle
      : `${readableTitle} in ${normalizedCity}`;

  return `${verb} ${destination}`.replace(/\s+/g, " ").trim();
};

const trimDescriptionToWordBoundary = (value: string, maxLength: number) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const clipped = normalized.slice(0, maxLength).trim();
  const lastSentenceBoundary = Math.max(
    clipped.lastIndexOf("."),
    clipped.lastIndexOf("!"),
    clipped.lastIndexOf("?")
  );
  if (lastSentenceBoundary >= ENGINE6_OPTIMIZED_DESCRIPTION_MIN - 1) {
    return clipped.slice(0, lastSentenceBoundary + 1).trim();
  }

  const lastSpace = clipped.lastIndexOf(" ");
  const safeClipped = lastSpace > 100 ? clipped.slice(0, lastSpace) : clipped;
  let cleaned = safeClipped.replace(/[,:;\s-]+$/, "").trim();
  cleaned = cleaned
    .replace(
      /\b(?:but\s+for\s+those|from\s+the|for\s+those|from|with|and|for|of|in|on|at|to|while|that|this|those|the|a|an)$/i,
      ""
    )
    .replace(/[,:;\s-]+$/, "")
    .trim();
  return cleaned && !/[.!?]$/.test(cleaned) ? `${cleaned}.` : cleaned;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const removeDuplicateTitleRestatement = (value: string, title: string) => {
  const readableTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\s+\d{4,}$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!readableTitle) return value;

  const titlePattern = new RegExp(
    `^${escapeRegExp(readableTitle)}\\s+(?:is|offers|provides|gives|takes|brings|combines|features)\\s+`,
    "i"
  );

  return value.replace(titlePattern, "").trim();
};

const removeAwkwardMetaBoilerplate = (value: string, title: string) => {
  let cleaned = value;
  for (const pattern of ENGINE6_AWKWARD_META_BOILERPLATE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  const readableTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\s+\d{4,}$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (readableTitle) {
    cleaned = cleaned.replace(
      new RegExp(`^Explore\\s+${escapeRegExp(readableTitle)}\\s+`, "i"),
      ""
    );
  }

  return cleaned
    .replace(/\b[A-Z0-9]{2,}_[A-Z0-9_]+\b/g, "")
    .replace(/\b\d{3,}[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)?\b/g, "")
    .replace(/\b[A-Z]{2,}\d{2,}[A-Z0-9]*(?:_[A-Z0-9]+)?\b/g, "")
    .replace(/\s*,\s*,+/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();
};

const cleanEngine6SourceProseForMeta = (value: string, title: string) => {
  const cleaned = removeAwkwardMetaBoilerplate(
    removeDuplicateTitleRestatement(
      stripGenericMarketingLead(
        stripEngine6GeneratedDescriptionPrefix(
          removeBlockedOperationalFiller(
            cleanEngine6Description(
              value
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
            )
          )
        )
      ),
      title
    ),
    title
  );

  return sentenceCase(
    cleaned
      .replace(/\s*,\s*(?:and\s*)?\./g, ".")
      .replace(/\s+([,.;!?])/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
};

const isUsableEngine6MetaSource = (value: string) => {
  const normalized = value.trim();
  if (normalized.length < 50) return false;
  if (
    ENGINE6_BAD_SOURCE_PROSE_PATTERNS.some(pattern => pattern.test(normalized))
  ) {
    return false;
  }
  const words = normalized.split(/\s+/).filter(Boolean);
  return words.length >= 8;
};

const normalizeForDuplicateComparison = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const appendSourceSentenceIfUseful = (base: string, sentence: string) => {
  const cleanedSentence = sentence.trim();
  if (!cleanedSentence) return base;

  const normalizedBase = normalizeForDuplicateComparison(base);
  const normalizedSentence = normalizeForDuplicateComparison(cleanedSentence);
  if (
    normalizedSentence.length < 20 ||
    normalizedBase.includes(normalizedSentence) ||
    normalizedSentence.includes(normalizedBase)
  ) {
    return base;
  }

  const next = `${base.replace(/[.!?]?$/, ".")} ${cleanedSentence}`
    .replace(/\s+/g, " ")
    .trim();
  return next.length <= ENGINE6_META_DESCRIPTION_HARD_MAX ? next : base;
};

const composeEngine6SourceMetaDescription = (
  source: string,
  supportingSources: string[] = [],
  context?: { city: string; categoryLabel?: string | null }
) => {
  const sentences = splitDescriptionSentences(source);
  const parts = sentences.length > 0 ? sentences : [source];
  let composed = "";

  for (const part of parts) {
    const next = composed ? `${composed} ${part}` : part;
    if (next.length <= ENGINE6_OPTIMIZED_DESCRIPTION_MAX) {
      composed = next;
      if (
        composed.length >= ENGINE6_OPTIMIZED_DESCRIPTION_MIN &&
        /[.!?]$/.test(composed)
      ) {
        break;
      }
      continue;
    }

    if (!composed) {
      composed = trimDescriptionToWordBoundary(
        part,
        ENGINE6_META_DESCRIPTION_HARD_MAX
      );
    }
    break;
  }

  if (!composed) {
    composed = trimDescriptionToWordBoundary(
      source,
      ENGINE6_META_DESCRIPTION_HARD_MAX
    );
  }

  for (const supportingSource of supportingSources) {
    if (composed.length >= ENGINE6_OPTIMIZED_DESCRIPTION_MIN) break;
    const supportingSentences = splitDescriptionSentences(supportingSource);
    for (const sentence of supportingSentences.length > 0
      ? supportingSentences
      : [supportingSource]) {
      const next = appendSourceSentenceIfUseful(composed, sentence);
      if (next !== composed) {
        composed = next;
      }
      if (composed.length >= ENGINE6_OPTIMIZED_DESCRIPTION_MIN) break;
    }
  }

  if (composed.length < 120 && context) {
    const category = (context.categoryLabel ?? "experience")
      .toLowerCase()
      .replace(/\btour\b/i, "tour");
    const city = context.city.trim();
    const contextPhrase = city
      ? ` on a ${city} ${category}`
      : ` on a ${category}`;
    const candidate = `${composed.replace(/[.!?]?$/, "")}${contextPhrase}.`
      .replace(/\s+/g, " ")
      .trim();
    if (candidate.length <= ENGINE6_META_DESCRIPTION_HARD_MAX) {
      composed = candidate;
    }
  }

  if (composed.length < 120) {
    const candidate = `${composed.replace(/[.!?]?$/, "")} with route details.`
      .replace(/\s+/g, " ")
      .trim();
    if (candidate.length <= ENGINE6_META_DESCRIPTION_HARD_MAX) {
      composed = candidate;
    }
  }

  if (composed.length > ENGINE6_META_DESCRIPTION_HARD_MAX) {
    composed = trimDescriptionToWordBoundary(
      composed,
      ENGINE6_META_DESCRIPTION_HARD_MAX
    );
  }

  const normalized = composed
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();

  const punctuated =
    normalized && !/[.!?]$/.test(normalized) ? `${normalized}.` : normalized;

  return punctuated.length > ENGINE6_META_DESCRIPTION_HARD_MAX
    ? trimDescriptionToWordBoundary(
        punctuated,
        ENGINE6_META_DESCRIPTION_HARD_MAX
      )
    : punctuated;
};

const ENGINE6_LANDMARK_NAME_HINT_PATTERN =
  /\b(?:[A-Z][A-Za-z'’&]+|MGM|VIP|NYC)(?:\s+(?:[A-Z][A-Za-z'’&]+|MGM|VIP|NYC)){0,5}\s+(?:Arm|Bay|Beach|Boardwalk|Bridge|Canyon|Center|Centre|Corridor|Drive|Falls|Fields|Fountain|Fountains|Glacier|Harbor|Headlands|Island|Lake|Memorial|Monument|Mountain|Mount|Museum|Park|Point|River|Sphere|Strip|Valley|Wharf|Woods)\b/g;

const ENGINE6_OPERATIONAL_STOP_PATTERN =
  /\b(?:check-?in|briefing|departure|drop-?off|pickup|return|segment|transfer|orientation)\b/i;
const ENGINE6_RECOGNIZABLE_STOP_PATTERN =
  /\b(?:Arm|Bay|Beach|Boardwalk|Bridge|Canyon|Center|Centre|Falls|Fields|Fountain|Fountains|Glacier|Harbor|Headlands|Island|Lake|Memorial|Monument|Mountain|Mount|Museum|Park|Point|River|Sphere|Strip|Valley|Wharf|Woods|Zion|Bryce|Girdwood|Sausalito|Beluga|Bethesda|Bow)\b/i;

const ENGINE6_STOP_SUFFIX_CLEANERS = [
  /\s*\((?:pass-by|drive-by)\)\s*$/i,
  /\s+(?:departure|return|segment|viewpoints?|highlights?|orientation|stop|visit)\s*$/i,
];

const normalizeEngine6LandmarkName = (value: string, city: string) => {
  let cleaned = value
    .replace(/\bthe\s+/gi, "")
    .replace(/\s+/g, " ")
    .replace(/[,:;.!?]+$/g, "")
    .trim();

  let previous = "";
  while (previous !== cleaned) {
    previous = cleaned;
    for (const pattern of ENGINE6_STOP_SUFFIX_CLEANERS) {
      cleaned = cleaned.replace(pattern, "").trim();
    }
  }

  cleaned = cleaned
    .replace(/^scenic\s+transfer\s+to\s+/i, "")
    .replace(/^guided\s+/i, "")
    .replace(/,.*$/g, "")
    .replace(/\s+drive$/i, " Drive")
    .trim();

  if (/sphere/i.test(cleaned) && city) {
    return `${city} Sphere`;
  }

  if (/^Strip\b/i.test(cleaned)) {
    return "major Strip landmarks";
  }

  return cleaned;
};

const shouldUseEngine6StopTitleAsLandmark = (value: string) => {
  if (!value || value.length < 3) return false;
  if (!ENGINE6_RECOGNIZABLE_STOP_PATTERN.test(value)) return false;
  if (ENGINE6_OPERATIONAL_STOP_PATTERN.test(value)) {
    return /\b(?:Sphere|Strip|Bridge|Fountain|Point|Park|Monument|Center|Arm|Girdwood|Zion|Bryce)\b/i.test(
      value
    );
  }
  return true;
};

const extractEngine6LandmarkNames = (value: string, city: string) => {
  const matches = value.match(ENGINE6_LANDMARK_NAME_HINT_PATTERN) ?? [];
  return matches
    .map(match => normalizeEngine6LandmarkName(match, city))
    .filter(match => shouldUseEngine6StopTitleAsLandmark(match));
};

const dedupeEngine6Landmarks = (values: string[]) => {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const normalized = normalizeForDuplicateComparison(value);
    if (!normalized || seen.has(normalized)) continue;
    if (
      result.some(existing => {
        const normalizedExisting = normalizeForDuplicateComparison(existing);
        return (
          normalizedExisting.includes(normalized) ||
          normalized.includes(normalizedExisting)
        );
      })
    ) {
      continue;
    }
    seen.add(normalized);
    result.push(value);
  }

  return result;
};

const formatEngine6LandmarkList = (values: string[]) => {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
};

const buildEngine6ActivityPhrase = ({
  title,
  categoryLabel,
}: {
  title: string;
  categoryLabel?: string | null;
}) => {
  const identity = `${title} ${categoryLabel ?? ""}`.toLowerCase();
  if (/pedicab/.test(identity)) return "pedicab tour";
  if (/full[-\s]?day/.test(identity) && /small[-\s]?group/.test(identity)) {
    return "full-day small-group tour";
  }
  if (/small[-\s]?group/.test(identity)) return "small-group tour";
  if (/driv/.test(identity)) return "sightseeing drive";
  if (/parasail/.test(identity)) return "parasailing outing";
  if (/yacht/.test(identity)) return "yacht cruise";
  if (/cruise|boat|sail/.test(identity)) return "cruise";
  if (/bike|cycling|e-bike/.test(identity)) return "bike tour";
  if (/wildlife/.test(identity)) return "wildlife tour";
  if (/hiking|hike/.test(identity)) return "hiking tour";
  if (/sightseeing/.test(identity)) return "sightseeing tour";
  return (categoryLabel ?? "tour")
    .toLowerCase()
    .replace(/\bday trips\b/g, "day trip");
};

const appendEngine6SerpDetailIfUseful = (base: string, source: string) => {
  const lower = source.toLowerCase();
  const candidatePhrases = [
    /live (?:guide )?narration/.test(lower)
      ? "with live narration on entertainment districts"
      : null,
    /canyon/.test(lower) && /short walks?/.test(lower)
      ? "with canyon viewpoints and short walks"
      : null,
    /redwood/.test(lower) ? "with redwood trails" : null,
    /photo/.test(lower) ? "with photo stops" : null,
    /licensed local guide/.test(lower) ? "with a licensed local guide" : null,
    /safety/.test(lower) ? "with a safety briefing" : null,
    /waterfront|coastal|harbor/.test(lower) ? "with waterfront scenery" : null,
  ].filter((phrase): phrase is string => Boolean(phrase));

  let composed = base;
  for (const phrase of candidatePhrases) {
    const separator = /\bwith\b/i.test(composed)
      ? "and"
      : phrase.startsWith("with")
        ? ""
        : "with";
    const normalizedPhrase = separator
      ? `${separator} ${phrase.replace(/^with\s+/i, "")}`
      : phrase;
    const candidate = `${composed.replace(/[.!?]$/, "")} ${normalizedPhrase}.`
      .replace(/\s+/g, " ")
      .trim();
    if (candidate.length <= ENGINE6_META_DESCRIPTION_HARD_MAX) {
      composed = candidate;
      if (composed.length >= ENGINE6_OPTIMIZED_DESCRIPTION_MIN) return composed;
    }
  }

  return composed;
};

const buildEngine6ItinerarySerpDescription = ({
  title,
  city,
  categoryLabel,
  itineraryStops,
  sourceDescriptions,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  itineraryStops: Array<{ title: string; description?: string | null }>;
  sourceDescriptions: string[];
}) => {
  if (itineraryStops.length === 0) return null;

  const sourceText = sourceDescriptions.filter(Boolean).join(" ");
  const landmarks = dedupeEngine6Landmarks(
    itineraryStops.flatMap(stop => {
      const titleLandmark = normalizeEngine6LandmarkName(stop.title, city);
      const titleCandidates = shouldUseEngine6StopTitleAsLandmark(titleLandmark)
        ? [titleLandmark]
        : [];
      return [
        ...titleCandidates,
        ...extractEngine6LandmarkNames(stop.description ?? "", city),
      ];
    })
  );

  if (/sphere/i.test(`${title} ${sourceText}`) && /strip/i.test(sourceText)) {
    landmarks.unshift(`${city} Sphere`, "major Strip landmarks");
  }

  const dedupedLandmarks = dedupeEngine6Landmarks(landmarks);
  if (dedupedLandmarks.length === 0) return null;

  const baseActivity = buildEngine6ActivityPhrase({ title, categoryLabel });
  const activity =
    /full[-\s]?day/i.test(sourceText) && baseActivity === "small-group tour"
      ? "full-day small-group tour"
      : baseActivity;
  const titleIdentity = title.toLowerCase();
  const routeLandmark = dedupedLandmarks.find(landmark =>
    /\b(?:Arm|Drive)\b/i.test(landmark)
  );
  const uniqueLandmarks = routeLandmark
    ? [
        routeLandmark,
        ...dedupedLandmarks.filter(landmark => landmark !== routeLandmark),
      ].slice(0, 4)
    : dedupedLandmarks.slice(0, 4);
  const destinationLandmarks = routeLandmark
    ? uniqueLandmarks.filter(landmark => landmark !== routeLandmark).slice(0, 3)
    : uniqueLandmarks;
  const landmarkList = formatEngine6LandmarkList(destinationLandmarks);

  let composed = "";
  if (/parasail/.test(titleIdentity)) {
    composed = `Fly above ${landmarkList} on a ${activity} from ${city}.`;
  } else if (/pedicab/.test(titleIdentity)) {
    composed = `Ride through ${city.includes("Central Park") ? city : "Central Park"} to ${landmarkList} on a private ${activity}.`;
  } else if (/bike|cycling|e-bike/.test(`${titleIdentity} ${activity}`)) {
    composed = `Ride from ${city} to ${landmarkList} on a guided ${activity}.`;
  } else if (/cruise|yacht/.test(activity)) {
    composed = `Cruise ${city ? `${city} ` : ""}to ${landmarkList} on a ${activity}.`;
  } else if (/driv|sightseeing/.test(activity)) {
    const seeList = landmarkList.startsWith(city)
      ? `the ${landmarkList}`
      : landmarkList;
    composed = `See ${seeList} on a guided ${activity} through ${city}.`;
  } else if (/National Park/i.test(landmarkList) && city) {
    composed = `Travel from ${city} to ${landmarkList} on a ${activity}.`;
  } else if (routeLandmark && destinationLandmarks.length > 0) {
    composed = `Travel from ${city} along ${routeLandmark} to ${landmarkList} on a ${activity}.`;
  } else {
    composed = `Visit ${landmarkList} on a ${activity}${city ? ` from ${city}` : ""}.`;
  }

  composed = composed.replace(/\s+/g, " ").trim();

  if (composed.length < ENGINE6_OPTIMIZED_DESCRIPTION_MIN) {
    composed = appendEngine6SerpDetailIfUseful(composed, sourceText);
  }

  if (composed.length > ENGINE6_META_DESCRIPTION_HARD_MAX) {
    composed = trimDescriptionToWordBoundary(
      composed,
      ENGINE6_META_DESCRIPTION_HARD_MAX
    );
  }

  const cleaned = removeAwkwardMetaBoilerplate(composed, title);
  if (
    cleaned.length < 120 ||
    ENGINE6_BAD_SOURCE_PROSE_PATTERNS.some(pattern => pattern.test(cleaned))
  ) {
    return null;
  }

  return cleaned;
};

const buildEngine6FallbackMetaDescription = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const lead = buildEngine6ExperienceLead({
    title,
    city,
    categoryLabel,
    sourceDescription,
  });
  const category = (categoryLabel ?? "experience").toLowerCase();
  return trimDescriptionToWordBoundary(
    `${lead} on a ${category} with destination highlights and practical local context.`,
    ENGINE6_META_DESCRIPTION_HARD_MAX
  );
};

export const buildEngine6OptimizedDescription = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
  sourceDescriptions,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
  sourceDescriptions?: Array<string | null | undefined>;
}) => {
  const candidates = [...(sourceDescriptions ?? []), sourceDescription];

  const cleanedCandidates = candidates
    .map(candidate =>
      candidate ? cleanEngine6SourceProseForMeta(candidate, title) : ""
    )
    .filter(Boolean);

  for (const cleanedSource of cleanedCandidates) {
    if (!isUsableEngine6MetaSource(cleanedSource)) continue;
    return composeEngine6SourceMetaDescription(
      cleanedSource,
      cleanedCandidates.filter(candidate => candidate !== cleanedSource),
      { city, categoryLabel }
    );
  }

  const cleanedFallbackSource = cleanEngine6SourceProseForMeta(
    sourceDescription,
    title
  );
  return buildEngine6FallbackMetaDescription({
    title,
    city,
    categoryLabel,
    sourceDescription: cleanedFallbackSource || sourceDescription,
  });
};

const ENGINE6_RICH_PRODUCT_DESCRIPTION_MIN_WORDS = 75;
const ENGINE6_RICH_PRODUCT_DESCRIPTION_MAX_WORDS = 120;
const ENGINE6_RICH_PRODUCT_BLOCKED_PHRASES = [
  /\bguide support\b/gi,
  /\beasy logistics\b/gi,
  /\btraveler-friendly pace\b/gi,
  /\bmemorable experience\b/gi,
  /\bscenic views\b/gi,
  /\bguided local context\b/gi,
  /\bwith clear logistics\b/gi,
  /\bpractical local context\b/gi,
  /\bclear guidance\b/gi,
  /\brelaxed pace\b/gi,
];

const countEngine6Words = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const normalizeEngine6Sentence = (value: string) => {
  const cleaned = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();

  if (!cleaned) return "";
  const withoutDangling = cleaned.replace(/[,:;\s-]+$/g, "").trim();
  return /[.!?]$/.test(withoutDangling)
    ? withoutDangling
    : `${withoutDangling}.`;
};

const cleanEngine6RichProductSource = (value: string, title: string) => {
  let cleaned = cleanEngine6SourceProseForMeta(value, title)
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of ENGINE6_RICH_PRODUCT_BLOCKED_PHRASES) {
    cleaned = cleaned.replace(pattern, "").replace(/\s+/g, " ").trim();
  }

  const readableTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\s+\d{4,}$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (readableTitle) {
    cleaned = cleaned
      .replace(
        new RegExp(
          `^${escapeRegExp(readableTitle)}\\s+(?:is|offers|provides|gives|takes|brings|combines|features)\\s+`,
          "i"
        ),
        ""
      )
      .replace(new RegExp(`^${escapeRegExp(readableTitle)}[,;:\\s-]+`, "i"), "")
      .trim();
  }

  return sentenceCase(cleaned);
};

const appendEngine6RichSentenceIfUseful = (
  sentences: string[],
  sentence: string,
  maxWords = ENGINE6_RICH_PRODUCT_DESCRIPTION_MAX_WORDS
) => {
  const normalized = normalizeEngine6Sentence(sentence);
  if (!normalized) return false;
  if (
    ENGINE6_BAD_SOURCE_PROSE_PATTERNS.some(pattern => pattern.test(normalized))
  ) {
    return false;
  }
  const normalizedCandidate = normalizeForDuplicateComparison(normalized);
  if (normalizedCandidate.length < 12) return false;
  if (
    sentences.some(existing => {
      const normalizedExisting = normalizeForDuplicateComparison(existing);
      return (
        normalizedExisting.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normalizedExisting)
      );
    })
  ) {
    return false;
  }

  const candidate = [...sentences, normalized].join(" ");
  if (countEngine6Words(candidate) > maxWords) return false;
  sentences.push(normalized);
  return true;
};

const summarizeEngine6List = (values: string[], limit = 4) =>
  values
    .map(value =>
      value
        .replace(/<[^>]*>/g, " ")
        .replace(/[.!?]+$/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .filter(
      (value, index, list) =>
        list.findIndex(
          other =>
            normalizeForDuplicateComparison(other) ===
            normalizeForDuplicateComparison(value)
        ) === index
    )
    .slice(0, limit);

const buildEngine6RichItinerarySentence = (
  itineraryStops: Array<{ title: string; description?: string | null }>
) => {
  const stops = summarizeEngine6List(
    itineraryStops.map(stop => stop.title).filter(Boolean),
    4
  );
  if (stops.length === 0) return "";
  return normalizeEngine6Sentence(
    `The route includes ${formatEngine6LandmarkList(stops)}`
  );
};

const buildEngine6RichHighlightsSentence = (highlights: string[]) => {
  const items = summarizeEngine6List(highlights, 3);
  if (items.length === 0) return "";
  return normalizeEngine6Sentence(
    `Highlights include ${formatEngine6LandmarkList(items)}`
  );
};

const buildEngine6RichInclusionsSentence = (included: string[]) => {
  const items = summarizeEngine6List(included, 3);
  if (items.length === 0) return "";
  return normalizeEngine6Sentence(
    `Included elements cover ${formatEngine6LandmarkList(items)}`
  );
};

const buildEngine6RichDurationSentence = ({
  durationText,
  categoryLabel,
}: {
  durationText?: string | null;
  categoryLabel?: string | null;
}) => {
  const duration = durationText?.trim();
  const category = categoryLabel?.trim().toLowerCase();
  if (duration && category) {
    return normalizeEngine6Sentence(
      `The ${category} typically lasts ${duration}`
    );
  }
  if (duration) {
    return normalizeEngine6Sentence(
      `The experience typically lasts ${duration}`
    );
  }
  if (category) {
    return normalizeEngine6Sentence(`The format is a ${category}`);
  }
  return "";
};

export const buildEngine6RichProductDescription = ({
  title,
  city,
  categoryLabel,
  overviewText,
  description,
  itineraryStops = [],
  highlights = [],
  included = [],
  durationText,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  overviewText?: string | null;
  description?: string | null;
  itineraryStops?: Array<{ title: string; description?: string | null }>;
  highlights?: string[];
  included?: string[];
  durationText?: string | null;
}) => {
  const sentences: string[] = [];
  const primarySources = [overviewText, description]
    .map(value => (value ? cleanEngine6RichProductSource(value, title) : ""))
    .filter(Boolean);

  for (const source of primarySources) {
    for (const sentence of splitDescriptionSentences(source)) {
      appendEngine6RichSentenceIfUseful(sentences, sentence);
      if (
        countEngine6Words(sentences.join(" ")) >=
        ENGINE6_RICH_PRODUCT_DESCRIPTION_MIN_WORDS
      ) {
        break;
      }
    }
    if (
      countEngine6Words(sentences.join(" ")) >=
      ENGINE6_RICH_PRODUCT_DESCRIPTION_MIN_WORDS
    ) {
      break;
    }
  }

  const itinerarySentence = buildEngine6RichItinerarySentence(itineraryStops);
  const itineraryDetailSentences = itineraryStops.flatMap(stop =>
    splitDescriptionSentences(
      cleanEngine6RichProductSource(
        [stop.title, stop.description].filter(Boolean).join(". "),
        title
      )
    )
  );
  const supportingSentences = [
    itinerarySentence,
    ...itineraryDetailSentences,
    buildEngine6RichHighlightsSentence(highlights),
    buildEngine6RichInclusionsSentence(included),
    buildEngine6RichDurationSentence({ durationText, categoryLabel }),
  ];

  for (const sentence of supportingSentences) {
    if (
      countEngine6Words(sentences.join(" ")) >=
      ENGINE6_RICH_PRODUCT_DESCRIPTION_MIN_WORDS
    ) {
      break;
    }
    appendEngine6RichSentenceIfUseful(sentences, sentence);
  }

  if (sentences.length === 0) {
    appendEngine6RichSentenceIfUseful(
      sentences,
      buildEngine6FallbackMetaDescription({
        title,
        city,
        categoryLabel,
        sourceDescription: description ?? overviewText ?? title,
      })
    );
  }

  return sentences
    .join(" ")
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
};

export const buildEngine6SeoDescription = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
  sourceDescriptions,
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
  sourceDescriptions?: Array<string | null | undefined>;
}) =>
  buildEngine6OptimizedDescription({
    title,
    city,
    categoryLabel,
    sourceDescription,
    sourceDescriptions,
  });

export const buildEngine6CanonicalPath = ({
  state,
  city,
  title,
}: {
  state: string;
  city: string;
  title: string;
}) =>
  `/destinations/${slugify(state)}/${slugify(city)}/tours/${slugify(title)}`;

export const buildEngine6Seo = (tour: Engine6Tour) => {
  const itineraryDescription = buildEngine6ItinerarySerpDescription({
    title: tour.title,
    city: tour.city,
    categoryLabel: tour.categoryLabel,
    itineraryStops: tour.itinerary,
    sourceDescriptions: [
      tour.overviewText ?? "",
      tour.description,
      tour.itinerarySummaryText ?? "",
      ...tour.highlights,
      ...tour.itinerary.map(item => `${item.title}. ${item.description ?? ""}`),
    ],
  });

  return {
    title: tour.seoTitle,
    description: itineraryDescription ?? tour.metaDescription,
    url: tour.canonicalPath,
    image: tour.resolvedImageUrl ?? "",
  };
};
