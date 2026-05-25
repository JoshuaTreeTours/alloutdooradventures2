import type { Tour } from "../data/tours.types";

export type Engine6LiveProductFields = {
  priceAmount: number | null;
  priceFormatted: string | null;
  aggregateRating: number | null;
  reviewCount: number | null;
  durationText: string | null;
  meetingPointText: string | null;
};

const parsePriceFromFormatted = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
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
  const parsedFromFormatted = parsePriceFromFormatted(priceFormatted);
  const resolvedStartingPrice =
    priceAmount ?? parsedFromFormatted ?? tour.startingPrice ?? undefined;
  const resolvedPriceBadge =
    priceFormatted ||
    (typeof resolvedStartingPrice === "number"
      ? `From $${resolvedStartingPrice.toFixed(2)}`
      : tour.badges.priceFrom);

  return {
    ...tour,
    startingPrice: resolvedStartingPrice,
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
      priceFrom: resolvedPriceBadge,
      duration:
        typeof liveFields.durationText === "string" && liveFields.durationText.trim()
          ? liveFields.durationText
          : tour.badges.duration,
    },
  };
};


export const fetchEngine6LiveProductFields = async (
  productCode: string,
  fetcher: typeof fetch = fetch
): Promise<Engine6LiveProductFields | null> => {
  const response = await fetcher(
    `/api/engine6/viator-product?productCode=${encodeURIComponent(productCode)}`
  );
  if (!response.ok) return null;
  const payload = await response.json();
  const extracted = payload?.extracted;
  if (!extracted) return null;
  return {
    priceAmount: typeof extracted.priceAmount === "number" ? extracted.priceAmount : null,
    priceFormatted:
      typeof extracted.priceFormatted === "string" ? extracted.priceFormatted : null,
    aggregateRating:
      typeof extracted.aggregateRating === "number" ? extracted.aggregateRating : null,
    reviewCount: typeof extracted.reviewCount === "number" ? extracted.reviewCount : null,
    durationText: typeof extracted.durationText === "string" ? extracted.durationText : null,
    meetingPointText:
      typeof extracted.meetingPointText === "string" ? extracted.meetingPointText : null,
  };
};
