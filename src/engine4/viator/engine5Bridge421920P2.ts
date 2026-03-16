import type { Engine4ViatorApiTour } from "../types";

export const ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE = "421920P2";

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

const toFaqArray = (
  value: unknown
): Array<{ question: string; answer: string }> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const row = asRecord(item);
      const question = cleanText(row?.question);
      const answer = cleanText(row?.answer);
      if (!question || !answer) {
        return undefined;
      }
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
};

const toItinerary = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as Array<{ title: string; description?: string; duration?: string }>;
  }

  return value
    .map(item => {
      const row = asRecord(item);
      const title = cleanText(row?.title);
      if (!title) {
        return undefined;
      }
      return {
        title,
        description: cleanText(row?.description),
        duration: cleanText(row?.duration),
      };
    })
    .filter(
      (
        item
      ): item is { title: string; description?: string; duration?: string } =>
        Boolean(item)
    );
};

const parsePriceAmount = (value?: string): number | undefined => {
  const raw = cleanText(value);
  if (!raw) {
    return undefined;
  }

  const numeric = Number(raw.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const hasViatorNonZeroPrice = (value?: string): boolean => {
  const amount = parsePriceAmount(value);
  return typeof amount === "number" && amount > 0;
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

  const fromPrice = cleanText(product.priceFrom) ?? cleanText(product.fromPrice);

  return {
    productCode: normalizedCode,
    title,
    sourceUrl,
    fromPrice,
    priceCurrency: cleanText(product.currencyCode) ?? cleanText(product.priceCurrency),
    duration: cleanText(product.duration) ?? cleanText(product.durationText),
    startTime: cleanText(product.startTime),
    meetingPoint: cleanText(product.meetingPoint),
    cancellationPolicy: cleanText(product.cancellationPolicy),
    description:
      cleanText(product.shortDescription) ??
      cleanText(product.summary) ??
      cleanText(asRecord(product.description)?.text) ??
      cleanText(product.description),
    highlights: toStringArray(product.highlights),
    faqs: toFaqArray(product.faqs),
    itinerary: toItinerary(product.itineraryItems ?? product.itinerary),
    inclusions: toStringArray(product.inclusions),
    exclusions: toStringArray(product.exclusions),
    additionalInfo: toStringArray(product.additionalInfo),
    rawProductPayload: product,
  };
};

export const resolve421920P2BridgeApiTour = (input: {
  productCode: string;
  runtimeApiTour?: Engine4ViatorApiTour;
  runtimeSource?: "live-api" | "bundled-fallback";
  cachedFallbackApiTour?: Engine4ViatorApiTour;
}) => {
  const normalizedCode = input.productCode.trim().toUpperCase();
  const isStrictProduct =
    normalizedCode === ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE;

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
