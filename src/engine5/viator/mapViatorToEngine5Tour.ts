import { buildEngine5TourPath } from "../buildEngine5TourPath";
import {
  ENGINE5_FORCED_SOURCE_IMAGE_BY_PRODUCT_CODE,
  type Engine5TourViewModel,
  type Engine5ViatorApiTour,
  type Engine5ViatorTourRecord,
} from "../types";
import { assertEngine5PrimaryImage } from "../types";
import { resolveSourceImage } from "./resolveSourceImage";

const asText = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const asStringList = (value?: string[]) =>
  (value ?? []).map(item => item.trim()).filter(Boolean);

export const mapViatorToEngine5Tour = (input: {
  record: Engine5ViatorTourRecord;
  apiTour?: Engine5ViatorApiTour;
  lastResortDestinationImage?: string;
}): Engine5TourViewModel => {
  const { record, apiTour } = input;
  const image = resolveSourceImage({
    productCode: record.productCode,
    sourceCode: apiTour?.sourceCode,
    apiTour,
    record,
    lastResortDestinationImage: input.lastResortDestinationImage,
  });

  const normalizedProductCode = record.productCode.toUpperCase();
  const forcedImage =
    ENGINE5_FORCED_SOURCE_IMAGE_BY_PRODUCT_CODE[normalizedProductCode];

  let primaryImage = image.primaryImage;

  if (forcedImage && primaryImage !== forcedImage) {
    console.info(`[engine5-image] product=${normalizedProductCode}`);
    console.info("[engine5-image] attemptedOverwriteBlocked=true");
    primaryImage = forcedImage;
  }

  assertEngine5PrimaryImage(primaryImage);

  const fallbackFields: string[] = [];
  if (!apiTour?.title) {
    fallbackFields.push("title");
  }

  if (fallbackFields.length > 0) {
    console.info(`[engine5-api] fallbackFields=[${fallbackFields.join(",")}]`);
  }

  return {
    engine: "engine5",
    bookingProvider: "viator",
    productCode: record.productCode,
    slug: record.slug,
    title:
      asText(apiTour?.title) ??
      "Rock Scrambling Adventures in Joshua Tree National Park",
    canonicalPath: buildEngine5TourPath(record),
    bookingUrl: record.bookingUrl,
    destination: record.destination,
    primaryImage,
    imageSource: image.imageSource,
    facts: {
      priceFrom: asText(apiTour?.fromPrice),
      ratingValue: apiTour?.rating,
      reviewCount: apiTour?.reviewCount,
      meetingPoint: asText(apiTour?.meetingPoint),
      startTime: asText(apiTour?.startTime),
      duration: asText(apiTour?.duration),
      cancellationPolicy: asText(apiTour?.cancellationPolicy),
    },
    content: {
      overview:
        asText(apiTour?.overview) ??
        asText(apiTour?.descriptionLong) ??
        "Guided rock scrambling experience in Joshua Tree National Park.",
      highlights: asStringList(apiTour?.highlights),
      inclusions: asStringList(apiTour?.inclusions),
      exclusions: asStringList(apiTour?.exclusions),
      whatToExpect: asText(apiTour?.whatToExpect),
      additionalInfo: asStringList(apiTour?.additionalInfo),
      faqs: apiTour?.faqs ?? [],
      itinerary: apiTour?.itinerary ?? [],
    },
  };
};
