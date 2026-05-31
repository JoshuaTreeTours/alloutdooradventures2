import { slugify } from "../utils/slugify";

import type { Engine6CategorySlug, Engine6Tour } from "./types";

const ENGINE6_META_DESCRIPTION_CLAMP_AT = 155;
const ENGINE6_META_DESCRIPTION_MIN = 140;
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

export const buildEngine6SeoDescription = ({
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
  const cleanedSource = stripEngine6GeneratedDescriptionPrefix(
    removeBlockedOperationalFiller(buildMetaDescription(sourceDescription))
  );
  const activity = (categoryLabel ?? "guided experience")
    .replace(/\s+tour$/i, " tour")
    .toLowerCase();
  const body = cleanedSource
    .replace(new RegExp(`^${city}[:,\\s-]+`, "i"), "")
    .trim();
  const seeded = body || `${title} is a ${activity} in ${city}.`;
  const withIdentity = seeded.toLowerCase().includes(title.toLowerCase())
    ? seeded
    : `${seeded} ${title}.`;
  const clamped = clampEngine6MetaDescription(withIdentity);
  if (clamped.length >= ENGINE6_META_DESCRIPTION_MIN) {
    return stripEngine6GeneratedDescriptionPrefix(clamped);
  }
  return stripEngine6GeneratedDescriptionPrefix(
    clampEngine6MetaDescription(
      `${clamped} Book this ${activity} with product-specific route details, local context, and traveler-focused planning guidance.`
    )
  );
};

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
