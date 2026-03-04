import { engine4ViatorApiFallbackByProductCode } from "../data/viatorTours";
import type { Engine4ViatorApiTour } from "../types";

const VIATOR_BASE_URL = "https://api.viator.com/partner";

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

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
    const response = await fetch(
      `${VIATOR_BASE_URL}/products/${normalizedCode}`,
      {
        method: "GET",
        headers: buildHeaders(apiKey),
      }
    );

    if (!response.ok) {
      return engine4ViatorApiFallbackByProductCode[normalizedCode];
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const product =
      (payload.product as Record<string, unknown> | undefined) ?? payload;

    const primaryImageUrl = asImage(
      (product.images as Array<Record<string, unknown>> | undefined)?.[0]?.url
    );

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

    return {
      productCode: normalizedCode,
      title: cleanText(product.title) ?? cleanText(product.productTitle) ?? "",
      sourceUrl:
        cleanText(product.productUrl) ??
        cleanText(product.seoUrl) ??
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.sourceUrl ??
        "",
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
      overview:
        cleanText((product as Record<string, unknown>).description) ??
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.overview,
      highlights:
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.highlights,
      faqs: engine4ViatorApiFallbackByProductCode[normalizedCode]?.faqs,
      inclusions:
        engine4ViatorApiFallbackByProductCode[normalizedCode]?.inclusions,
    };
  } catch {
    return engine4ViatorApiFallbackByProductCode[normalizedCode];
  }
};
