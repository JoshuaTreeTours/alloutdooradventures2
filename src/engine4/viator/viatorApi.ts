import { fetchViator } from "../../../api/viator/client";
import { resolveViatorApiKey } from "../../../api/viator/runtimeConfig";
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

type ExactProductVariant = { url: string; width?: number; height?: number };
type ExactProductImage = { isCover: boolean; variants: ExactProductVariant[] };

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const extractImageVariants = (image: Record<string, unknown>) => {
  const variants: ExactProductVariant[] = [];

  const directUrl = asImage(image.url);
  if (directUrl) {
    variants.push({
      url: directUrl,
      width: asNumber(image.width),
      height: asNumber(image.height),
    });
  }

  const rawVariants = Array.isArray(image.variants) ? image.variants : [];
  rawVariants.forEach(entry => {
    const variant = asRecord(entry);
    const url = asImage(variant?.url);
    if (!url) {
      return;
    }
    variants.push({
      url,
      width: asNumber(variant?.width),
      height: asNumber(variant?.height),
    });
  });

  return Array.from(new Map(variants.map(item => [item.url, item])).values());
};

const rankVariant = (variant: ExactProductVariant) => {
  if (/caption\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(variant.url)) {
    return 100;
  }
  if (/(?:\?|&)w=1100(?:&|$)/i.test(variant.url)) {
    return 95;
  }
  return 60;
};

const sortVariants = (variants: ExactProductVariant[]) =>
  [...variants].sort((a, b) => {
    const aLandscape = (a.width ?? 0) >= (a.height ?? 0);
    const bLandscape = (b.width ?? 0) >= (b.height ?? 0);
    const aPreferred = aLandscape && (a.width ?? 0) >= 1100;
    const bPreferred = bLandscape && (b.width ?? 0) >= 1100;
    if (aPreferred !== bPreferred) {
      return Number(bPreferred) - Number(aPreferred);
    }

    const widthDelta = (b.width ?? 0) - (a.width ?? 0);
    if (widthDelta !== 0) {
      return widthDelta;
    }

    return rankVariant(b) - rankVariant(a);
  });

const extractExactProductImages = (
  product: Record<string, unknown>
): ExactProductImage[] => {
  const images = Array.isArray(product.images) ? product.images : [];

  return images
    .map(entry => asRecord(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map(image => ({
      isCover: image.isCover === true,
      variants: sortVariants(extractImageVariants(image)),
    }))
    .filter(image => image.variants.length > 0)
    .sort((a, b) => Number(b.isCover) - Number(a.isCover));
};

const joinTextArray = (value: unknown): string | undefined => {
  const parts = toStringArray(value);
  return parts.length > 0 ? parts.join(" ") : undefined;
};

type DescriptionSource = NonNullable<
  Engine4ViatorApiTour["provenance"]
>["descriptionSource"];

const logApiFetch = (message: string) => {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    console.info(message);
  }
};

const shouldThrowOnApiFailure = () =>
  process.env.ENGINE4_VIATOR_STRICT_API === "true";

export const getEngine4ViatorTourData = async (
  productCode: string
): Promise<Engine4ViatorApiTour | undefined> => {
  const normalizedCode = productCode.trim().toUpperCase();
  if (!normalizedCode) {
    return undefined;
  }

  const fallbackTour = engine4ViatorApiFallbackByProductCode[normalizedCode];
  const apiKey = resolveViatorApiKey();
  if (!apiKey) {
    logApiFetch(
      `[engine4-viator-api] product=${normalizedCode} attempted=false succeeded=false fallbackUsed=true reason=no_api_key`
    );
    return fallbackTour
      ? {
          ...fallbackTour,
          provenance: {
            apiFetchAttempted: false,
            apiFetchSucceeded: false,
            fallbackUsed: true,
            heroImageSource: fallbackTour.primaryImageUrl ? "fallback" : "none",
            descriptionSource: fallbackTour.description ? "fallback" : "none",
          },
        }
      : undefined;
  }

  try {
    logApiFetch(
      `[engine4-viator-api] product=${normalizedCode} attempted=true status=starting`
    );
    const payload = await fetchViator<Record<string, unknown>>(
      apiKey,
      `/products/${normalizedCode}`,
      {
        method: "GET",
      }
    );
    const product =
      (payload.product as Record<string, unknown> | undefined) ?? payload;

    const exactProductImages = extractExactProductImages(product);
    const exactProductImageUrls = exactProductImages
      .map(image => image.variants[0]?.url)
      .filter((url): url is string => Boolean(url));

    const primaryImageUrl =
      exactProductImageUrls[0] ?? asImage(resolveViatorPrimaryImage(product));

    const galleryImages = Array.from(
      new Set([
        ...exactProductImageUrls,
        ...(
          (product.images as Array<Record<string, unknown>> | undefined) ?? []
        )
          .map(image => asImage(image.url))
          .filter((image): image is string => Boolean(image)),
      ])
    );

    const itinerary = extractItinerary(product);

    const shortDescription = cleanText(product.shortDescription);
    const summaryDescription = cleanText(product.summary);
    const descriptionText = cleanText(
      (product.description as Record<string, unknown> | undefined)?.text
    );
    const description = shortDescription ?? summaryDescription ?? descriptionText;

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

    const descriptionSource: DescriptionSource =
      shortDescription
        ? "api.shortDescription"
        : summaryDescription
          ? "api.summary"
          : descriptionText
            ? "api.description.text"
            : cleanText(product.description)
              ? "api.description"
              : fallbackTour?.description
                ? "fallback"
                : "none";

    logApiFetch(
      `[engine4-viator-api] product=${normalizedCode} attempted=true succeeded=true fallbackUsed=false heroImageSource=${primaryImageUrl ? "api" : "none"} descriptionSource=${descriptionSource}`
    );

    return {
      productCode: normalizedCode,
      exactProductImages,
      title: cleanText(product.title) ?? cleanText(product.productTitle) ?? "",
      sourceUrl:
        cleanText(product.productUrl) ??
        cleanText(product.seoUrl) ??
        fallbackTour?.sourceUrl ??
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
      sourceDerivedImageUrl: fallbackTour?.sourceDerivedImageUrl,
      meetingPoint:
        cleanText((product as Record<string, unknown>).meetingPoint) ??
        fallbackTour?.meetingPoint,
      cancellationPolicy:
        cleanText((product as Record<string, unknown>).cancellationPolicy) ??
        fallbackTour?.cancellationPolicy,
      inclusions:
        toStringArray((product as Record<string, unknown>).inclusions).length >
        0
          ? toStringArray((product as Record<string, unknown>).inclusions)
          : fallbackTour?.inclusions,
      exclusions: toStringArray(
        (product as Record<string, unknown>).exclusions
      ),
      additionalInfo: toStringArray(
        (product as Record<string, unknown>).additionalInfo
      ),
      overview:
        cleanText((product as Record<string, unknown>).description) ??
        fallbackTour?.overview,
      highlights: fallbackTour?.highlights,
      faqs: fallbackTour?.faqs,
      rawProductPayload: product,
      provenance: {
        apiFetchAttempted: true,
        apiFetchSucceeded: true,
        fallbackUsed: false,
        heroImageSource: primaryImageUrl ? "api" : "none",
        descriptionSource,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[engine4-viator-api] product=${normalizedCode} attempted=true succeeded=false fallbackUsed=true error=${message}`
    );
    if (shouldThrowOnApiFailure()) {
      throw new Error(
        `Engine4 Viator API fetch failed for ${normalizedCode}: ${message}`
      );
    }

    return fallbackTour
      ? {
          ...fallbackTour,
          provenance: {
            apiFetchAttempted: true,
            apiFetchSucceeded: false,
            fallbackUsed: true,
            heroImageSource: fallbackTour.primaryImageUrl ? "fallback" : "none",
            descriptionSource: fallbackTour.description ? "fallback" : "none",
          },
        }
      : undefined;
  }
};
