import { buildEngine6CardDescription } from "./governedEditorialDescriptions";
import { formatEngine6AggregateRating } from "./rating";
import { getEngine6TourRatingSourceOfTruth } from "./ratingSourceOfTruth";
import { formatEngine6StartingPriceLabel } from "./priceDisplay";
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

export const toEngine6Card = (tour: Engine6Tour): Engine6Card => {
  const ratingSourceOfTruth = getEngine6TourRatingSourceOfTruth(tour);

  return {
    imageUrl: tour.resolvedHero?.url ?? tour.heroImageUrl ?? "",
    title: tour.title,
    locationLabel: `${tour.city}, ${tour.state}`,
    ratingLabel:
      ratingSourceOfTruth.aggregateRating && ratingSourceOfTruth.reviewCount
        ? `★ ${formatEngine6AggregateRating(ratingSourceOfTruth.aggregateRating)} (${ratingSourceOfTruth.reviewCount})`
        : "No ratings yet",
    priceLabel:
      typeof tour.priceAmount === "number"
        ? formatEngine6StartingPriceLabel(tour.priceAmount)
        : tour.priceFormatted,
    description: buildEngine6CardDescription(tour),
    href: tour.canonicalPath,
  };
};

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
