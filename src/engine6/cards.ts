import { formatEngine6AggregateRating } from "./rating";
import { formatEngine6CategoryLabel } from "./seo";
import type { Engine6Tour } from "./types";

export type Engine6Card = {
  imageUrl: string;
  title: string;
  locationLabel: string;
  ratingLabel: string;
  priceLabel: string;
  description: string;
  href: string;
};

const buildCardDescription = (tour: Engine6Tour) => {
  const overviewSentence = tour.overviewText?.split(/\n\n+/)[0]?.trim();
  if (overviewSentence) {
    return overviewSentence;
  }

  if (tour.highlights.length > 0) {
    return tour.highlights[0];
  }

  const categoryLabel =
    tour.categoryLabel ?? formatEngine6CategoryLabel(tour.primaryCategory);

  if (categoryLabel) {
    return `Discover ${tour.city} on a guided ${categoryLabel.toLowerCase()} with standout local highlights.`;
  }

  return `Discover top outdoor highlights around ${tour.city} with a locally guided experience.`;
};

export const toEngine6Card = (tour: Engine6Tour): Engine6Card => ({
  imageUrl: tour.resolvedImageUrl ?? "",
  title: tour.title,
  locationLabel: `${tour.city}, ${tour.state}`,
  ratingLabel:
    tour.aggregateRating && tour.reviewCount
      ? `${formatEngine6AggregateRating(tour.aggregateRating)} (${tour.reviewCount})`
      : "No ratings yet",
  priceLabel: tour.priceFormatted,
  description: buildCardDescription(tour),
  href: tour.canonicalPath,
});

export const buildEngine6CardSurfaces = (tour: Engine6Tour) => {
  const makeCard = () => ({ ...toEngine6Card(tour) });
  return {
    city: [makeCard()],
    state: [makeCard()],
    guides: [makeCard()],
    bestTours: [makeCard()],
    search: [makeCard()],
  };
};
