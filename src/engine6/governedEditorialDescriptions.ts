import { getEngine6TargetedNarrativeDescription } from "./approvedNarrativeDescriptions";
import { normalizeEngine6SupplierNarrativeDescription } from "./normalizeEngine6SupplierNarrative";
import { buildEngine6RichProductDescription } from "./seo";
import {
  buildEngine6PremiumEditorialDescriptionFromTour,
  ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS,
  ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS,
  ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS,
  isEngine6ForbiddenEditorialPhrase,
} from "./buildEngine6PremiumEditorialDescription";
import type { Engine6Tour } from "./types";

const trimToEditorialCharBudget = (
  value: string,
  maxChars = ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS
) => {
  if (value.length <= maxChars) {
    return value;
  }

  const clipped = value.slice(0, maxChars).trim();
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const safe =
    lastWordBoundary > maxChars * 0.7
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${safe.replace(/[,.;:\s-]+$/g, "").trim()}.`;
};

const ensureEngine6EditorialLength = (
  tour: Engine6Tour,
  description: string
) => {
  const normalized = description.trim().replace(/\s+/g, " ");
  if (
    normalized.length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS &&
    normalized.length <= ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS
  ) {
    return normalized;
  }

  if (normalized.length > ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS) {
    return trimToEditorialCharBudget(normalized);
  }

  const paddingSentences = [
    tour.itinerary.length > 0
      ? `You'll pause at ${tour.itinerary
          .slice(0, 4)
          .map(stop => stop.title)
          .filter(
            titleValue =>
              titleValue &&
              !/\b(?:departure|pickup|pick-up|meeting point)\b/i.test(
                titleValue
              )
          )
          .join(", ")}.`
      : "",
    tour.highlights.length > 0
      ? `${tour.highlights.slice(0, 2).join(" and ")} are included in the experience.`
      : "",
    tour.included.length > 0
      ? `${tour.included.slice(0, 2).join(" and ")} are included.`
      : "",
    tour.durationText?.trim()
      ? `Plan on ${tour.durationText.trim()} for the outing.`
      : "",
  ].filter(Boolean);

  let composed = normalized;
  for (const padding of paddingSentences) {
    if (composed.length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
      break;
    }
    if (isEngine6ForbiddenEditorialPhrase(padding)) {
      continue;
    }
    composed = `${composed.replace(/[.!?]$/, "")}. ${padding}`.replace(
      /\s+/g,
      " "
    );
  }

  while (composed.length < ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
    composed = `${composed.replace(/[.!?]$/, "")}. ${tour.title} keeps the itinerary focused on the named stops and the time you have at each one.`;
    if (composed.length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
      break;
    }
    composed = `${composed.replace(/[.!?]$/, "")}. The format suits visitors who want destination context without sorting tickets or routes on their own.`;
    break;
  }

  return trimToEditorialCharBudget(composed);
};

const ENGINE6_OVERVIEW_FIRST_DESCRIPTION_CITIES = new Set([
  "Portland",
  "Seattle",
]);

const normalizeDescriptionSource = (value?: string | null) =>
  value?.trim().replace(/\s+/g, " ") ?? "";

const hasUsableEngine6OverviewFirstDescription = (tour: Engine6Tour) => {
  if (!ENGINE6_OVERVIEW_FIRST_DESCRIPTION_CITIES.has(tour.city)) {
    return false;
  }

  const description = normalizeDescriptionSource(tour.description);
  const overview = normalizeDescriptionSource(tour.overviewText);

  return description.length >= 80 && description !== overview;
};

export const ENGINE6_CARD_DESCRIPTION_MAX_CHARS = 150;

export const ENGINE6_CARD_FORBIDDEN_TEMPLATE_PATTERNS = [
  ...ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS,
  /^Discover\s+\S+\s+on a guided\b/i,
  /^Discover top outdoor highlights around\b/i,
  /\bwith standout local highlights\b/i,
  /\bwith a locally guided experience\b/i,
  /\bdestination-agnostic\b/i,
];

export const resolveEngine6GovernedProductDescription = (
  tour: Engine6Tour
): string => {
  const targetedNarrative = getEngine6TargetedNarrativeDescription(
    tour.productCode
  );
  if (targetedNarrative) {
    return ensureEngine6EditorialLength(tour, targetedNarrative);
  }

  if (hasUsableEngine6OverviewFirstDescription(tour)) {
    return ensureEngine6EditorialLength(tour, tour.description);
  }

  return ensureEngine6EditorialLength(
    tour,
    buildEngine6PremiumEditorialDescriptionFromTour(tour)
  );
};

export const resolveEngine6SchemaProductDescription = (
  tour: Engine6Tour
): string => {
  const governedDescription = resolveEngine6GovernedProductDescription(tour);
  if (getEngine6TargetedNarrativeDescription(tour.productCode)) {
    return governedDescription;
  }

  return normalizeEngine6SupplierNarrativeDescription(governedDescription);
};

export const excerptEngine6CardDescription = (
  governedDescription: string,
  maxChars = ENGINE6_CARD_DESCRIPTION_MAX_CHARS
): string => {
  const normalized = governedDescription.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }

  let sentenceEnd = -1;
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    if (!/[.!?]/.test(char)) {
      continue;
    }

    const initialsPattern = normalized.slice(Math.max(0, index - 2), index + 1);
    if (/\b[A-Z]\.$/.test(initialsPattern)) {
      continue;
    }

    const remainder = normalized.slice(index + 1);
    if (remainder.length === 0 || /^\s+[A-Z0-9"']/.test(remainder)) {
      sentenceEnd = index;
      break;
    }
  }

  const firstSentence =
    sentenceEnd >= 0 ? normalized.slice(0, sentenceEnd + 1) : normalized;

  if (firstSentence.length <= maxChars) {
    return firstSentence;
  }

  const clipped = firstSentence.slice(0, maxChars);
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const snippet =
    lastWordBoundary > maxChars * 0.6
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${snippet.trim()}…`;
};

export const buildEngine6CardDescription = (tour: Engine6Tour): string =>
  excerptEngine6CardDescription(resolveEngine6GovernedProductDescription(tour));

export const hasEngine6CardForbiddenTemplatePhrase = (value: string) =>
  ENGINE6_CARD_FORBIDDEN_TEMPLATE_PATTERNS.some(pattern => pattern.test(value));

export const isEngine6CardDescriptionDerivedFromGovernedSource = (
  cardDescription: string,
  governedDescription: string
) => {
  const normalizedCard = cardDescription.trim().replace(/\s+/g, " ");
  const normalizedGoverned = governedDescription.trim().replace(/\s+/g, " ");
  if (!normalizedCard || !normalizedGoverned) {
    return false;
  }

  const cardWithoutEllipsis = normalizedCard.replace(/…$/, "").trim();
  return normalizedGoverned.startsWith(cardWithoutEllipsis);
};
