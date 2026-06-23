import type { Tour } from "../data/tours.types";
import type { Engine6Tour } from "./types";
import { getEngine6LiveRatingSourceOfTruth } from "./ratingSourceOfTruth";

export type Engine6LiveProductFields = {
  priceAmount: number | null;
  priceFormatted: string | null;
  aggregateRating: number | null;
  reviewCount: number | null;
  durationText: string | null;
  meetingPointText: string | null;
};

export type Engine6TourCardEntry<TTour extends Tour = Tour> = {
  tour: TTour;
  href?: string;
};

const parsePriceFromFormatted = (
  value: string | null | undefined
): number | null => {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatLivePriceLabel = (amount: number) =>
  `From ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;

const resolveLivePriceFormatted = (
  priceAmount: number | null,
  priceFormatted: string,
  fallback?: string | null
) =>
  priceFormatted ||
  (typeof priceAmount === "number"
    ? formatLivePriceLabel(priceAmount)
    : fallback);

export const mergeEngine6LiveFieldsIntoEngine6Tour = (
  tour: Engine6Tour,
  liveFields?: Partial<Engine6LiveProductFields>
): Engine6Tour => {
  if (!liveFields) {
    return tour;
  }

  const priceAmount =
    typeof liveFields.priceAmount === "number" ? liveFields.priceAmount : null;
  const priceFormatted =
    typeof liveFields.priceFormatted === "string"
      ? liveFields.priceFormatted.trim()
      : "";
  const resolvedPriceAmount = priceAmount ?? tour.priceAmount;
  const resolvedPriceFormatted = resolveLivePriceFormatted(
    priceAmount,
    priceFormatted,
    tour.priceFormatted
  );

  const liveRatingSourceOfTruth = getEngine6LiveRatingSourceOfTruth(liveFields);

  return {
    ...tour,
    priceAmount: resolvedPriceAmount,
    priceFormatted: resolvedPriceFormatted ?? tour.priceFormatted,
    aggregateRating:
      liveRatingSourceOfTruth.aggregateRating ?? tour.aggregateRating,
    reviewCount: liveRatingSourceOfTruth.reviewCount ?? tour.reviewCount,
    durationText:
      typeof liveFields.durationText === "string" &&
      liveFields.durationText.trim()
        ? liveFields.durationText
        : tour.durationText,
    meetingPointText:
      typeof liveFields.meetingPointText === "string" &&
      liveFields.meetingPointText.trim()
        ? liveFields.meetingPointText
        : tour.meetingPointText,
  };
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
      ? formatLivePriceLabel(resolvedStartingPrice)
      : tour.badges.priceFrom);

  const liveRatingSourceOfTruth = getEngine6LiveRatingSourceOfTruth(liveFields);

  return {
    ...tour,
    startingPrice: resolvedStartingPrice,
    badges: {
      ...tour.badges,
      rating: liveRatingSourceOfTruth.aggregateRating ?? tour.badges.rating,
      reviewCount:
        liveRatingSourceOfTruth.reviewCount ?? tour.badges.reviewCount,
      priceFrom: resolvedPriceBadge,
      duration:
        typeof liveFields.durationText === "string" &&
        liveFields.durationText.trim()
          ? liveFields.durationText
          : tour.badges.duration,
    },
  };
};

export const hydrateEngine6TourCardEntries = <
  TEntry extends Engine6TourCardEntry,
>(
  entries: TEntry[],
  liveByProductCode: Record<string, Engine6LiveProductFields | undefined>
): TEntry[] =>
  entries.map(entry => ({
    ...entry,
    tour:
      entry.tour.engine === "engine6" && entry.tour.productCode
        ? mergeEngine6LiveFieldsIntoTour(
            entry.tour,
            liveByProductCode[entry.tour.productCode]
          )
        : entry.tour,
  }));

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
    priceAmount:
      typeof extracted.priceAmount === "number" ? extracted.priceAmount : null,
    priceFormatted:
      typeof extracted.priceFormatted === "string"
        ? extracted.priceFormatted
        : null,
    aggregateRating:
      typeof extracted.aggregateRating === "number"
        ? extracted.aggregateRating
        : null,
    reviewCount:
      typeof extracted.reviewCount === "number" ? extracted.reviewCount : null,
    durationText:
      typeof extracted.durationText === "string"
        ? extracted.durationText
        : null,
    meetingPointText:
      typeof extracted.meetingPointText === "string"
        ? extracted.meetingPointText
        : null,
  };
};
