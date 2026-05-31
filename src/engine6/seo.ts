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

const ENGINE6_SERP_META_DESCRIPTION_MIN = 110;
const ENGINE6_SERP_META_DESCRIPTION_IDEAL_MAX = 150;
const ENGINE6_SERP_META_DESCRIPTION_MAX = 155;
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
const ENGINE6_INCOMPLETE_SERP_END_PATTERN =
  /\b(?:major|local|route|museum|beach|bridge|with|and|or|the|a|an|from|for|of|in|on|at|to|through|along|including|featuring|plus|while|via)\.$/i;
const ENGINE6_SERP_TITLE_LEAD_PATTERN =
  /^(?:Explore|Discover|Visit|Experience|Tour|See|Ride|Paddle|Sail|Cruise|Hike|Fly|Taste)\s+[A-Z0-9][^.!?]{20,90}\s+(?:in|from|near|around|on|through|at)\s+[A-Z]/;
const ENGINE6_SERP_ITINERARY_LIST_PATTERN =
  /\b(?:route includes|itinerary includes|stops include|visit stops such as)\b/i;

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

const normalizeEngine6SerpSource = (value: string | null | undefined) => {
  if (!value) return "";
  return stripGenericMarketingLead(
    stripEngine6GeneratedDescriptionPrefix(
      removeBlockedOperationalFiller(
        cleanEngine6Description(
          value
            .replace(/<[^>]*>/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/\s+/g, " ")
            .trim()
        )
      )
    )
  )
    .replace(
      /\b(?:route includes|itinerary includes|stops include)\b[^.!?]*[.!?]?/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripEngine6TitleFromSerpText = (value: string, title: string) => {
  const normalizedTitle = normalizeEngine6ReadableTitle(title)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+\d{4,}$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalizedTitle) return value;

  return value
    .replace(new RegExp(escapeRegExp(normalizedTitle), "gi"), "")
    .replace(
      new RegExp(
        `^(?:Explore|Discover|Visit|Experience|Tour|See)\\s+${escapeRegExp(normalizedTitle)}\\s*(?:with|and|in|from|near|around)?`,
        "i"
      ),
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();
};

const chooseEngine6SerpActivity = ({
  title,
  categoryLabel,
  sourceDescription,
}: {
  title: string;
  categoryLabel?: string | null;
  sourceDescription: string;
}) => {
  const identity =
    `${title} ${categoryLabel ?? ""} ${sourceDescription}`.toLowerCase();
  if (/\b(?:e-bike|electric bike|bike|cycling)\b/.test(identity))
    return "guided bike ride";
  if (/\b(?:kayak|paddle|canoe|sup)\b/.test(identity))
    return "paddling experience";
  if (/\b(?:sail|cruise|yacht|boat|harbor|bay|catamaran)\b/.test(identity))
    return "waterfront cruise";
  if (/\b(?:helicopter|flight|fly|paraglid|parasail)\b/.test(identity))
    return "aerial adventure";
  if (/\b(?:hike|hiking|trail|walk|walking)\b/.test(identity))
    return "guided outdoor walk";
  if (/\b(?:wine|food|tasting|chocolate|drink)\b/.test(identity))
    return "tasting experience";
  if (/\b(?:museum|admission|ticket|zoo|park pass)\b/.test(identity))
    return "visitor experience";
  if (/\b(?:off-road|4x4|jeep|atv|hummer)\b/.test(identity))
    return "off-road adventure";
  if (/\b(?:wildlife|whale|dolphin|bear|bird)\b/.test(identity))
    return "wildlife experience";
  return "guided experience";
};

const withIndefiniteArticle = (phrase: string) =>
  /^[aeiou]/i.test(phrase.trim()) ? `an ${phrase}` : `a ${phrase}`;

const chooseEngine6SerpVerb = (activity: string) => {
  if (/bike/.test(activity)) return "Ride";
  if (/paddling/.test(activity)) return "Paddle";
  if (/cruise/.test(activity)) return "Cruise";
  if (/aerial/.test(activity)) return "See";
  if (/walk/.test(activity)) return "Discover";
  if (/tasting/.test(activity)) return "Taste";
  return "Discover";
};

const pickEngine6SerpDifferentiator = ({
  title,
  sourceDescription,
  highlights = [],
}: {
  title: string;
  sourceDescription: string;
  highlights?: string[];
}) => {
  const candidates = [
    ...highlights,
    ...splitDescriptionSentences(sourceDescription),
  ]
    .map(value => normalizeEngine6SerpSource(value))
    .map(value => stripEngine6TitleFromSerpText(value, title))
    .map(value =>
      value
        .replace(ENGINE6_SERP_ITINERARY_LIST_PATTERN, "")
        .replace(/\b(?:the route includes|travelers can expect)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(value => value.length >= 24)
    .filter(value => !isEngine6OperationalFiller(value));

  const scored = candidates
    .map(value => {
      let score = 0;
      if (
        /\b(?:small-group|private|expert|guide|guided|naturalist|captain|local)\b/i.test(
          value
        )
      )
        score += 3;
      if (
        /\b(?:view|views|scenic|wildlife|waterfalls?|canyon|bay|bridge|mountain|desert|forest|coast|skyline|landmark|museum|tasting|vineyard|geology)\b/i.test(
          value
        )
      )
        score += 3;
      if (
        /\b(?:includes|included|with|featuring|through|along|past|aboard)\b/i.test(
          value
        )
      )
        score += 2;
      if (value.length >= 45 && value.length <= 140) score += 2;
      if (ENGINE6_SERP_TITLE_LEAD_PATTERN.test(value)) score -= 4;
      if (ENGINE6_SERP_ITINERARY_LIST_PATTERN.test(value)) score -= 6;
      return { value, score };
    })
    .sort((a, b) => b.score - a.score);

  const best =
    scored[0]?.value ?? "local insight, standout scenery, and smooth planning";
  const clauseMatch =
    /\b(?:with|featuring|through|along|past|aboard|including)\s+([^.!?]{24,130})/i.exec(
      best
    );
  const clause = clauseMatch?.[1] ?? best;

  return clause
    .replace(
      /\b(?:this|that|these)\s+(?:tour|experience|activity|route)\b/gi,
      ""
    )
    .replace(/\b(?:route includes|itinerary includes|stops include)\b.*$/i, "")
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();
};

const trimEngine6SerpToSentence = (value: string, maxLength: number) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const clipped = normalized.slice(0, maxLength - 1).trim();
  const lastSpace = clipped.lastIndexOf(" ");
  return (lastSpace > 90 ? clipped.slice(0, lastSpace) : clipped)
    .replace(/[.!?,;:\s-]+$/, "")
    .replace(
      /\b(?:with|and|or|the|a|an|from|for|of|in|on|at|to|through|along|including|featuring|plus|while|via)$/i,
      ""
    )
    .replace(/[.!?,;:\s-]+$/, "")
    .trim();
};

const finalizeEngine6SerpMetaDescription = (value: string) => {
  const withoutPrefix = stripEngine6GeneratedDescriptionPrefix(value)
    .replace(/\.\.\.$/, "")
    .replace(/[!?;,]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!withoutPrefix) return "";

  const bounded = trimEngine6SerpToSentence(
    withoutPrefix,
    ENGINE6_SERP_META_DESCRIPTION_MAX
  );
  return `${bounded.replace(/[.!?,;:\s-]+$/, "")}.`;
};

const includesEngine6Destination = (description: string, city: string) => {
  const normalizedCity = city.trim().toLowerCase();
  if (!normalizedCity) return true;
  return description.toLowerCase().includes(normalizedCity);
};

const isEngine6SerpMetaDescriptionValid = (value: string, city: string) =>
  value.length >= ENGINE6_SERP_META_DESCRIPTION_MIN &&
  value.length <= ENGINE6_SERP_META_DESCRIPTION_MAX &&
  /[.!?]$/.test(value) &&
  !/\.\.\.$/.test(value) &&
  !ENGINE6_INCOMPLETE_SERP_END_PATTERN.test(value) &&
  !ENGINE6_SERP_ITINERARY_LIST_PATTERN.test(value) &&
  !ENGINE6_SERP_TITLE_LEAD_PATTERN.test(value) &&
  includesEngine6Destination(value, city);

export const buildEngine6SerpMetaDescription = ({
  title,
  city,
  categoryLabel,
  sourceDescription,
  highlights = [],
}: {
  title: string;
  city: string;
  categoryLabel?: string | null;
  sourceDescription: string;
  highlights?: string[];
}) => {
  const editorialSource = normalizeEngine6SerpSource(sourceDescription);
  const activity = chooseEngine6SerpActivity({
    title,
    categoryLabel,
    sourceDescription: editorialSource,
  });
  const verb = chooseEngine6SerpVerb(activity);
  const destination = city.trim();
  const differentiator = pickEngine6SerpDifferentiator({
    title,
    sourceDescription: editorialSource,
    highlights,
  });

  const destinationPhrase = destination ? `${destination} ` : "";
  const candidates = [
    `${verb} ${destinationPhrase}on ${withIndefiniteArticle(activity)} with ${differentiator}`,
    `${verb} ${destinationPhrase}through ${withIndefiniteArticle(activity)} shaped by ${differentiator}`,
    `${verb} ${destinationPhrase}with ${differentiator} on a traveler-friendly ${activity}`,
    `${verb} ${destinationPhrase}with local insight, standout scenery, practical logistics, and smooth planning on ${withIndefiniteArticle(activity)}`,
  ].map(finalizeEngine6SerpMetaDescription);

  const preferred = candidates.find(
    candidate =>
      isEngine6SerpMetaDescriptionValid(candidate, city) &&
      candidate.length <= ENGINE6_SERP_META_DESCRIPTION_IDEAL_MAX
  );
  if (preferred) return preferred;

  return (
    candidates.find(candidate =>
      isEngine6SerpMetaDescriptionValid(candidate, city)
    ) ??
    finalizeEngine6SerpMetaDescription(
      `Discover ${destinationPhrase}with local insight, standout scenery, practical logistics, and traveler-friendly planning on ${withIndefiniteArticle(activity)}`
    )
  );
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
