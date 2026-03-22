import { slugify } from "../utils/slugify";

import type { Engine6CategorySlug, Engine6Tour } from "./types";

const ENGINE6_META_DESCRIPTION_MAX_LENGTH = 160;

export const ENGINE6_CATEGORY_LABELS: Record<Engine6CategorySlug, string> = {
  "off-road-tour": "Jeep Tour",
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

export const cleanEngine6Description = (text: string): string => {
  if (!text) {
    return "";
  }

  return text
    .replace(/\.\./g, ".")
    .replace(/Best tour.*?reviews\./gi, "")
    .replace(/Rated\s*\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?[^.]*\./gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
};

export const clampEngine6MetaDescription = (
  text: string,
  maxLength = ENGINE6_META_DESCRIPTION_MAX_LENGTH
) => {
  if (text.length <= maxLength) {
    return text;
  }

  const clipped = text.slice(0, maxLength - 1).trim();
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const safeClipped =
    lastWordBoundary > maxLength * 0.6
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${safeClipped.trim()}…`;
};

export const buildEngine6MetaDescription = (description: string) =>
  clampEngine6MetaDescription(cleanEngine6Description(description));

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
  image: tour.heroImageUrl,
});
