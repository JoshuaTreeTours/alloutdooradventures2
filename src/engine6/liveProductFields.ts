import type { Tour } from "../data/tours.types";

export type Engine6LiveProductFields = {
  priceAmount: number | null;
  priceFormatted: string | null;
  aggregateRating: number | null;
  reviewCount: number | null;
  durationText: string | null;
  meetingPointText: string | null;
};

export const mergeEngine6LiveFieldsIntoTour = (
  tour: Tour,
  liveFields?: Partial<Engine6LiveProductFields>
): Tour => {
  if (tour.engine !== "engine6" || !liveFields) {
    return tour;
  }

  const priceAmount =
    typeof liveFields.priceAmount === "number" ? liveFields.priceAmount : null;
  const priceFormatted =
    typeof liveFields.priceFormatted === "string"
      ? liveFields.priceFormatted.trim()
      : "";

  return {
    ...tour,
    startingPrice: priceAmount ?? tour.startingPrice,
    badges: {
      ...tour.badges,
      rating:
        typeof liveFields.aggregateRating === "number"
          ? liveFields.aggregateRating
          : tour.badges.rating,
      reviewCount:
        typeof liveFields.reviewCount === "number"
          ? liveFields.reviewCount
          : tour.badges.reviewCount,
      priceFrom: priceFormatted || tour.badges.priceFrom,
      duration:
        typeof liveFields.durationText === "string" && liveFields.durationText.trim()
          ? liveFields.durationText
          : tour.badges.duration,
    },
  };
};
