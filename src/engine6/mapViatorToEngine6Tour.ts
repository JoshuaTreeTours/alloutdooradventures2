import type { Engine6ApiResponse, Engine6Tour } from "./types";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1600&q=80";

export const mapViatorToEngine6Tour = (payload: Engine6ApiResponse): Engine6Tour => {
  const title = payload.extracted.title ?? "Utah Off-Road Adventure";
  const city = payload.extracted.city ?? "Springdale";
  const state = payload.extracted.state ?? "Utah";
  const heroImageUrl = payload.extracted.heroImageUrl ?? FALLBACK_HERO;

  return {
    productCode: payload.rawProductCode,
    title,
    seoTitle: payload.extracted.seoTitle ?? `${title} in ${city}`,
    seoDescription:
      payload.extracted.seoDescription ??
      `Best tour in ${city} with scenic off-road viewpoints and local guides.`,
    city,
    state,
    heroImageUrl,
    cardImageUrl: payload.extracted.cardImageUrl ?? heroImageUrl,
    priceAmount: payload.extracted.priceAmount,
    priceFormatted: payload.extracted.priceFormatted ?? "Check latest price",
    aggregateRating: payload.extracted.aggregateRating,
    reviewCount: payload.extracted.reviewCount,
    meetingPointText: payload.extracted.meetingPointText ?? "See booking details",
    itinerary: payload.extracted.itinerary ?? [],
    bookingUrl: `https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-${payload.rawProductCode}`,
    diagnostics: {
      source: payload.source,
      commercialPriceFieldPath: payload.diagnostics.commercialPriceFieldPath,
      heroImageFieldPath: payload.diagnostics.heroImageFieldPath,
      ratingFieldPath: payload.diagnostics.ratingFieldPath,
      reviewCountFieldPath: payload.diagnostics.reviewCountFieldPath,
      meetingPointFieldPath: payload.diagnostics.meetingPointFieldPath,
      itineraryFieldPath: payload.diagnostics.itineraryFieldPath,
    },
  };
};
