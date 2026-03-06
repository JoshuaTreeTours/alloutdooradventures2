import { fetchViator } from "../../../api/viator/client";
import { engine4ViatorApiFallbackByProductCode } from "../data/viatorTours";
import type { Engine4ViatorApiTour } from "../types";
import { resolveViatorPrimaryImage } from "./resolveViatorPrimaryImage";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const asImage = (value: unknown): string | undefined => {
  const url = cleanText(value);
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item));
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const extractItinerary = (product: Record<string, unknown>) => {
  const rawItinerary =
    (product.itineraryItems as unknown[]) ??
    (product.itinerary as unknown[]) ??
    (asRecord(product["whatToExpect"])?.items as unknown[]);

  if (!Array.isArray(rawItinerary)) {
    return undefined;
  }

  const itinerary = rawItinerary
    .map(item => {
      const row = asRecord(item);
      if (!row) {
        return undefined;
      }

      const title =
        cleanText(row.title) ??
        cleanText(row.name) ??
        cleanText(row.label) ??
        cleanText(row.point);
      const description =
        cleanText(row.description) ??
        cleanText(row.summary) ??
        cleanText(row.details);
      const duration = cleanText(row.duration) ?? cleanText(row.durationText);

      if (!title && !description && !duration) {
        return undefined;
      }

      return {
        title: title ?? "Tour stop",
        description,
        duration,
      };
    })
    .filter(
      (
        item
      ): item is { title: string; description?: string; duration?: string } =>
        Boolean(item)
    );

  return itinerary.length > 0 ? itinerary : undefined;
};

const joinTextArray = (value: unknown): string | undefined => {
  const parts = toStringArray(value);
  return parts.length > 0 ? parts.join(" ") : undefined;
};

export const getEngine4ViatorTourData = async (
  productCode: string
): Promise<Engine4ViatorApiTour | undefined> => {
  const normalizedCode = productCode.trim().toUpperCase();
  if (!normalizedCode) {
    return undefined;
  }

  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) {
    return engine4ViatorApiFallbackByProductCode[normalizedCode];
  }

  try {
    const payload = await fetchViator<Record<string, unknown>>(
      apiKey,
      `/products/${normalizedCode}`,
      {
        method: "GET",
      }
    );
    const product =
      (payload.product as Record<string, unknown> | undefined) ?? payload;

    const primaryImageUrl = asImage(resolveViatorPrimaryImage(product));

    const galleryImages = (
      (product.images as Array<Record<string, unknown>> | undefined) ?? []
    )
      .map(image =>
        asImage(
          image.url ??
            (image.variants as Array<Record<string, unknown>> | undefined)?.[0]
              ?.url
        )
      )
      .filter((image): image is string => Boolean(image));

    const itinerary = extractItinerary(product);
    const description =
      cleanText(product.shortDescription) ??
      cleanText(product.summary) ??
      cleanText(
        (product.description as Record<string, unknown> | undefined)?.text
      );
    const descriptionLong =
      cleanText(product.description) ??
      cleanText(
        (product.description as Record<string, unknown> | undefined)?.full
      ) ??
      cleanText(
        (product.fullDescription as Record<string, unknown> | undefined)?.text
      );

    const whatToExpect =
      cleanText(product.whatToExpect) ??
      cleanText((product as Record<string, unknown>).whatToExpectText) ??
      joinTextArray((product as Record<string, unknown>).whatToExpectItems);

    return {
      productCode: normalizedCode,
      title: cleanText(product.title) ?? cleanText(product.productTitle) ?? "",
      sourceUrl:
        cleanText(product.productUrl) ??
        cleanText(product.seoUrl) ??
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.sourceUrl ??
        "",
      description,
      descriptionLong,
      itinerary,
      whatToExpect,
      duration:
        cleanText(product.duration) ??
        cleanText((product as Record<string, unknown>).durationText),
      startTime:
        cleanText((product as Record<string, unknown>).startTime) ??
        cleanText((product as Record<string, unknown>).startTimes),
      fromPrice:
        cleanText((product as Record<string, unknown>).priceFrom) ??
        cleanText((product as Record<string, unknown>).fromPrice),
      priceCurrency: cleanText(
        (product as Record<string, unknown>).currencyCode
      ),
      rating:
        typeof (product as Record<string, unknown>).rating === "number"
          ? ((product as Record<string, unknown>).rating as number)
          : undefined,
      reviewCount:
        typeof (product as Record<string, unknown>).reviewCount === "number"
          ? ((product as Record<string, unknown>).reviewCount as number)
          : undefined,
      primaryImageUrl,
      galleryImages,
      sourceDerivedImageUrl:
        engine4ViatorApiFallbackByProductCode[normalizedCode]
          ?.sourceDerivedImageUrl,
      meetingPoint:
        cleanText((product as Record<string, unknown>).meetingPoint) ??
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.meetingPoint,
      cancellationPolicy:
        cleanText((product as Record<string, unknown>).cancellationPolicy) ??
        engine4ViatorApiFallbackByProductCode[normalizedCode]
          ?.cancellationPolicy,
      inclusions:
        toStringArray((product as Record<string, unknown>).inclusions).length >
        0
          ? toStringArray((product as Record<string, unknown>).inclusions)
          : engine4ViatorApiFallbackByProductCode[normalizedCode]?.inclusions,
      exclusions: toStringArray(
        (product as Record<string, unknown>).exclusions
      ),
      additionalInfo: toStringArray(
        (product as Record<string, unknown>).additionalInfo
      ),
      overview:
        cleanText((product as Record<string, unknown>).description) ??
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.overview,
      highlights:
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.highlights,
      faqs: engine4ViatorApiFallbackByProductCode[normalizedCode]?.faqs,
      rawProductPayload: product,
    };
  } catch {
    return engine4ViatorApiFallbackByProductCode[normalizedCode];
  }
};
