import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { normalizeEngine6AggregateRating } from "./rating";
import { rewriteEngine6Overview } from "./rewriteOverview";
import {
  buildEngine6CanonicalPath,
  buildEngine6MetaDescription,
  buildEngine6SeoTitle,
  cleanEngine6Description,
  formatEngine6CategoryLabel,
} from "./seo";
import { getEngine6RouteSpecByProductCode } from "./routes";
import type { Engine6ApiResponse, Engine6Tour } from "./types";

const FALLBACK_HERO = "/hero.jpg";

export const mapViatorToEngine6Tour = (
  payload: Engine6ApiResponse
): Engine6Tour => {
  const title =
    payload.extracted.title ??
    (payload.rawProductCode === "163873P16"
      ? "Utah Off-Road Adventure"
      : `Outdoor Adventure ${payload.rawProductCode}`);
  const city = payload.extracted.city ?? "Destination";
  const state = payload.extracted.state ?? "USA";
  const heroImageUrl = payload.extracted.heroImageUrl ?? FALLBACK_HERO;
  const overviewText = rewriteEngine6Overview({
    title,
    city,
    state,
    originalOverview: payload.extracted.overviewText,
    durationText: payload.extracted.durationText,
    highlights: payload.extracted.highlights ?? [],
    itinerary: payload.extracted.itinerary ?? [],
  });
  const highlights = payload.extracted.highlights ?? [];
  const itinerary = payload.extracted.itinerary ?? [];
  const faqs = payload.extracted.faqs ?? [];
  const requirements = payload.extracted.requirements ?? [];
  const categories = payload.extracted.categories ?? [];
  const primaryCategory =
    payload.extracted.primaryCategory ?? categories[0] ?? null;
  const categoryLabel = formatEngine6CategoryLabel(primaryCategory);
  const routeSpec = getEngine6RouteSpecByProductCode(payload.rawProductCode);
  const canonicalPath =
    routeSpec?.route ?? buildEngine6CanonicalPath({ state, city, title });
  const description = cleanEngine6Description(
    overviewText ||
      payload.extracted.seoDescription ||
      `Explore ${title} with local guides in ${city}, ${state}.`
  );
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
    !payload.extracted.overviewText ? "overviewText" : null,
  ].filter((value): value is string => Boolean(value));

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
    cardImageUrl: heroImageUrl,
    galleryImageUrls: [],
    priceAmount: payload.extracted.priceAmount,
    priceFormatted: payload.extracted.priceFormatted ?? "Check latest price",
    aggregateRating,
    reviewCount: payload.extracted.reviewCount,
    durationText: payload.extracted.durationText,
    pickupOffered: payload.extracted.pickupOffered,
    mobileTicket: payload.extracted.mobileTicket,
    language: payload.extracted.language,
    operatorName: payload.extracted.operatorName,
    cancellationSummary: payload.extracted.cancellationSummary,
    inclusionItems: payload.extracted.inclusionItems ?? [],
    exclusionItems: payload.extracted.exclusionItems ?? [],
    meetingPointText:
      payload.extracted.meetingPointText ?? "See booking details",
    overviewText: overviewText || null,
    highlights,
    itinerary,
    faqs,
    requirements,
    primaryCategory,
    categories,
    categoryLabel,
    pagePath: canonicalPath,
    canonicalPath,
    bookingUrl,
    diagnostics: {
      source: payload.source,
      resolvedProductUrl: bookingUrl,
      resolvedHeroImageUrl: heroImageUrl,
      commercialPriceFieldPath: payload.diagnostics.commercialPriceFieldPath,
      commercialPriceRawValue: payload.diagnostics.commercialPriceRawValue,
      priceSourceUsed: payload.diagnostics.priceSourceUsed,
      heroImageFieldPath: payload.diagnostics.heroImageFieldPath,
      heroVariantFieldPath: payload.diagnostics.heroVariantFieldPath,
      selectedHeroWidth: payload.diagnostics.selectedHeroWidth,
      selectedHeroHeight: payload.diagnostics.selectedHeroHeight,
      imageSourceUsed: payload.diagnostics.imageSourceUsed,
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
