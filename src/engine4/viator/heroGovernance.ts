import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";

const INVALID_SCHEMES = ["javascript:", "data:text", "data:html"];
const ALLOWED_HOSTS = [/^media\.tacdn\.com$/i, /^dynamic-media\.tacdn\.com$/i];

type CandidateSource = "api.images[]" | "override";

type RejectedReason =
  | "invalid_url"
  | "api_product_mismatch"
  | "images_payload_missing"
  | "images_payload_no_valid_candidates"
  | "not_from_images_payload"
  | "invalid_override";

const STRICT_IMAGES_PAYLOAD_ONLY_PRODUCT_CODES = new Set(["237571P2"]);

export type Engine4ViatorRejectedCandidate = {
  url?: string;
  source: CandidateSource;
  reason: RejectedReason;
};

export const ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE: Record<
  string,
  string
> = {
  "335698P13":
    "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
  "237571P2":
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
  "132218P209":
    "https://dynamic-media.tacdn.com/media/photo-o/2e/cc/c6/54/caption.jpg?w=1100&h=800&s=1",
};

export type Engine4ViatorHeroSelectionSource =
  | "api-images-payload"
  | "override"
  | "missing";

export type Engine4ViatorHeroDiagnostics = {
  productCode: string;
  apiImagePresent: boolean;
  overridePresent: boolean;
  overrideUsed: boolean;
  finalSelectedHeroUrl?: string;
  selectedHeroUrl?: string;
  selectionSource: Engine4ViatorHeroSelectionSource;
  contaminationBlocked: boolean;
  resolutionStatus: "ok" | "missing";
  rejectedCandidates: Engine4ViatorRejectedCandidate[];
  acceptedCandidateReason?: string;
  apiImagesPayloadCandidates: string[];
  coverImagePresent?: boolean;
  variantCount?: number;
  selectedVariantUrl?: string;
  selectedVariantWidth?: number;
  selectedImageIndex?: number;
  legacySelectedVariantUrl?: string;
  exactProductImagesInOrder: Array<{
    imageIndex: number;
    isCover: boolean;
    variantUrls: string[];
  }>;
};

const isTrackerPixel = (url: string) =>
  /(?:[?&](?:w|width)=1(?:&|$))|(?:[?&](?:h|height)=1(?:&|$))|\/1x1(?:\.|\/|$)/i.test(
    url
  );

const hasAllowedImagePath = (pathname: string) =>
  /\/(?:media\/photo-o|media\/attractions-splice-|media\/photo-l|media\/photo-s)\//i.test(
    pathname
  ) || /\.(?:jpg|jpeg|png|webp)$/i.test(pathname);

const hasAllowedImageHost = (host: string) =>
  ALLOWED_HOSTS.some(pattern => pattern.test(host));

export const isValidEngine4ViatorHeroCandidate = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (
    INVALID_SCHEMES.some(scheme => trimmed.toLowerCase().startsWith(scheme))
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    if (isTrackerPixel(trimmed)) {
      return false;
    }

    return (
      hasAllowedImageHost(parsed.hostname) &&
      hasAllowedImagePath(parsed.pathname)
    );
  } catch {
    return false;
  }
};

const shouldLogDiagnostics =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

type PayloadVariant = {
  url: string;
  width?: number;
  height?: number;
  variantIndex: number;
};

type PayloadImage = {
  imageIndex: number;
  isCover: boolean;
  variants: PayloadVariant[];
};

const extractVariants = (image: Record<string, unknown>): PayloadVariant[] => {
  const variants: PayloadVariant[] = [];

  const direct = asString(image.url);
  if (direct) {
    variants.push({
      url: direct,
      width: asNumber(image.width),
      height: asNumber(image.height),
    });
  }

  const imageVariants = Array.isArray(image.variants) ? image.variants : [];
  imageVariants.forEach(variant => {
    const v = asRecord(variant);
    const vUrl = asString(v?.url);
    if (vUrl) {
      variants.push({
        url: vUrl,
        width: asNumber(v?.width),
        height: asNumber(v?.height),
      });
    }
  });

  const variantObj = asRecord(image.variant);
  if (variantObj) {
    Object.values(variantObj).forEach(item => {
      const row = asRecord(item);
      const url = asString(row?.url ?? item);
      if (url) {
        variants.push({
          url,
          width: asNumber(row?.width),
          height: asNumber(row?.height),
        });
      }
    });
  }

  return variants;
};

const rankVariant = (url: string): number => {
  if (/caption\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(url)) {
    return 100;
  }
  if (/(?:\?|&)w=1100(?:&|$)/i.test(url)) {
    return 95;
  }
  return 60;
};

const toCanonicalVariantScore = (variant: PayloadVariant): number => {
  let score = 0;
  const landscape = (variant.width ?? 0) >= (variant.height ?? 0);
  if (landscape) {
    score += 20;
  }

  if (/caption\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(variant.url)) {
    score += 30;
  }

  if (/(?:\?|&)w=1100(?:&|$)/i.test(variant.url)) {
    score += 30;
  }

  if (variant.width && variant.height) {
    const aspect = variant.width / variant.height;
    score += Math.max(0, 20 - Math.abs(aspect - 1.375) * 100);
    score += Math.max(0, 20 - Math.abs(variant.width - 1100) / 40);
  }

  return score;
};

const compareCanonicalVariants = (a: PayloadVariant, b: PayloadVariant): number => {
  const scoreDelta = toCanonicalVariantScore(b) - toCanonicalVariantScore(a);
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  const widthTargetDelta =
    Math.abs((a.width ?? 0) - 1100) - Math.abs((b.width ?? 0) - 1100);
  if (widthTargetDelta !== 0) {
    return widthTargetDelta;
  }

  const rankDelta = rankVariant(b.url) - rankVariant(a.url);
  if (rankDelta !== 0) {
    return rankDelta;
  }

  return a.variantIndex - b.variantIndex;
};

const selectPreferredImage = (images: PayloadImage[]): PayloadImage | undefined => {
  if (images.length === 0) {
    return undefined;
  }

  const coverImages = images.filter(image => image.isCover);
  const candidates = coverImages.length > 0 ? coverImages : images;

  return [...candidates].sort((a, b) => {
    const aBest = [...a.variants].sort(compareCanonicalVariants)[0];
    const bBest = [...b.variants].sort(compareCanonicalVariants)[0];

    const qualityDelta =
      toCanonicalVariantScore(bBest) - toCanonicalVariantScore(aBest);
    if (qualityDelta !== 0) {
      return qualityDelta;
    }

    return a.imageIndex - b.imageIndex;
  })[0];
};

const resolveViatorCoverVariant = (
  apiTour: Engine4ViatorApiTour | undefined,
  rejectedCandidates: Engine4ViatorRejectedCandidate[]
): {
  candidates: string[];
  coverImagePresent: boolean;
  variantCount: number;
  selectedVariant?: PayloadVariant;
  selectedImageIndex?: number;
  legacySelectedVariantUrl?: string;
  exactProductImagesInOrder: Array<{
    imageIndex: number;
    isCover: boolean;
    variantUrls: string[];
  }>;
} => {
  const exactProductImages = apiTour?.exactProductImages;
  if (exactProductImages && exactProductImages.length > 0) {
    const parsed = exactProductImages
      .map((image, imageIndex) => ({ image, imageIndex }))
      .map(
        ({ image, imageIndex }): PayloadImage => ({
          imageIndex,
          isCover: Boolean(image.isCover === true),
          variants: (image.variants ?? [])
            .map((variant, variantIndex) => ({ ...variant, variantIndex }))
            .filter(variant =>
            isValidEngine4ViatorHeroCandidate(variant.url)
            ),
        })
      )
      .filter(item => item.variants.length > 0);

    const coverImagePresent = parsed.some(image => image.isCover);
    const selectedImage = selectPreferredImage(parsed);
    const variantCount = selectedImage?.variants.length ?? 0;
    const selectedVariant = selectedImage
      ? [...selectedImage.variants].sort(compareCanonicalVariants)[0]
      : undefined;
    const legacySelectedVariantUrl = selectedImage
      ? [...selectedImage.variants].sort((a, b) => {
          const widthDelta = (b.width ?? 0) - (a.width ?? 0);
          if (widthDelta !== 0) {
            return widthDelta;
          }
          return rankVariant(b.url) - rankVariant(a.url);
        })[0]?.url
      : undefined;

    const candidates = selectedVariant ? [selectedVariant.url] : [];
    const exactProductImagesInOrder = parsed
      .sort((a, b) => a.imageIndex - b.imageIndex)
      .map(image => ({
        imageIndex: image.imageIndex,
        isCover: image.isCover,
        variantUrls: image.variants.map(variant => variant.url),
      }));

    if (candidates.length === 0) {
      rejectedCandidates.push({
        source: "api.images[]",
        reason: "images_payload_no_valid_candidates",
      });
    }

    return {
      candidates: Array.from(new Set(candidates)),
      coverImagePresent,
      variantCount,
      selectedVariant,
      selectedImageIndex: selectedImage?.imageIndex,
      legacySelectedVariantUrl,
      exactProductImagesInOrder,
    };
  }

  const raw = asRecord(apiTour?.rawProductPayload);
  const images = Array.isArray(raw?.images) ? raw?.images : undefined;

  if (!images || images.length === 0) {
    rejectedCandidates.push({
      source: "api.images[]",
      reason: "images_payload_missing",
    });
    return {
      candidates: [],
      coverImagePresent: false,
      variantCount: 0,
      exactProductImagesInOrder: [],
    };
  }

  const parsed = images
    .map((entry, imageIndex) => ({ entry: asRecord(entry), imageIndex }))
    .filter(
      (row): row is { entry: Record<string, unknown>; imageIndex: number } =>
        Boolean(row.entry)
    )
    .map(({ entry, imageIndex }) => ({
      ...entry,
      imageIndex,
    }))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((image): PayloadImage => ({
      imageIndex: asNumber((image as Record<string, unknown>).imageIndex) ?? 0,
      isCover: Boolean(image.isCover === true),
      variants: extractVariants(image)
        .map((variant, variantIndex) => ({ ...variant, variantIndex }))
        .filter(variant =>
        isValidEngine4ViatorHeroCandidate(variant.url)
        ),
    }))
    .filter(item => item.variants.length > 0);

  const coverImagePresent = parsed.some(image => image.isCover);
  const selectedImage = selectPreferredImage(parsed);
  const variantCount = selectedImage?.variants.length ?? 0;
  const selectedVariant = selectedImage
    ? [...selectedImage.variants].sort(compareCanonicalVariants)[0]
    : undefined;
  const legacySelectedVariantUrl = selectedImage
    ? [...selectedImage.variants].sort((a, b) => {
        const widthDelta = (b.width ?? 0) - (a.width ?? 0);
        if (widthDelta !== 0) {
          return widthDelta;
        }
        return rankVariant(b.url) - rankVariant(a.url);
      })[0]?.url
    : undefined;

  const candidates = selectedVariant ? [selectedVariant.url] : [];
  const exactProductImagesInOrder = parsed
    .sort((a, b) => a.imageIndex - b.imageIndex)
    .map(image => ({
      imageIndex: image.imageIndex,
      isCover: image.isCover,
      variantUrls: image.variants.map(variant => variant.url),
    }));

  if (candidates.length === 0) {
    rejectedCandidates.push({
      source: "api.images[]",
      reason: "images_payload_no_valid_candidates",
    });
  }

  return {
    candidates: Array.from(new Set(candidates)),
    coverImagePresent,
    variantCount,
    selectedVariant,
    selectedImageIndex: selectedImage?.imageIndex,
    legacySelectedVariantUrl,
    exactProductImagesInOrder,
  };
};

const extractLegacyMappedCandidates = (
  apiTour: Engine4ViatorApiTour | undefined
): string[] => {
  if (!apiTour) {
    return [];
  }

  return Array.from(
    new Set(
      [
        apiTour.primaryImageUrl,
        ...(apiTour.galleryImages ?? []),
        apiTour.sourceDerivedImageUrl,
      ].filter((url): url is string => isValidEngine4ViatorHeroCandidate(url))
    )
  );
};

const collectLegacyCandidatesForDiagnostics = (
  apiTour: Engine4ViatorApiTour | undefined,
  rejectedCandidates: Engine4ViatorRejectedCandidate[]
) => {
  extractLegacyMappedCandidates(apiTour).forEach(url => {
    rejectedCandidates.push({
      url,
      source: "api.images[]",
      reason: "not_from_images_payload",
    });
  });
};

export const resolveEngine4ViatorHeroWithDiagnostics = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
}): Engine4ViatorHeroDiagnostics => {
  const normalizedCode = input.productCode.trim().toUpperCase();
  const apiProductCode = input.apiTour?.productCode?.trim().toUpperCase();
  const rejectedCandidates: Engine4ViatorRejectedCandidate[] = [];

  const apiProductMismatch = Boolean(
    apiProductCode && apiProductCode !== normalizedCode
  );

  const strictImagesPayloadOnly =
    STRICT_IMAGES_PAYLOAD_ONLY_PRODUCT_CODES.has(normalizedCode);

  const payloadSelection = resolveViatorCoverVariant(
    input.apiTour,
    rejectedCandidates
  );
  const imagesPayloadCandidates = payloadSelection.candidates;

  let trustedApiCandidate: string | undefined;

  if (apiProductMismatch) {
    imagesPayloadCandidates.forEach(url => {
      rejectedCandidates.push({
        url,
        source: "api.images[]",
        reason: "api_product_mismatch",
      });
    });
  } else {
    trustedApiCandidate = imagesPayloadCandidates.find(url =>
      isValidEngine4ViatorHeroCandidate(url)
    );

    if (strictImagesPayloadOnly) {
      collectLegacyCandidatesForDiagnostics(input.apiTour, rejectedCandidates);
    }

    if (!trustedApiCandidate && !strictImagesPayloadOnly) {
      trustedApiCandidate = extractLegacyMappedCandidates(input.apiTour)[0];
    }
  }

  const hasValidApiImage = isValidEngine4ViatorHeroCandidate(trustedApiCandidate);

  const overrideUrl =
    ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE[normalizedCode];
  const hasValidOverride = isValidEngine4ViatorHeroCandidate(overrideUrl);

  if (overrideUrl && !hasValidOverride) {
    rejectedCandidates.push({
      url: overrideUrl,
      source: "override",
      reason: "invalid_override",
    });
  }

  const selectedHero = hasValidApiImage
    ? trustedApiCandidate
    : hasValidOverride
      ? overrideUrl
      : undefined;

  const diagnostics: Engine4ViatorHeroDiagnostics = {
    productCode: normalizedCode,
    apiImagePresent: hasValidApiImage,
    overridePresent: hasValidOverride,
    overrideUsed: !hasValidApiImage && Boolean(selectedHero),
    finalSelectedHeroUrl: selectedHero,
    selectedHeroUrl: selectedHero,
    selectionSource: hasValidApiImage
      ? "api-images-payload"
      : hasValidOverride
        ? "override"
        : "missing",
    contaminationBlocked: apiProductMismatch,
    resolutionStatus: selectedHero ? "ok" : "missing",
    rejectedCandidates,
    acceptedCandidateReason: hasValidApiImage
      ? imagesPayloadCandidates.includes(trustedApiCandidate ?? "")
        ? "Accepted API image because it comes from this product's images[] payload (preferring cover image variants)."
        : "Accepted API image from exact-product mapped API fields while no images[] payload candidate was available."
      : hasValidOverride
        ? "Accepted locked per-product override because no safe exact-product images[] candidate was available."
        : undefined,
    apiImagesPayloadCandidates: imagesPayloadCandidates,
    coverImagePresent: payloadSelection.coverImagePresent,
    variantCount: payloadSelection.variantCount,
    selectedVariantUrl: payloadSelection.selectedVariant?.url,
    selectedVariantWidth: payloadSelection.selectedVariant?.width,
    selectedImageIndex: payloadSelection.selectedImageIndex,
    legacySelectedVariantUrl: payloadSelection.legacySelectedVariantUrl,
    exactProductImagesInOrder: payloadSelection.exactProductImagesInOrder,
  };

  if (shouldLogDiagnostics) {
    console.info(`[engine4-hero-governance] ${JSON.stringify(diagnostics)}`);
  }

  return diagnostics;
};

export const resolveEngine4ViatorHero = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
}): string => {
  const diagnostics = resolveEngine4ViatorHeroWithDiagnostics(input);
  if (diagnostics.finalSelectedHeroUrl) {
    return diagnostics.finalSelectedHeroUrl;
  }

  throw new Error(
    `[engine4-hero-governance] missing canonical hero for product ${diagnostics.productCode}`
  );
};

export const buildEngine4ViatorMissingHeroReport = (input: {
  tours: readonly Engine4ViatorTourRecord[];
  apiTourByProductCode: Record<string, Engine4ViatorApiTour | undefined>;
}) =>
  input.tours.map(record => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: record.productCode,
      apiTour: input.apiTourByProductCode[record.productCode],
    });

    return {
      productCode: record.productCode,
      title:
        input.apiTourByProductCode[record.productCode]?.title ??
        `Engine4 Viator Tour ${record.productCode}`,
      selectedSource: diagnostics.selectionSource,
      finalHero: diagnostics.finalSelectedHeroUrl,
      needsManualOverride: diagnostics.selectionSource === "missing",
    };
  });
