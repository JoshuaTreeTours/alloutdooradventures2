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

const ENGINE6_SERP_META_DESCRIPTION_MIN = 145;
const ENGINE6_SERP_META_DESCRIPTION_MAX = 160;
const ENGINE6_OPTIMIZED_DESCRIPTION_MIN = ENGINE6_SERP_META_DESCRIPTION_MIN;
const ENGINE6_OPTIMIZED_DESCRIPTION_MAX = ENGINE6_SERP_META_DESCRIPTION_MAX;
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
  return cleaned;
};

export const buildEngine6OptimizedDescription = ({
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
  const cleanedSource = stripGenericMarketingLead(
    stripEngine6GeneratedDescriptionPrefix(
      removeBlockedOperationalFiller(
        cleanEngine6Description(
          sourceDescription
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        )
      )
    )
  );
  const sourceStartsActively =
    ENGINE6_ACTIVE_DESCRIPTION_START_PATTERN.test(cleanedSource);
  const priorityAttraction = extractEngine6PriorityAttraction(
    cleanedSource
  )?.replace(/^(?:Explore|Visit|See)\s+/i, "");
  const baseLead = buildEngine6ExperienceLead({
    title,
    city,
    categoryLabel,
    sourceDescription: cleanedSource,
  });
  const lead =
    priorityAttraction &&
    !baseLead.toLowerCase().includes(priorityAttraction.toLowerCase()) &&
    baseLead.length + priorityAttraction.length < 105
      ? `${baseLead} with ${priorityAttraction}`
      : baseLead;
  const sourceSentences = splitDescriptionSentences(cleanedSource);
  const primarySource = sourceSentences[0] ?? cleanedSource;
  const shouldUseSourceAsLead =
    sourceStartsActively &&
    (primarySource.toLowerCase().includes(city.toLowerCase()) ||
      primarySource.toLowerCase().includes(title.toLowerCase()) ||
      primarySource.length >= 80);

  const sourceRemainder = sourceSentences.filter(sentence => {
    const normalizedSentence = sentence.toLowerCase();
    const normalizedLead = lead.toLowerCase();
    return !(
      normalizedSentence.includes(normalizedLead) ||
      normalizedLead.includes(normalizedSentence.replace(/\.$/, ""))
    );
  });

  const parts = shouldUseSourceAsLead
    ? sourceSentences
    : [lead, ...sourceRemainder];
  let composed = parts
    .filter(Boolean)
    .join(". ")
    .replace(/\s+/g, " ")
    .replace(/\.\s*\./g, ".")
    .trim();

  if (composed && !/[.!?]$/.test(composed)) {
    composed = `${composed}.`;
  }

  if (composed.length < ENGINE6_OPTIMIZED_DESCRIPTION_MIN) {
    const category = (categoryLabel ?? "guided experience").toLowerCase();
    const guidePhrase = category.includes("guided")
      ? "local context"
      : "guide support, local context";
    composed =
      `${composed} Expect ${guidePhrase}, clear timing, and traveler-focused logistics for a smooth day.`
        .replace(/\s+/g, " ")
        .trim();
  }

  const trimmed = trimDescriptionToWordBoundary(
    composed,
    ENGINE6_OPTIMIZED_DESCRIPTION_MAX
  );

  return finalizeEngine6SerpMetaDescription(trimmed);
};

const finalizeEngine6SerpMetaDescription = (value: string) => {
  const withoutPrefix = stripEngine6GeneratedDescriptionPrefix(value)
    .replace(/\.\.\.$/, "")
    .replace(/[!?;,]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!withoutPrefix) {
    return "";
  }

  const bounded = trimDescriptionToWordBoundary(
    withoutPrefix,
    ENGINE6_SERP_META_DESCRIPTION_MAX - 1
  )
    .replace(/[.!?,;:\s-]+$/, "")
    .trim();

  return `${bounded}.`;
};

const expandShortEngine6SerpMetaDescription = ({
  description,
  city,
}: {
  description: string;
  city: string;
}) => {
  if (description.length >= ENGINE6_SERP_META_DESCRIPTION_MIN) {
    return description;
  }

  const base = description.replace(/[.!?]+$/, "").trim();
  const destination = city.trim();
  const extensions = [
    destination
      ? ` for an easy-to-plan ${destination} experience`
      : " for an easy-to-plan travel experience",
    destination
      ? ` with traveler-friendly timing in ${destination}`
      : " with traveler-friendly timing",
    destination
      ? ` with clear logistics for a smooth ${destination} outing`
      : " with clear logistics for a smooth outing",
  ];

  for (const extension of extensions) {
    const candidate = finalizeEngine6SerpMetaDescription(`${base}${extension}`);
    if (
      candidate.length >= ENGINE6_SERP_META_DESCRIPTION_MIN &&
      candidate.length <= ENGINE6_SERP_META_DESCRIPTION_MAX
    ) {
      return candidate;
    }
  }

  return finalizeEngine6SerpMetaDescription(
    `${base} with clear logistics, useful local context, and traveler-focused planning`
  );
};

const ENGINE6_INCOMPLETE_SERP_END_PATTERN =
  /\b(?:major|local|route|museum|beach|bridge|with|and|or|the|a|an|from|for|of|in|on|at|to)\.$/i;

const includesEngine6Destination = (description: string, city: string) => {
  const normalizedCity = city.trim().toLowerCase();
  if (!normalizedCity) {
    return true;
  }

  return description.toLowerCase().includes(normalizedCity);
};

const buildEngine6SerpFallbackDescription = ({
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
  const cleanedSource = stripGenericMarketingLead(
    stripEngine6GeneratedDescriptionPrefix(
      removeBlockedOperationalFiller(
        cleanEngine6Description(
          sourceDescription
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        )
      )
    )
  );
  const lead = buildEngine6ExperienceLead({
    title,
    city,
    categoryLabel,
    sourceDescription: cleanedSource,
  });
  const priorityAttraction = extractEngine6PriorityAttraction(
    cleanedSource
  )?.replace(/^(?:Explore|Visit|See)\s+/i, "");
  const attractionPhrase =
    priorityAttraction &&
    !lead.toLowerCase().includes(priorityAttraction.toLowerCase())
      ? ` with ${priorityAttraction}`
      : "";
  const destination = city.trim();
  const planningPhrase = destination
    ? ` with clear logistics, useful local context, and traveler-friendly planning for a smooth ${destination} outing`
    : " with clear logistics, useful local context, and traveler-friendly planning for a smooth outing";

  const candidates = [
    `${lead}${attractionPhrase}${planningPhrase}`,
    `${lead}${attractionPhrase} with clear logistics, local context, and traveler-friendly timing`,
    `${lead} with clear logistics, local context, and traveler-friendly timing`,
    `${lead}${attractionPhrase} with useful local context, clear logistics, and traveler-friendly planning`,
  ].map(finalizeEngine6SerpMetaDescription);

  return (
    candidates.find(
      candidate =>
        candidate.length >= ENGINE6_SERP_META_DESCRIPTION_MIN &&
        candidate.length <= ENGINE6_SERP_META_DESCRIPTION_MAX &&
        includesEngine6Destination(candidate, city) &&
        !ENGINE6_INCOMPLETE_SERP_END_PATTERN.test(candidate)
    ) ??
    candidates.find(
      candidate => !ENGINE6_INCOMPLETE_SERP_END_PATTERN.test(candidate)
    ) ??
    candidates[0] ??
    ""
  );
};

export const buildEngine6SerpMetaDescription = ({
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
  const optimized = buildEngine6OptimizedDescription({
    title,
    city,
    categoryLabel,
    sourceDescription,
  });

  const expanded = expandShortEngine6SerpMetaDescription({
    description: optimized,
    city,
  });

  if (
    !includesEngine6Destination(expanded, city) ||
    ENGINE6_INCOMPLETE_SERP_END_PATTERN.test(expanded)
  ) {
    return buildEngine6SerpFallbackDescription({
      title,
      city,
      categoryLabel,
      sourceDescription,
    });
  }

  return expanded;
};

export const buildEngine6SeoDescription = buildEngine6SerpMetaDescription;

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

export const buildEngine6Seo = (tour: Engine6Tour) => ({
  title: tour.seoTitle,
  description: tour.metaDescription,
  url: tour.canonicalPath,
  image: tour.resolvedImageUrl ?? "",
});
