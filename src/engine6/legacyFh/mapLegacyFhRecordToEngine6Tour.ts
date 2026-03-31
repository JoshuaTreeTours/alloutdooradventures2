import type { Engine6Tour } from "../types";
import { resolveLegacyFhDedupeConstitution } from "../dedupeConstitution";
import type { LegacyFhMigratedProductRecord } from "./types";

export const mapLegacyFhRecordToEngine6Tour = (
  record: LegacyFhMigratedProductRecord
): Engine6Tour => {
  if (!record.bookingPath.endsWith("/book")) {
    throw new Error(
      `Legacy FH migrated booking path must preserve /book endpoint: ${record.bookingPath}`
    );
  }

  const [, stateSlug = "", citySlug = ""] =
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\//.exec(record.canonicalPath) ?? [];
  const city = citySlug
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const state = stateSlug
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const highlights = record.highlights;
  const overviewText = record.overview;
  const requirements = [
    ...record.additionalInfo,
    ...(record.cancellationSummary ? [record.cancellationSummary] : []),
    ...record.exclusions.map(item => `Not included: ${item}`),
  ];
  const dedupeResolution = resolveLegacyFhDedupeConstitution(record);
  const resolvedPriceAmount = dedupeResolution.commercial.priceAmount;
  const resolvedAggregateRating = dedupeResolution.commercial.aggregateRating;
  const resolvedReviewCount = dedupeResolution.commercial.reviewCount;
  const resolvedPriceLabel = dedupeResolution.diagnostics.viatorCommercialFieldsUsed
    ? typeof resolvedPriceAmount === "number"
      ? `Starting at $${resolvedPriceAmount.toFixed(0)}`
      : "Check latest price"
    : record.priceSnapshot.label ??
      (typeof record.priceSnapshot.amount === "number"
        ? `Starting at $${record.priceSnapshot.amount.toFixed(0)}`
        : "Check latest price");

  return {
    productCode: `fh-${record.slug}`,
    title: record.title,
    seoTitle: `${record.title} | ${record.sourceType.replaceAll("_", " ")}`,
    seoDescription:
      overviewText?.slice(0, 155) ?? `Book ${record.title} in ${city} with local guides.`,
    description: overviewText ?? record.title,
    metaDescription:
      overviewText?.slice(0, 155) ?? `Book ${record.title} in ${city} with local guides.`,
    city: city || "Destination",
    state: state || "State",
    resolvedImageUrl: record.heroImageUrl,
    heroImageUrl: record.heroImageUrl ?? "",
    priceAmount: resolvedPriceAmount,
    priceFormatted: resolvedPriceLabel,
    aggregateRating: resolvedAggregateRating,
    reviewCount: resolvedReviewCount,
    meetingPointText: record.meetingInfo ?? "See booking details",
    durationText: record.durationText,
    overviewText,
    highlights,
    itinerary: record.itinerary.map(stop => ({
      title: stop.title,
      description: stop.description,
    })),
    itinerarySummaryText: null,
    faqs: [],
    included: record.inclusions,
    requirements,
    primaryCategory: "bike-tour",
    categories: ["bike-tour"],
    categoryLabel: "Bike tour",
    pagePath: record.canonicalPath,
    canonicalPath: record.canonicalPath,
    bookingUrl: record.bookingPath,
    ownership: dedupeResolution.ownership,
    diagnostics: {
      source: "legacy-fh-migrated",
      commercialConfidenceReason: dedupeResolution.diagnostics.commercialConfidenceReason,
      viatorCommercialFieldsUsed: dedupeResolution.diagnostics.viatorCommercialFieldsUsed,
      commercialSourceWinner: dedupeResolution.diagnostics.commercialSourceWinner,
      commercialPriceFieldPath: dedupeResolution.diagnostics.commercialPriceFieldPath,
      commercialPriceRawValue: dedupeResolution.diagnostics.viatorCommercialFieldsUsed
        ? resolvedPriceAmount
        : record.priceSnapshot.label,
      priceSourceUsed: "fallback",
      heroImageFieldPath: "legacy.og:image",
      heroVariantFieldPath: null,
      selectedHeroWidth: null,
      selectedHeroHeight: null,
      imageSourceUsed: "api-primary",
      heroSourceType: "api-primary",
      heroQualityClassification: "product-media",
      finalHeroUrl: record.heroImageUrl,
      heroFallbackTriggered: false,
      captionPrecedenceApplied: false,
      candidateFamilyIdentityDeterminable: false,
      heroSurfaceParity: {
        page: Boolean(record.heroImageUrl),
        card: Boolean(record.heroImageUrl),
        schema: Boolean(record.heroImageUrl),
      },
      rejectedForeignHeroCandidates: [],
      productUrlFieldPath: null,
      bookingUrlSource: "legacy.bookingPath",
      ratingFieldPath: dedupeResolution.diagnostics.ratingFieldPath,
      reviewCountFieldPath: dedupeResolution.diagnostics.reviewCountFieldPath,
      overviewFieldPath: "legacy.overview",
      highlightsFieldPath: "legacy.highlights",
      meetingPointFieldPath: "legacy.meeting",
      itineraryFieldPath: "legacy.itinerary",
      itineraryItemCount: record.itinerary.length,
      itinerarySourceUsed: "legacy.itinerary",
      itinerarySummaryFieldPath: null,
      faqsFieldPath: null,
      faqFieldPath: null,
      faqCount: 0,
      faqSourceUsed: null,
      requirementsFieldPath: "legacy.additionalInfo",
      highlightClassificationReason: "legacy-fh-migrated",
      classificationFieldPath: null,
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
  };
};
