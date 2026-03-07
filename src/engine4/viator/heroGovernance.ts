import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";
import { resolveViatorPrimaryImageFromApiTour } from "./resolveViatorPrimaryImage";

const INVALID_SCHEMES = ["javascript:", "data:text", "data:html"];
const ALLOWED_HOSTS = [/^media\.tacdn\.com$/i, /^dynamic-media\.tacdn\.com$/i];

export const ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE: Record<
  string,
  string
> = {
  "335698P13":
    "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
};

export type Engine4ViatorHeroSelectionSource = "api" | "override" | "missing";

export type Engine4ViatorHeroDiagnostics = {
  productCode: string;
  apiImagePresent: boolean;
  overridePresent: boolean;
  overrideUsed: boolean;
  finalSelectedHeroUrl?: string;
  selectionSource: Engine4ViatorHeroSelectionSource;
  contaminationBlocked: boolean;
  resolutionStatus: "ok" | "missing";
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

export const resolveEngine4ViatorHeroWithDiagnostics = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
}): Engine4ViatorHeroDiagnostics => {
  const normalizedCode = input.productCode.trim().toUpperCase();
  const apiProductCode = input.apiTour?.productCode?.trim().toUpperCase();

  const apiProductMismatch = Boolean(
    apiProductCode && apiProductCode !== normalizedCode
  );

  const candidateFromApi = apiProductMismatch
    ? undefined
    : resolveViatorPrimaryImageFromApiTour(input.apiTour);
  const hasValidApiImage = isValidEngine4ViatorHeroCandidate(candidateFromApi);

  const overrideUrl =
    ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE[normalizedCode];
  const hasValidOverride = isValidEngine4ViatorHeroCandidate(overrideUrl);

  const selectedHero = hasValidApiImage
    ? candidateFromApi
    : hasValidOverride
      ? overrideUrl
      : undefined;

  const diagnostics: Engine4ViatorHeroDiagnostics = {
    productCode: normalizedCode,
    apiImagePresent: hasValidApiImage,
    overridePresent: hasValidOverride,
    overrideUsed: !hasValidApiImage && Boolean(selectedHero),
    finalSelectedHeroUrl: selectedHero,
    selectionSource: hasValidApiImage
      ? "api"
      : hasValidOverride
        ? "override"
        : "missing",
    contaminationBlocked: apiProductMismatch,
    resolutionStatus: selectedHero ? "ok" : "missing",
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
