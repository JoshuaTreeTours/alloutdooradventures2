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

  if (tour.primaryCategory) {
    return `Best ${tour.primaryCategory.replace(/-/g, " ")} in ${tour.city}.`;
  }

  return `Best tour in ${tour.city} for jeep and off-road views around Zion.`;
};

export const toEngine6Card = (tour: Engine6Tour): Engine6Card => ({
  imageUrl: tour.cardImageUrl,
  title: tour.title,
  locationLabel: `${tour.city}, ${tour.state}`,
  ratingLabel:
    tour.aggregateRating && tour.reviewCount
      ? `${tour.aggregateRating.toFixed(1)} (${tour.reviewCount})`
      : "No ratings yet",
  priceLabel: tour.priceFormatted,
  description: buildCardDescription(tour),
  href: `/destinations/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour`,
});

export const buildEngine6CardSurfaces = (tour: Engine6Tour) => {
  const card = toEngine6Card(tour);
  return {
    city: [card],
    state: [card],
    guides: [card],
    bestTours: [card],
    search: [card],
  };
};
