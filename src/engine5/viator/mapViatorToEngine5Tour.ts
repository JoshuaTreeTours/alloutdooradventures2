import type { Tour } from "../../data/tours.types";
import { slugify } from "../../utils/slugify";
import type { Engine4TourViewModel } from "../../engine4/types";
import type { Engine5ProductRecord, Engine5ViatorApiTour } from "../types";

export const mapViatorToEngine5Tour = (
  record: Engine5ProductRecord,
  apiTour: Engine5ViatorApiTour
): { page: Engine4TourViewModel; listing: Tour } => {
  if (!apiTour.provenance.apiFetchSucceeded) {
    throw new Error(`Engine5 strict mode rejected ${record.productCode}`);
  }

  const slug = slugify(apiTour.title);
  const canonicalPath = `/engine5/${record.destination.stateSlug}/${record.destination.citySlug}/tours/${slug}`;
  const bookingUrl = apiTour.sourceUrl;

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
    heroImage: apiTour.primaryImageUrl,
    primaryImage: apiTour.primaryImageUrl,
    galleryImages: apiTour.galleryImages,
    facts: {
      priceFrom: apiTour.fromPrice,
      ratingValue: apiTour.rating,
      reviewCount: apiTour.reviewCount,
      duration: apiTour.duration,
      meetingPointFull: apiTour.meetingPoint,
      meetingPointShort: apiTour.meetingPoint?.split(",")[0],
      cancellationPolicy: apiTour.cancellationPolicy,
    },
    content: {
      overview: apiTour.description,
      highlights: [],
      faqs: [],
      itinerary: apiTour.itinerary,
      inclusions: apiTour.inclusions,
      exclusions: apiTour.exclusions,
      additionalInfo: apiTour.additionalInfo.join(" "),
    },
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
    heroImage: apiTour.primaryImageUrl,
    primaryImageUrl: apiTour.primaryImageUrl,
    galleryImages: apiTour.galleryImages,
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
      highlights: [],
    },
  };

  return { page, listing };
};
