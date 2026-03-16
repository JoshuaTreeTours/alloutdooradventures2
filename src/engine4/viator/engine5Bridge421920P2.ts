import type { Engine4ViatorApiTour } from "../types";
import {
  extractViatorDuration,
  extractViatorFaqs,
  extractViatorItinerary,
  extractViatorMeetingPoint,
  extractViatorPrice,
  extractViatorRating,
  extractViatorReviewCount,
} from "../../engine5/viator/extractors";

export const ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE = "421920P2";
export const ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES = [
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
  "74236P5",
] as const;

export const isEngine4StrictEngine5BridgeProductCode = (
  productCode: string
): boolean => {
  const normalizedCode = productCode.trim().toUpperCase();
  return ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES.includes(
    normalizedCode as (typeof ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES)[number]
  );
};

export type Engine4BridgeRuntimeSource =
  | "live-api"
  | "bundled-fallback"
  | "cached-engine4-fallback";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map(item => cleanText(item))
        .filter((item): item is string => Boolean(item))
    : [];

export const hasViatorNonZeroPrice = (value?: string): boolean => {
  if (!value) return false;
  const extracted = extractViatorPrice({ product: { priceFrom: value } });
  return Boolean(extracted && extracted.amount > 0);
};

export const mapEngine5ProductPayloadToEngine4ApiTour = (input: {
  productCode: string;
  payload: unknown;
}): Engine4ViatorApiTour | undefined => {
  const normalizedCode = input.productCode.trim().toUpperCase();
  const root = asRecord(input.payload);
  const product = asRecord(root?.product) ?? root;
  if (!product) {
    return undefined;
  }

  const title = cleanText(product.title);
  const sourceUrl = cleanText(product.productUrl) ?? cleanText(product.seoUrl);
  if (!title || !sourceUrl) {
    return undefined;
  }

  const commercialPrice = extractViatorPrice(product);
  const rating = extractViatorRating(product);
  const reviewCount = extractViatorReviewCount(product);
  const duration = extractViatorDuration(product);
  const meetingPoint = extractViatorMeetingPoint(product);
  const itinerary = extractViatorItinerary(product);
  const faqs = extractViatorFaqs(product);

  return {
    productCode: normalizedCode,
    title,
    sourceUrl,
    fromPrice: commercialPrice?.formattedPrice ?? (typeof commercialPrice?.amount === "number" ? String(commercialPrice.amount) : undefined),
    priceCurrency:
      cleanText(product.currencyCode) ??
      cleanText(product.priceCurrency) ??
      cleanText(asRecord(product.pricing)?.currency) ??
      cleanText(asRecord(asRecord(product.pricing)?.summary)?.currency),
    duration: duration?.value,
    startTime: cleanText(product.startTime),
    meetingPoint: meetingPoint?.value,
    cancellationPolicy: cleanText(product.cancellationPolicy),
    description:
      cleanText(product.shortDescription) ??
      cleanText(product.summary) ??
      cleanText(asRecord(product.description)?.text) ??
      cleanText(product.description),
    highlights: toStringArray(product.highlights),
    rating: rating?.value,
    reviewCount: reviewCount?.value,
    faqs: faqs?.value ?? [],
    itinerary: itinerary?.value ?? [],
    inclusions: toStringArray(product.inclusions),
    exclusions: toStringArray(product.exclusions),
    additionalInfo: toStringArray(product.additionalInfo),
    rawProductPayload: {
      ...product,
      _engine5BridgeDiagnostics: {
        commercialPriceFieldPath: commercialPrice?.fieldPath,
        ratingFieldPath: rating?.fieldPath,
        reviewCountFieldPath: reviewCount?.fieldPath,
        itineraryFieldPath: itinerary?.fieldPath,
      },
    },
  };
};

export const resolve421920P2BridgeApiTour = (input: {
  productCode: string;
  runtimeApiTour?: Engine4ViatorApiTour;
  runtimeSource?: "live-api" | "bundled-fallback";
  cachedFallbackApiTour?: Engine4ViatorApiTour;
}) => {
  const normalizedCode = input.productCode.trim().toUpperCase();
  const isStrictProduct = isEngine4StrictEngine5BridgeProductCode(normalizedCode);

  if (!isStrictProduct) {
    return {
      apiTour: input.cachedFallbackApiTour,
      runtimeSource: "cached-engine4-fallback" as Engine4BridgeRuntimeSource,
      isStrictProduct,
    };
  }

  if (input.runtimeApiTour && hasViatorNonZeroPrice(input.runtimeApiTour.fromPrice)) {
    return {
      apiTour: input.runtimeApiTour,
      runtimeSource:
        input.runtimeSource ?? ("live-api" as Engine4BridgeRuntimeSource),
      isStrictProduct,
    };
  }

  if (
    input.cachedFallbackApiTour &&
    hasViatorNonZeroPrice(input.cachedFallbackApiTour.fromPrice)
  ) {
    return {
      apiTour: input.cachedFallbackApiTour,
      runtimeSource: "cached-engine4-fallback" as Engine4BridgeRuntimeSource,
      isStrictProduct,
    };
  }

  return {
    apiTour: undefined,
    runtimeSource: "cached-engine4-fallback" as Engine4BridgeRuntimeSource,
    isStrictProduct,
  };
};
