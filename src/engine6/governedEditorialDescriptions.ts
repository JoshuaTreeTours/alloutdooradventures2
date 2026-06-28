import { getEngine6TargetedNarrativeDescription } from "./approvedNarrativeDescriptions";
import {
  buildEngine6PremiumEditorialDescriptionFromTour,
  ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS,
  ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS,
  ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS,
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
      ? `Major pauses come at ${tour.itinerary
          .slice(0, 4)
          .map(stop => stop.title)
          .filter(Boolean)
          .join(", ")}.`
      : "",
    tour.highlights.length > 0
      ? `Particular attention goes to ${tour.highlights.slice(0, 2).join(" and ")}.`
      : "",
    tour.included.length > 0
      ? `${tour.included.slice(0, 2).join(" and ")} are part of the booking.`
      : "",
    `Plan on roughly ${tour.durationText?.trim() || "a full outing"} in ${tour.city}.`,
  ].filter(Boolean);

  let composed = normalized;
  for (const padding of paddingSentences) {
    if (composed.length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
      break;
    }
    composed = `${composed.replace(/[.!?]$/, "")}. ${padding}`.replace(/\s+/g, " ");
  }

  while (composed.length < ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
    composed = `${composed.replace(/[.!?]$/, "")}. This ${tour.city} outing keeps the focus on the places named in the itinerary and the time you spend at each stop.`;
    if (composed.length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
      break;
    }
    composed = `${composed.replace(/[.!?]$/, "")}. ${tour.title} is designed for visitors who want a clear read on the destination without sorting logistics on their own.`;
    break;
  }

  return trimToEditorialCharBudget(composed);
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

  return ensureEngine6EditorialLength(
    tour,
    buildEngine6PremiumEditorialDescriptionFromTour(tour)
  );
};

export const excerptEngine6CardDescription = (
  governedDescription: string,
  maxChars = ENGINE6_CARD_DESCRIPTION_MAX_CHARS
): string => {
  const normalized = governedDescription.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }

  const firstSentence =
    normalized.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? normalized;

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
