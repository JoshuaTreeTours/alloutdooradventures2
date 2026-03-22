import { slugify } from "../utils/slugify";

import type { Engine6CategorySlug, Engine6Tour } from "./types";

export const ENGINE6_CATEGORY_LABELS: Record<Engine6CategorySlug, string> = {
  "off-road-tour": "Off Road Tour",
  adventure: "Adventure",
  hiking: "Hiking",
  sightseeing: "Sightseeing",
  wildlife: "Wildlife",
  water: "Water Adventure",
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

  return value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

export const buildEngine6Seo = (tour: Engine6Tour) => {
  const categoryLabel =
    tour.categoryLabel ?? formatEngine6CategoryLabel(tour.primaryCategory);
  const fallbackDescription = [
    categoryLabel ? `${categoryLabel} in ${tour.city}, ${tour.state}.` : null,
    tour.priceFormatted ? `${tour.priceFormatted} per person.` : null,
    typeof tour.aggregateRating === "number" &&
    typeof tour.reviewCount === "number"
      ? `Rated ${tour.aggregateRating.toFixed(1)}/5 from ${tour.reviewCount} reviews.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: tour.seoTitle,
    description: tour.seoDescription || fallbackDescription || tour.title,
    url: tour.canonicalPath,
    image: tour.heroImageUrl,
  };
};
