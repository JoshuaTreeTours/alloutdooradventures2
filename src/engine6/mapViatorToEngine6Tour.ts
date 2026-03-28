import { ENGINE6_APPROVED_PLACEHOLDER_IMAGE } from "../../api/engine6/heroResolver";

import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { normalizeEngine6AggregateRating } from "./rating";
import {
  buildEngine6CanonicalPath,
  buildEngine6MetaDescription,
  buildEngine6SeoTitle,
  cleanEngine6Description,
  formatEngine6CategoryLabel,
} from "./seo";
import type { Engine6ApiResponse, Engine6Tour } from "./types";

export const mapViatorToEngine6Tour = (
  payload: Engine6ApiResponse
): Engine6Tour => {
  const title =
    payload.extracted.title ?? `Outdoor Adventure ${payload.rawProductCode}`;
  const city = payload.extracted.city ?? "Destination";
  const state = payload.extracted.state ?? "USA";
  const heroImageUrl =
    payload.extracted.heroImageUrl ?? ENGINE6_APPROVED_PLACEHOLDER_IMAGE;
  const overviewText = cleanEngine6Description(
    payload.extracted.overviewText ?? ""
  );
  const highlights = payload.extracted.highlights ?? [];
  const itinerary = payload.extracted.itinerary ?? [];
  const faqs = payload.extracted.faqs ?? [];
  const included = payload.extracted.included ?? [];
  const requirements = payload.extracted.requirements ?? [];
  const categories = payload.extracted.categories ?? [];
  const primaryCategory =
    payload.extracted.primaryCategory ?? categories[0] ?? null;
  const categoryLabel = formatEngine6CategoryLabel(primaryCategory);
  const canonicalPath = buildEngine6CanonicalPath({ state, city, title });
  const rawDescription =
    payload.extracted.overviewText ??
    payload.extracted.seoDescription ??
    `Explore ${title} with local guides in ${city}, ${state}.`;
  const description = cleanEngine6Description(rawDescription);
  const metaDescription = buildEngine6MetaDescription(
    payload.extracted.seoDescription ?? description
  );
  const aggregateRating = normalizeEngine6AggregateRating(
    payload.extracted.aggregateRating
  );
  const bookingUrl = buildEngine6ViatorBookingUrl(
    payload.rawProductCode,
    payload.extracted.productUrl
  );
  const fallbackFieldNames = [
    !payload.extracted.title ? "title" : null,
    !payload.extracted.city ? "city" : null,
    !payload.extracted.state ? "state" : null,
    !payload.extracted.heroImageUrl ? "heroImageUrl" : null,
    !payload.extracted.priceFormatted ? "priceFormatted" : null,
    !payload.extracted.meetingPointText ? "meetingPointText" : null,
  ].filter((value): value is string => Boolean(value));

  const formattedStartingPrice =
    typeof payload.extracted.priceAmount === "number"
      ? `Starting at $${payload.extracted.priceAmount.toFixed(0)}`
      : payload.extracted.priceFormatted?.replace(/^From\s+/i, "Starting at ");

  return {
    productCode: payload.rawProductCode,
    title,
    seoTitle:
      payload.extracted.seoTitle ??
      buildEngine6SeoTitle({ title, city, state }),
    seoDescription: metaDescription,
    description,
    metaDescription,
    city,
    state,
    heroImageUrl,
    priceAmount: payload.extracted.priceAmount,
    priceFormatted: formattedStartingPrice ?? "Check latest price",
    aggregateRating,
    reviewCount: payload.extracted.reviewCount,
    meetingPointText:
      payload.extracted.meetingPointText ?? "See booking details",
    overviewText: overviewText || null,
    highlights,
    itinerary,
    faqs,
    included,
    requirements,
    primaryCategory,
    categories,
    categoryLabel,
    pagePath: canonicalPath,
    canonicalPath,
    bookingUrl,
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
      heroSourceType: payload.diagnostics.heroSourceType,
      finalHeroUrl: payload.diagnostics.finalHeroUrl,
      heroFallbackTriggered: payload.diagnostics.heroFallbackTriggered,
      rejectedForeignHeroCandidates:
        payload.diagnostics.rejectedForeignHeroCandidates,
      productUrlFieldPath: payload.diagnostics.productUrlFieldPath,
      bookingUrlSource:
        payload.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
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
      fieldLevelFallbackUsed: fallbackFieldNames.length > 0,
      fallbackFieldNames,
    },
  };
};
