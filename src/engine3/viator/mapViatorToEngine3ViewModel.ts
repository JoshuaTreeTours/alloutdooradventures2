import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { generateAuthoritativeDescription } from "../utils/generateAuthoritativeDescription";
import type { Engine3TourViewModel, ViatorProductData } from "../types";
import { ENGINE3_VIATOR_OVERRIDES } from "./engine3ViatorOverrides";

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

  const title = cleanText(productData?.title) ?? tour.name;
  const highlights =
    normalizeList(productData?.highlights) ??
    normalizeList(tour.content.highlights);
  const included =
    normalizeList(productData?.included) ??
    normalizeList(tour.content.included);
  const itinerary =
    productData?.itinerary
      ?.map((item, index) => ({
        title: cleanText(item.title),
        description: cleanText(item.description),
        duration: cleanText(item.duration),
        order: item.order ?? index + 1,
      }))
      .filter(item => Boolean(item.title || item.description || item.duration))
      .sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER)
      ) ??
    tour.content.itinerary
      ?.map((item, index) => ({
        title: cleanText(item.title),
        description: cleanText(item.description),
        duration: cleanText(item.duration),
        order: index + 1,
      }))
      .filter(item => Boolean(item.title || item.description || item.duration));

  const overrideDescription = cleanText(
    ENGINE3_VIATOR_OVERRIDES[productData?.productCode ?? ""]?.description
  );
  const sourceDescription = cleanText(productData?.description);
  const hasNarrativeSources = Boolean(
    (highlights && highlights.length > 0) ||
    (itinerary && itinerary.some(item => Boolean(item.title)))
  );

  const generatedDescription = hasNarrativeSources
    ? generateAuthoritativeDescription({
        title,
        city: cleanText(tour.geo.city),
        state: cleanText(tour.geo.region),
        country: cleanText(tour.geo.country),
        durationText:
          cleanText(productData?.duration) ?? cleanText(tour.content.duration),
        highlights,
        itineraryTitles: itinerary
          ?.map(item => item.title ?? "")
          .filter(Boolean),
        inclusions: included,
        meetingPointText:
          cleanText(productData?.meetingPointDescription) ??
          cleanText(tour.content.meetingPoint?.address) ??
          cleanText(tour.content.meetingPoint?.instructions),
        operatorName: cleanText(tour.provider.name),
      })
    : undefined;

  const fallbackOneLiner = `${title} in ${
    cleanText(tour.geo.city) ?? cleanText(tour.geo.region) ?? "the destination"
  } (${cleanText(productData?.duration) ?? cleanText(tour.content.duration) ?? "duration varies"}).`;

  return {
    tourId: tour.id,
    title,
    description:
      overrideDescription ??
      sourceDescription ??
      generatedDescription ??
      fallbackOneLiner,
    country: cleanText(tour.geo.country),
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
    priceCurrency: cleanText(productData?.priceCurrency),
    rating: productData?.rating ?? tour.viatorRatingValue ?? undefined,
    reviewCount:
      productData?.reviewCount ?? tour.viatorReviewCount ?? undefined,
    highlights,
    included,
    notIncluded:
      normalizeList(productData?.notIncluded) ??
      normalizeList(tour.content.notIncluded),
    meetingPointDescription:
      cleanText(productData?.meetingPointDescription) ??
      cleanText(tour.content.meetingPoint?.address) ??
      cleanText(tour.content.meetingPoint?.instructions),
    itinerary,
    faqs: productData?.faqs?.length ? productData.faqs : tour.content.faqs,
  };
};
