import { getEngine6TargetedNarrativeDescription } from "./approvedNarrativeDescriptions";
import { buildEngine6RichProductDescription } from "./seo";
import type { Engine6Tour } from "./types";

export const ENGINE6_CARD_DESCRIPTION_MAX_CHARS = 150;

export const ENGINE6_CARD_FORBIDDEN_TEMPLATE_PATTERNS = [
  /^Discover\s+\S+\s+on a guided\b/i,
  /^Discover top outdoor highlights around\b/i,
  /\bwith standout local highlights\b/i,
  /\bwith a locally guided experience\b/i,
  /\bdestination-agnostic\b/i,
  /\bclear logistics\b/i,
  /\bmemorable local stops\b/i,
  /\btraveler-friendly pace\b/i,
  /\beasy logistics\b/i,
  /\bdetails aligned to the product page and booking experience\b/i,
];

export const resolveEngine6GovernedProductDescription = (
  tour: Engine6Tour
): string => {
  const targetedNarrative = getEngine6TargetedNarrativeDescription(
    tour.productCode
  );
  if (targetedNarrative) {
    return targetedNarrative;
  }

  return buildEngine6RichProductDescription({
    title: tour.title,
    city: tour.city,
    categoryLabel: tour.categoryLabel,
    overviewText: tour.overviewText,
    description:
      tour.description || tour.metaDescription || tour.seoDescription,
    itineraryStops: tour.itinerary,
    highlights: tour.highlights,
    included: tour.included,
    durationText: tour.durationText,
  });
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
