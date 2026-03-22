import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import {
  buildEngine6CanonicalPath,
  buildEngine6MetaDescription,
  cleanEngine6Description,
  formatEngine6CategoryLabel,
} from "./seo";
import type { Engine6ApiResponse, Engine6Tour } from "./types";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1600&q=80";

export const mapViatorToEngine6Tour = (
  payload: Engine6ApiResponse
): Engine6Tour => {
  const title = payload.extracted.title ?? "Utah Off-Road Adventure";
  const city = payload.extracted.city ?? "Springdale";
  const state = payload.extracted.state ?? "Utah";
  const heroImageUrl =
    payload.extracted.heroImageUrl ??
    payload.extracted.cardImageUrl ??
    FALLBACK_HERO;
  const overviewText = cleanEngine6Description(
    payload.extracted.overviewText ?? ""
  );
  const highlights = payload.extracted.highlights ?? [];
  const itinerary = payload.extracted.itinerary ?? [];
  const faqs = payload.extracted.faqs ?? [];
  const requirements = payload.extracted.requirements ?? [];
  const categories = payload.extracted.categories ?? [];
  const primaryCategory =
    payload.extracted.primaryCategory ?? categories[0] ?? null;
  const canonicalPath = buildEngine6CanonicalPath({ state, city, title });
  const rawDescription =
    payload.extracted.overviewText ??
    payload.extracted.seoDescription ??
    `Explore ${title} with local guides in ${city}, ${state}.`;
  const description = cleanEngine6Description(rawDescription);
  const metaDescription = buildEngine6MetaDescription(
    payload.extracted.seoDescription ?? description
  );

  return {
    productCode: payload.rawProductCode,
    title,
    seoTitle: payload.extracted.seoTitle ?? `${title} in ${city}`,
    seoDescription: metaDescription,
    description,
    metaDescription,
    city,
    state,
    heroImageUrl,
    cardImageUrl: heroImageUrl,
    priceAmount: payload.extracted.priceAmount,
    priceFormatted: payload.extracted.priceFormatted ?? "Check latest price",
    aggregateRating: payload.extracted.aggregateRating,
    reviewCount: payload.extracted.reviewCount,
    meetingPointText:
      payload.extracted.meetingPointText ?? "See booking details",
    overviewText: overviewText || null,
    highlights,
    itinerary,
    faqs,
    requirements,
    primaryCategory,
    categories,
    categoryLabel: formatEngine6CategoryLabel(primaryCategory),
    pagePath: canonicalPath,
    canonicalPath,
    bookingUrl: buildEngine6ViatorBookingUrl(payload.rawProductCode),
    diagnostics: {
      source: payload.source,
      commercialPriceFieldPath: payload.diagnostics.commercialPriceFieldPath,
      commercialPriceRawValue: payload.diagnostics.commercialPriceRawValue,
      priceSourceUsed: payload.diagnostics.priceSourceUsed,
      heroImageFieldPath: payload.diagnostics.heroImageFieldPath,
      heroVariantFieldPath: payload.diagnostics.heroVariantFieldPath,
      selectedHeroWidth: payload.diagnostics.selectedHeroWidth,
      selectedHeroHeight: payload.diagnostics.selectedHeroHeight,
      imageSourceUsed: payload.diagnostics.imageSourceUsed,
      ratingFieldPath: payload.diagnostics.ratingFieldPath,
      reviewCountFieldPath: payload.diagnostics.reviewCountFieldPath,
      overviewFieldPath: payload.diagnostics.overviewFieldPath,
      highlightsFieldPath: payload.diagnostics.highlightsFieldPath,
      meetingPointFieldPath: payload.diagnostics.meetingPointFieldPath,
      itineraryFieldPath: payload.diagnostics.itineraryFieldPath,
      itineraryItemCount: payload.diagnostics.itineraryItemCount,
      itinerarySourceUsed: payload.diagnostics.itinerarySourceUsed,
      faqsFieldPath: payload.diagnostics.faqsFieldPath,
      faqFieldPath: payload.diagnostics.faqFieldPath,
      faqCount: payload.diagnostics.faqCount,
      faqSourceUsed: payload.diagnostics.faqSourceUsed,
      requirementsFieldPath: payload.diagnostics.requirementsFieldPath,
      highlightClassificationReason:
        payload.diagnostics.highlightClassificationReason,
      classificationFieldPath: payload.diagnostics.classificationFieldPath,
    },
  };
};
