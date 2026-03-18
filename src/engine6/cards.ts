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

export const toEngine6Card = (tour: Engine6Tour): Engine6Card => ({
  imageUrl: tour.cardImageUrl,
  title: tour.title,
  locationLabel: `${tour.city}, ${tour.state}`,
  ratingLabel:
    tour.aggregateRating && tour.reviewCount
      ? `${tour.aggregateRating.toFixed(1)} (${tour.reviewCount})`
      : "No ratings yet",
  priceLabel: tour.priceFormatted,
  description: `Best tour in ${tour.city} for jeep and off-road views around Zion.`,
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
