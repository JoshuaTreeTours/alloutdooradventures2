import type { Engine4TourViewModel } from "../../engine4/types";
import type { Tour } from "../../data/tours.types";
import { slugify } from "../../utils/slugify";
import type {
  Engine5NormalizedTour,
  Engine5ProductRecord,
  Engine5ViatorApiTour,
} from "../types";

export const mapViatorToEngine5Tour = (
  record: Engine5ProductRecord,
  apiTour: Engine5ViatorApiTour
): {
  normalized: Engine5NormalizedTour;
  page: Engine4TourViewModel;
  listing: Tour;
} => {
  if (!apiTour.provenance.apiFetchSucceeded) {
    throw new Error(`Engine5 strict mode rejected ${record.productCode}`);
  }

  const slug = `${slugify(apiTour.title)}-${record.productCode.toLowerCase()}`;
  const canonicalPath = `/destinations/${record.destination.stateSlug}/${record.destination.citySlug}/tours/${slug}`;
  const bookingUrl = apiTour.bookingUrl;

  if (!apiTour.canonicalHeroUrl) {
    throw new Error(`Engine5 missing canonical hero for ${record.productCode}`);
  }

  const normalized: Engine5NormalizedTour = {
    productCode: record.productCode,
    slug,
    destination: record.destination,
    bookingUrl,
    title: apiTour.title,
    facts: {
      priceFrom: apiTour.fromPrice,
      ratingValue: apiTour.rating,
      reviewCount: apiTour.reviewCount,
      duration: apiTour.duration,
      startTime: apiTour.startTime,
      meetingPointFull: apiTour.meetingPoint,
      meetingPointShort: apiTour.meetingPoint?.split(",")[0],
      cancellationPolicy: apiTour.cancellationPolicy,
    },
    content: {
      overview: apiTour.description,
      highlights: apiTour.highlights,
      faqs: apiTour.faqs,
      itinerary: apiTour.itinerary,
      inclusions: apiTour.inclusions,
      exclusions: apiTour.exclusions,
      additionalInfo: apiTour.additionalInfo.join(" "),
    },
    exactProductImages: apiTour.exactProductImages,
    canonicalHeroUrl: apiTour.canonicalHeroUrl,
    heroSelectionSource: apiTour.heroSelectionSource,
    heroSelectionSize: apiTour.heroSelectionSize,
    diagnostics: {
      exactProductImageCandidateUrls:
        apiTour.heroSelectionDiagnostics.candidateUrls,
      selectedCanonicalHeroUrl: apiTour.canonicalHeroUrl,
      pageHeroUrl: apiTour.canonicalHeroUrl,
      listingCardUrl: apiTour.canonicalHeroUrl,
      ogImageUrl: apiTour.canonicalHeroUrl,
      schemaImageUrl: apiTour.canonicalHeroUrl,
      allImageSurfacesIdentical: true,
      heroSelectionSource: apiTour.heroSelectionSource,
      ratingReviewSource:
        typeof apiTour.rating === "number" &&
        typeof apiTour.reviewCount === "number"
          ? "api"
          : "missing",
      overrideUsed: apiTour.heroSelectionDiagnostics.overrideUsed,
    },
  };

  const page: Engine4TourViewModel = {
    tourId: `engine5-${record.productCode}`,
    engine: "engine4",
    bookingProvider: "viator",
    productCode: record.productCode,
    slug,
    title: apiTour.title,
    canonicalPath,
    bookingUrl,
    destination: record.destination,
    heroImage: normalized.canonicalHeroUrl,
    primaryImage: normalized.canonicalHeroUrl,
    galleryImages: normalized.exactProductImages
      .flatMap(image => image.variants.map(variant => variant.url))
      .filter((url, index, all) => all.indexOf(url) === index),
    facts: normalized.facts,
    content: normalized.content,
  };

  const listing: Tour = {
    id: `engine5-${record.productCode}`,
    engine: "engine4",
    productCode: record.productCode,
    slug,
    title: apiTour.title,
    shortDescription: apiTour.description,
    operator: "Viator",
    categories: ["adventure"],
    primaryCategory: "adventure",
    destination: record.destination,
    heroImage: normalized.canonicalHeroUrl,
    primaryImageUrl: normalized.canonicalHeroUrl,
    galleryImages: page.galleryImages,
    badges: {
      rating: apiTour.rating,
      reviewCount: apiTour.reviewCount,
      duration: apiTour.duration,
      priceFrom: apiTour.fromPrice,
    },
    activitySlugs: ["adventure"],
    bookingProvider: "viator",
    bookingUrl,
    longDescription: apiTour.description,
    content: {
      overview: apiTour.description,
      highlights: apiTour.highlights,
    },
  };

  return { normalized, page, listing };
};
