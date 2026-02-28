import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { selectViatorPrimaryImage } from "../utils/selectViatorPrimaryImage";
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

const defaultItineraryFromHighlights = [
  "Guided Hummer ride into Joshua Tree region",
  "Geology and desert ecology interpretation",
  "Scenic stops and photo opportunities",
  "Return transfer",
];

const splitSrcSetCandidates = (values?: string[]): string[] => {
  if (!values?.length) {
    return [];
  }

  return values.flatMap(value =>
    value
      .split(",")
      .map(entry => cleanText(entry.trim().split(/\s+/)[0]))
      .filter((entry): entry is string => Boolean(entry))
  );
};

const mapStructuredItinerary = (
  itinerary?: Array<{
    title?: string;
    description?: string;
    duration?: string;
    order?: number;
  }>
) =>
  itinerary
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
    );

export const mapViatorToEngine3ViewModel = (
  tour: Engine2Tour,
  productData?: ViatorProductData
): Engine3TourViewModel => {
  const bookingUrl =
    cleanText(tour.bookingUrl) ?? cleanText(tour.booking.bookingUrl);

  const rawImageCandidates = [
    ...(productData?.imageUrls ?? []),
    cleanText(productData?.supplierImage),
    cleanText(tour.images.hero),
    ...(tour.images.gallery ?? []),
  ].filter((item): item is string => Boolean(item));

  const heroImageCandidates = [
    ...rawImageCandidates,
    ...splitSrcSetCandidates(rawImageCandidates),
  ];

  const title = cleanText(productData?.title) ?? tour.name;
  const city = cleanText(tour.geo.city);
  const state = cleanText(tour.geo.region);

  const primaryImageUrl = selectViatorPrimaryImage({
    primaryImageUrl:
      cleanText(productData?.supplierImage) ?? cleanText(tour.images.hero),
    imageUrls: heroImageCandidates,
    fallbackImageUrl: "/hero.jpg",
  });

  return {
    tourId: tour.id,
    title,
    country: cleanText(tour.geo.country),
    city: tour.geo.city,
    region: tour.geo.region,
    canonicalPath: tour.seo.canonicalPath,
    bookingUrl: bookingUrl ?? "",
    duration:
      cleanText(productData?.duration) ?? cleanText(tour.content.duration),
    primaryImageUrl,
    primaryImageAlt: `${title}${city ? ` — ${city}` : ""}${state ? `, ${state}` : ""}`,
    heroImageUrl: primaryImageUrl,
    heroImageAlt: `${title}${city ? ` — ${city}` : ""}${state ? `, ${state}` : ""}`,
    priceFrom:
      cleanText(productData?.priceFrom) ?? cleanText(tour.pricing?.price),
    priceCurrency: cleanText(productData?.priceCurrency),
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
    itinerary:
      mapStructuredItinerary(productData?.itinerary) ??
      mapStructuredItinerary(
        tour.content.itinerary?.map((item, index) => ({
          title: item.title,
          description: item.description,
          duration: item.duration,
          order: index + 1,
        }))
      ) ??
      (
        normalizeList(productData?.highlights) ??
        normalizeList(tour.content.highlights)
      )?.map((title, index) => ({
        title,
        order: index + 1,
      })) ??
      defaultItineraryFromHighlights.map((title, index) => ({
        title,
        order: index + 1,
      })),
    faqs: productData?.faqs?.length ? productData.faqs : tour.content.faqs,
  };
};
