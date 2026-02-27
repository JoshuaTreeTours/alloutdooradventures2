import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import type { Engine3TourViewModel, ViatorProductData } from "../types";

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeList = (values?: string[]): string[] | undefined => {
  if (!Array.isArray(values)) {
    return undefined;
  }

  const normalized = values
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item));

  return normalized.length > 0 ? normalized : undefined;
};

export const mapViatorToEngine3ViewModel = (
  tour: Engine2Tour,
  productData?: ViatorProductData
): Engine3TourViewModel => {
  const bookingUrl =
    cleanText(tour.bookingUrl) ?? cleanText(tour.booking.bookingUrl);

  return {
    tourId: tour.id,
    title: cleanText(productData?.title) ?? tour.name,
    city: tour.geo.city,
    region: tour.geo.region,
    canonicalPath: tour.seo.canonicalPath,
    bookingUrl: bookingUrl ?? "",
    duration:
      cleanText(productData?.duration) ?? cleanText(tour.content.duration),
    heroImageUrl:
      cleanText(productData?.supplierImage) ?? cleanText(tour.images.hero),
    priceFrom:
      cleanText(productData?.priceFrom) ?? cleanText(tour.pricing?.price),
    rating: productData?.rating ?? tour.viatorRatingValue ?? undefined,
    reviewCount:
      productData?.reviewCount ?? tour.viatorReviewCount ?? undefined,
    highlights:
      normalizeList(productData?.highlights) ??
      normalizeList(tour.content.highlights),
    included:
      normalizeList(productData?.included) ??
      normalizeList(tour.content.included),
    notIncluded:
      normalizeList(productData?.notIncluded) ??
      normalizeList(tour.content.notIncluded),
    meetingPointDescription:
      cleanText(productData?.meetingPointDescription) ??
      cleanText(tour.content.meetingPoint?.address) ??
      cleanText(tour.content.meetingPoint?.instructions),
    itinerary: productData?.itinerary?.length
      ? productData.itinerary
      : tour.content.itinerary,
    faqs: productData?.faqs?.length ? productData.faqs : tour.content.faqs,
  };
};
