import type { Engine6ApiResponse, Engine6ContentTier } from "./types";

const hasRating = (payload: Engine6ApiResponse) =>
  typeof payload.extracted.aggregateRating === "number" &&
  Number.isFinite(payload.extracted.aggregateRating) &&
  typeof payload.extracted.reviewCount === "number" &&
  payload.extracted.reviewCount > 0;

const hasPrice = (payload: Engine6ApiResponse) =>
  typeof payload.extracted.priceAmount === "number" &&
  Number.isFinite(payload.extracted.priceAmount) &&
  payload.extracted.priceAmount > 0;

const hasLogistics = (payload: Engine6ApiResponse) =>
  Boolean(payload.extracted.meetingPointText?.trim());

const hasStructuredItinerary = (payload: Engine6ApiResponse) =>
  Array.isArray(payload.extracted.itinerary) &&
  payload.extracted.itinerary.length > 0;

export const classifyEngine6ContentTier = (
  payload: Engine6ApiResponse
): Engine6ContentTier => {
  if (
    hasStructuredItinerary(payload) &&
    hasLogistics(payload) &&
    hasRating(payload) &&
    hasPrice(payload)
  ) {
    return "FULL_PARAGON";
  }

  if (hasPrice(payload) || hasRating(payload)) {
    return "STANDARD";
  }

  return "LIGHT";
};

