import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";

const INVALID_SCHEMES = ["javascript:", "data:text", "data:html"];
const ALLOWED_HOSTS = [/^media\.tacdn\.com$/i, /^dynamic-media\.tacdn\.com$/i];
const STRICT_PROVENANCE_PRODUCT_CODES = new Set(["237571P2"]);

type CandidateSource =
  | "api.primaryImageUrl"
  | "api.galleryImages"
  | "api.sourceDerivedImageUrl"
  | "override";

export type Engine4ViatorRejectedCandidate = {
  url?: string;
  source: CandidateSource;
  reason:
    | "invalid_url"
    | "api_product_mismatch"
    | "missing_raw_product_payload_provenance"
    | "not_present_in_exact_product_payload"
    | "invalid_override";
};

export const ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE: Record<
  string,
  string
> = {
  "335698P13":
    "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
  "237571P2":
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
};

export type Engine4ViatorHeroSelectionSource = "api" | "override" | "missing";

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

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const collectRawPayloadImageUrls = (value: unknown, bag: Set<string>) => {
  const maybeString = typeof value === "string" ? value.trim() : undefined;
  if (maybeString) {
    if (isValidEngine4ViatorHeroCandidate(maybeString)) {
      bag.add(maybeString);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(entry => collectRawPayloadImageUrls(entry, bag));
    return;
  }

  const record = asRecord(value);
  if (!record) {
    return;
  }

  Object.values(record).forEach(entry => {
    collectRawPayloadImageUrls(entry, bag);
  });
};

const shouldLogDiagnostics =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const getApiCandidates = (apiTour: Engine4ViatorApiTour | undefined) => {
  if (!apiTour) {
    return [] as Array<{ url?: string; source: CandidateSource }>;
  }

  return [
    { url: apiTour.primaryImageUrl, source: "api.primaryImageUrl" as const },
    ...(apiTour.galleryImages ?? []).map(url => ({
      url,
      source: "api.galleryImages" as const,
    })),
    {
      url: apiTour.sourceDerivedImageUrl,
      source: "api.sourceDerivedImageUrl" as const,
    },
  ];
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

  const requiresStrictProvenance =
    STRICT_PROVENANCE_PRODUCT_CODES.has(normalizedCode);

  const payloadImageUrls = new Set<string>();
  if (input.apiTour?.rawProductPayload) {
    collectRawPayloadImageUrls(input.apiTour.rawProductPayload, payloadImageUrls);
  }

  let trustedApiCandidate: string | undefined;
  const apiCandidates = getApiCandidates(input.apiTour);
  for (const candidate of apiCandidates) {
    if (!isValidEngine4ViatorHeroCandidate(candidate.url)) {
      if (candidate.url) {
        rejectedCandidates.push({
          url: candidate.url,
          source: candidate.source,
          reason: "invalid_url",
        });
      }
      continue;
    }

    if (apiProductMismatch) {
      rejectedCandidates.push({
        url: candidate.url,
        source: candidate.source,
        reason: "api_product_mismatch",
      });
      continue;
    }

    if (requiresStrictProvenance && !input.apiTour?.rawProductPayload) {
      rejectedCandidates.push({
        url: candidate.url,
        source: candidate.source,
        reason: "missing_raw_product_payload_provenance",
      });
      continue;
    }

    if (
      requiresStrictProvenance &&
      input.apiTour?.rawProductPayload &&
      !payloadImageUrls.has(candidate.url)
    ) {
      rejectedCandidates.push({
        url: candidate.url,
        source: candidate.source,
        reason: "not_present_in_exact_product_payload",
      });
      continue;
    }

    trustedApiCandidate = candidate.url;
    break;
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
      ? "api"
      : hasValidOverride
        ? "override"
        : "missing",
    contaminationBlocked: apiProductMismatch,
    resolutionStatus: selectedHero ? "ok" : "missing",
    rejectedCandidates,
    acceptedCandidateReason: hasValidApiImage
      ? requiresStrictProvenance
        ? "Accepted API image because it is valid, exact-product, and present in this product raw payload."
        : "Accepted API image because it is valid and exact-product."
      : hasValidOverride
        ? "Accepted locked per-product override because API candidates were rejected or missing."
        : undefined,
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
