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

const toSentence = (value: string) => {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const formatUsdStartingPrice = (amount: number) => {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
};

const stripMarketingLanguage = (value: string) =>
  value
    .replace(/\bonce in a lifetime\b/gi, "")
    .replace(/\btrip of a lifetime\b/gi, "")
    .replace(/\bmust-?do\b/gi, "notable")
    .replace(/\bbucket list\b/gi, "popular");

const buildAuthoritativeOverview = ({
  title,
  city,
  state,
  categoryLabel,
  durationText,
  highlights,
  itinerary,
  meetingPointText,
  sourceOverview,
}: {
  title: string;
  city: string;
  state: string;
  categoryLabel: string | null;
  durationText: string | null;
  highlights: string[];
  itinerary: Array<{ title: string }>;
  meetingPointText: string | null;
  sourceOverview: string;
}) => {
  const normalizedLocation = `${city}, ${state}`;
  const activityLabel =
    categoryLabel?.toLowerCase().replace(/\s+tour$/i, " tour") ??
    "guided tour";
  const highlightText = highlights
    .slice(0, 3)
    .map(item => item.replace(/\.$/, "").trim())
    .filter(Boolean)
    .join(", ");
  const stopText = itinerary
    .slice(0, 3)
    .map(stop => stop.title.replace(/\.$/, "").trim())
    .filter(Boolean)
    .join(", ");
  const sourceSnippet = stripMarketingLanguage(sourceOverview)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .trim();

  const opening = toSentence(
    `${title} is a ${activityLabel} in ${normalizedLocation} focused on efficient access to key sights and local context`
  );
  const middleA = toSentence(
    [
      highlightText
        ? `Expect a route that covers ${highlightText}`
        : "The experience combines signature landmarks with practical local insights",
      stopText ? `with scheduled stops such as ${stopText}` : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  const logistics = toSentence(
    [
      "The format is guided and follows a structured itinerary",
      durationText ? `with a typical duration of ${durationText}` : "",
      meetingPointText ? `and departure details centered on ${meetingPointText}` : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  const closer = toSentence(
    "It is best for first-time visitors, time-conscious travelers, and small groups that want clear pacing without sacrificing major highlights"
  );

  const parts = [opening, middleA, logistics, sourceSnippet, closer].filter(Boolean);
  const withLimit = () => {
    const limited: string[] = [];
    for (const part of parts) {
      const next = [...limited, part].join(" ");
      if (countWords(next) > 120) break;
      limited.push(part);
    }
    return limited.join(" ");
  };

  let summary = withLimit();
  if (countWords(summary) < 90) {
    const expansion = toSentence(
      `This ${city} tour is designed for travelers who want reliable logistics and substantive interpretation at each phase of the outing`
    );
    const expanded = `${summary} ${expansion}`.trim();
    summary = countWords(expanded) <= 120 ? expanded : summary;
  }

  return summary;
};

export const mapViatorToEngine6Tour = (
  payload: Engine6ApiResponse
): Engine6Tour => {
  const title =
    payload.extracted.title ?? `Outdoor Adventure ${payload.rawProductCode}`;
  const city = payload.extracted.city ?? "Destination";
  const state = payload.extracted.state ?? "USA";
  const finalHeroImageUrl =
    typeof payload.extracted.heroImageUrl === "string" &&
    /^https?:\/\//i.test(payload.extracted.heroImageUrl) &&
    !payload.extracted.heroImageUrl.includes("/hero.jpg") &&
    !payload.extracted.heroImageUrl.includes("/images/hiking-hero.jpg")
      ? payload.extracted.heroImageUrl
      : null;
  const strictResolvedHero =
    finalHeroImageUrl &&
    payload.diagnostics.heroSourceProductCode &&
    payload.diagnostics.heroSourceProductUrl &&
    payload.diagnostics.heroSourceFieldPath &&
    payload.diagnostics.heroHost &&
    payload.diagnostics.heroSourceFieldPath.startsWith("product.media.images") &&
    payload.diagnostics.heroSourceProductCode.toUpperCase() ===
      payload.rawProductCode.toUpperCase() &&
    payload.diagnostics.finalHeroUrl === finalHeroImageUrl
      ? {
          url: finalHeroImageUrl,
          sourceProductCode: payload.diagnostics.heroSourceProductCode,
          sourceProductUrl: payload.diagnostics.heroSourceProductUrl,
          sourceFieldPath: payload.diagnostics.heroSourceFieldPath,
          host: payload.diagnostics.heroHost,
        }
      : null;

  if (!strictResolvedHero) {
    throw new Error(
      `Engine6 strict hero contract violation for ${payload.rawProductCode}: resolved hero must be exact-product product.media.images with full provenance`
    );
  }
  const sourceOverviewText = cleanEngine6Description(
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
  const bookingUrl = buildEngine6ViatorBookingUrl(
    payload.rawProductCode,
    payload.extracted.productUrl
  );
  const ctaOwner = "viator";
  const fallbackFieldNames = [
    !payload.extracted.title ? "title" : null,
    !payload.extracted.city ? "city" : null,
    !payload.extracted.state ? "state" : null,
    !payload.extracted.heroImageUrl ? "heroImageUrl" : null,
    !payload.extracted.priceFormatted ? "priceFormatted" : null,
    !payload.extracted.meetingPointText ? "meetingPointText" : null,
  ].filter((value): value is string => Boolean(value));

  const formattedStartingPrice =
    payload.extracted.priceFormatted &&
    /per\s+group|private/i.test(payload.extracted.priceFormatted)
      ? payload.extracted.priceFormatted
      : typeof payload.extracted.priceAmount === "number"
      ? `Starting at ${formatUsdStartingPrice(payload.extracted.priceAmount)}`
      : payload.extracted.priceFormatted?.replace(
            /^From\s+/i,
            "Starting at "
          );
  const overviewText = buildAuthoritativeOverview({
    title,
    city,
    state,
    categoryLabel,
    durationText: null,
    highlights,
    itinerary,
    meetingPointText: payload.extracted.meetingPointText ?? null,
    sourceOverview: sourceOverviewText,
  });

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
    resolvedImageUrl: strictResolvedHero.url,
    heroImageUrl: strictResolvedHero.url,
    resolvedHero: strictResolvedHero,
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
    ownership: {
      routeOwner: ctaOwner,
      ctaOwner,
      presentationOwner: "engine6",
      commercialOwner: "viator",
      commercialFallbackReason: "none",
    },
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
      heroQualityClassification: payload.diagnostics.heroQualityClassification,
      finalHeroUrl: payload.diagnostics.finalHeroUrl,
      heroFallbackTriggered: payload.diagnostics.heroFallbackTriggered,
      heroCandidatesPresent: payload.diagnostics.heroCandidatesPresent,
      heroCandidateCount: payload.diagnostics.heroCandidateCount,
      heroCandidateCountBeforeFiltering:
        payload.diagnostics.heroCandidateCountBeforeFiltering,
      heroCandidateCountAfterFiltering:
        payload.diagnostics.heroCandidateCountAfterFiltering,
      heroPlaceholderFallbackReason:
        payload.diagnostics.heroPlaceholderFallbackReason,
      captionPrecedenceApplied: payload.diagnostics.captionPrecedenceApplied,
      candidateFamilyIdentityDeterminable:
        payload.diagnostics.candidateFamilyIdentityDeterminable,
      heroSurfaceParity: payload.diagnostics.heroSurfaceParity,
      rejectedForeignHeroCandidates:
        payload.diagnostics.rejectedForeignHeroCandidates,
      heroSourceProductCode: payload.diagnostics.heroSourceProductCode,
      heroSourceProductUrl: payload.diagnostics.heroSourceProductUrl,
      heroSourceFieldPath: payload.diagnostics.heroSourceFieldPath,
      heroHost: payload.diagnostics.heroHost,
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
