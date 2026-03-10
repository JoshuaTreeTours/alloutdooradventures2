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
    "https://dynamic-media.tacdn.com/media/photo-o/2a/8f/15/7b/caption.jpg",
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
};

type PayloadImage = {
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

const resolveViatorCoverVariant = (
  apiTour: Engine4ViatorApiTour | undefined,
  rejectedCandidates: Engine4ViatorRejectedCandidate[]
): {
  candidates: string[];
  coverImagePresent: boolean;
  variantCount: number;
  selectedVariant?: PayloadVariant;
} => {
  const exactProductImages = apiTour?.exactProductImages;
  if (exactProductImages && exactProductImages.length > 0) {
    const parsed = exactProductImages
      .map(
        (image): PayloadImage => ({
          isCover: Boolean(image.isCover === true),
          variants: (image.variants ?? []).filter(variant =>
            isValidEngine4ViatorHeroCandidate(variant.url)
          ),
        })
      )
      .filter(item => item.variants.length > 0);

    const coverImagePresent = parsed.some(image => image.isCover);
    const orderedImages = parsed.sort(
      (a, b) => Number(b.isCover) - Number(a.isCover)
    );
    const selectedImage = orderedImages[0];
    const variantCount = selectedImage?.variants.length ?? 0;
    const selectedVariant = selectedImage
      ? [...selectedImage.variants].sort((a, b) => {
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

          return rankVariant(b.url) - rankVariant(a.url);
        })[0]
      : undefined;

    const candidates = selectedVariant ? [selectedVariant.url] : [];

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
    };
  }

  const parsed = images
    .map(entry => asRecord(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((image): PayloadImage => ({
      isCover: Boolean(image.isCover === true),
      variants: extractVariants(image).filter(variant =>
        isValidEngine4ViatorHeroCandidate(variant.url)
      ),
    }))
    .filter(item => item.variants.length > 0);

  const coverImagePresent = parsed.some(image => image.isCover);
  const orderedImages = parsed.sort((a, b) => Number(b.isCover) - Number(a.isCover));
  const selectedImage = orderedImages[0];
  const variantCount = selectedImage?.variants.length ?? 0;
  const selectedVariant = selectedImage
    ? [...selectedImage.variants].sort((a, b) => {
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

        return rankVariant(b.url) - rankVariant(a.url);
      })[0]
    : undefined;

  const candidates = selectedVariant ? [selectedVariant.url] : [];

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
