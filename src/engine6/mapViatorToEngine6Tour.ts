import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { normalizeEngine6AggregateRating } from "./rating";
import { resolveEngine6PathForProductCode } from "./routes";
import {
  buildEngine6CanonicalPath,
  buildEngine6MetaDescription,
  buildEngine6SeoTitle,
  cleanEngine6Description,
  formatEngine6CategoryLabel,
} from "./seo";
import type { Engine6ApiResponse, Engine6Tour } from "./types";

const ENGINE6_OPENING_PATTERNS = [
  "Join one of the best experiences in %CITY% with this %TOUR_TYPE%.",
  "Discover one of the top-rated experiences in %CITY% on this %TOUR_TYPE%.",
  "Experience one of the most popular things to do in %CITY% with this %TOUR_TYPE%.",
  "Explore one of the best outdoor adventures in %CITY% on this %TOUR_TYPE%.",
] as const;
const ENGINE6_OPENING_PATTERN_OVERRIDES: Record<string, number> = {
  "100569P5": 0,
};
const ENGINE6_OPENING_SENTENCE_OVERRIDES: Record<string, string> = {
  "100569P5": "Join one of the best experiences in Anchorage...",
};

const ENGINE6_BOOKING_URL_OVERRIDES: Record<string, string> = {
  "53474P8":
    "/destinations/united-states/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155/book",
};

const pickOpeningPatternIndex = (seed: string) => {
  const override = ENGINE6_OPENING_PATTERN_OVERRIDES[seed];
  if (typeof override === "number") {
    return override;
  }

  if (!seed) {
    return 0;
  }

  const value = seed
    .split("")
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

  return value % ENGINE6_OPENING_PATTERNS.length;
};

const buildEngine6OpeningSentence = ({
  city,
  title,
  categoryLabel,
  productCode,
}: {
  city: string;
  title: string;
  categoryLabel: string | null;
  productCode: string;
}) => {
  const normalizedCity = city.trim() || "this destination";
  const titleIncludesCity = title
    .toLowerCase()
    .includes(normalizedCity.toLowerCase());
  const tourType =
    categoryLabel?.toLowerCase() ??
    (titleIncludesCity ? "tour" : title.toLowerCase());
  const safeTourType = tourType.includes("tour")
    ? tourType
    : `${tourType} tour`;
  const pattern =
    ENGINE6_OPENING_PATTERNS[pickOpeningPatternIndex(productCode)] ??
    ENGINE6_OPENING_PATTERNS[0];

  return pattern
    .replace("%CITY%", normalizedCity)
    .replace("%TOUR_TYPE%", safeTourType);
};

export const mapViatorToEngine6Tour = (
  payload: Engine6ApiResponse
): Engine6Tour => {
  const title =
    payload.extracted.title ?? `Outdoor Adventure ${payload.rawProductCode}`;
  const city = payload.extracted.city ?? "Destination";
  const state = payload.extracted.state ?? "USA";
  const resolvedImageUrl =
    typeof payload.extracted.heroImageUrl === "string" &&
    /^https?:\/\//i.test(payload.extracted.heroImageUrl) &&
    !payload.extracted.heroImageUrl.includes("/hero.jpg") &&
    !payload.extracted.heroImageUrl.includes("/images/hiking-hero.jpg")
      ? payload.extracted.heroImageUrl
      : null;
  const overviewText = cleanEngine6Description(
    payload.extracted.overviewText ?? ""
  );
  const highlights = payload.extracted.highlights ?? [];
  const itinerary = payload.extracted.itinerary ?? [];
  const itinerarySummaryText = payload.extracted.itinerarySummaryText ?? null;
  const faqs = payload.extracted.faqs ?? [];
  const included = payload.extracted.included ?? [];
  const requirements = payload.extracted.requirements ?? [];
  const categories = payload.extracted.categories ?? [];
  const primaryCategory =
    payload.extracted.primaryCategory ?? categories[0] ?? null;
  const categoryLabel = formatEngine6CategoryLabel(primaryCategory);
  const generatedCanonicalPath = buildEngine6CanonicalPath({
    state,
    city,
    title,
  });
  const canonicalPath =
    resolveEngine6PathForProductCode(payload.rawProductCode) ??
    generatedCanonicalPath;
  const rawDescription =
    payload.extracted.overviewText ??
    payload.extracted.seoDescription ??
    `Explore ${title} with local guides in ${city}, ${state}.`;
  const cleanedDescription = cleanEngine6Description(rawDescription);
  const openingSentence = buildEngine6OpeningSentence({
    city,
    title,
    categoryLabel,
    productCode: payload.rawProductCode,
  });
  const enforcedOpeningSentence =
    ENGINE6_OPENING_SENTENCE_OVERRIDES[payload.rawProductCode] ??
    openingSentence;
  const descriptionBody = cleanedDescription.replace(/\s+/g, " ").trim();
  const description = [enforcedOpeningSentence, descriptionBody]
    .filter(Boolean)
    .join(" ");
  const metaDescription = buildEngine6MetaDescription(
    payload.extracted.seoDescription ?? description
  );
  const aggregateRating = normalizeEngine6AggregateRating(
    payload.extracted.aggregateRating
  );
  const bookingUrl =
    ENGINE6_BOOKING_URL_OVERRIDES[payload.rawProductCode] ??
    buildEngine6ViatorBookingUrl(
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
    resolvedImageUrl,
    heroImageUrl: resolvedImageUrl ?? "",
    priceAmount: payload.extracted.priceAmount,
    priceFormatted: formattedStartingPrice ?? "Check latest price",
    aggregateRating,
    reviewCount: payload.extracted.reviewCount,
    meetingPointText:
      payload.extracted.meetingPointText ?? "See booking details",
    overviewText: overviewText || null,
    highlights,
    itinerary,
    itinerarySummaryText,
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
      itinerarySummaryFieldPath:
        payload.diagnostics.itinerarySummaryFieldPath ?? null,
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
