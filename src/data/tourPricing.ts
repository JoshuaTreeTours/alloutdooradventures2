import type { Tour } from "./tours.types";
import { FAREHARBOR_PRICE_CACHE } from "./fareharborPricing";
import { getFareharborItemFromUrl } from "../lib/fareharbor";

const buildFareharborCacheKey = (companyShortname: string, itemId: string) =>
  `${companyShortname}:${itemId}`;

export const getFareharborCachedPrice = (bookingUrl?: string) => {
  const reference = getFareharborItemFromUrl(bookingUrl);
  if (!reference) {
    return null;
  }

  const key = buildFareharborCacheKey(
    reference.companyShortname,
    reference.itemId,
  );
  return FAREHARBOR_PRICE_CACHE[key] ?? null;
};

export const applyTourPricing = (tour: Tour): Tour => {
  if (tour.startingPrice !== undefined && tour.startingPrice !== null) {
    return tour;
  }

  const cached = getFareharborCachedPrice(tour.bookingUrl);
  if (!cached) {
    return tour;
  }

  return {
    ...tour,
    startingPrice: cached.startingPrice,
    currency: cached.currency,
  };
};
