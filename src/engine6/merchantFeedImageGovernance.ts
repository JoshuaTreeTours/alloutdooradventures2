import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import type { MerchantFeedGovernanceTier } from "../../api/engine6/merchantFeedBaselineGovernance";
import {
  ENGINE6_GLOBAL_FALLBACK_HERO_URL,
  getEngine6CuratedProductHeroCandidates,
  isDisplayableEngine6HeroUrl,
  parseEngine6StateCityFromCanonicalPath,
  resolveEngine6CanonicalCityHero,
} from "./displayHero";
import type { Engine6Tour } from "./types";

const MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 10_000;

const IMAGE_FIELD_NAMES = new Set([
  "url",
  "imageUrl",
  "image",
  "photo",
  "photoUrl",
  "thumbnail",
  "thumbnailUrl",
  "src",
]);

const POI_PATH_PATTERN =
  /(?:pointOfInterest|pointOfInterestLocation|locations)(?:\.|$|\[)/i;

export type Engine6MerchantFeedImageValidationReason =
  | "not-displayable"
  | "http-error"
  | "empty-response"
  | "not-image-content-type"
  | "invalid-redirect"
  | "invalid-redirect-target"
  | "too-many-redirects"
  | "timeout"
  | "network-error";

export type Engine6MerchantFeedImageValidationResult = {
  valid: boolean;
  reason?: Engine6MerchantFeedImageValidationReason;
  status?: number;
  contentType?: string;
  message?: string;
};

export type MerchantFeedImageGovernanceRow = {
  id: string;
  image_link: string;
};

export type MerchantFeedImageGovernanceFailure = {
  productCode: string;
  attemptedUrls: string[];
  lastReason?: Engine6MerchantFeedImageValidationReason;
  lastStatus?: number;
};

export type MerchantFeedImageGovernanceReport = {
  imagesValidated: number;
  automaticallyRepaired: number;
  requiringFallback: number;
  /** Blocking failures for newly added or modified Engine6 scope only. */
  unrecoverableFailures: number;
  informationalLegacyInvalidImages: number;
  informationalLegacyProductCodes: string[];
  invalidUrlsReported: Array<{
    productCode: string;
    invalidUrl: string;
    reason: Engine6MerchantFeedImageValidationReason;
    status?: number;
  }>;
  failures: MerchantFeedImageGovernanceFailure[];
};

export type ApplyMerchantFeedImageGovernanceResult<
  TRow extends MerchantFeedImageGovernanceRow,
> = {
  pass: boolean;
  rows: TRow[];
  report: MerchantFeedImageGovernanceReport;
};

export type ValidateEngine6MerchantFeedImageUrl = (
  url: string
) => Promise<Engine6MerchantFeedImageValidationResult>;

export const requiresStrictMerchantFeedImageGovernance = (args: {
  productCode: string;
  hasEngine6Tour: boolean;
  governanceByProductCode?: Map<string, MerchantFeedGovernanceTier>;
  branchModifiedProductCodes?: ReadonlySet<string>;
}): boolean => {
  if (!args.hasEngine6Tour) {
    return false;
  }

  const normalizedProductCode = args.productCode.trim().toUpperCase();
  if (args.branchModifiedProductCodes?.has(normalizedProductCode)) {
    return true;
  }

  const tier =
    args.governanceByProductCode?.get(normalizedProductCode) ?? "new-product";

  return tier === "new-product" || tier === "modified-commercial";
};

const recordUnrecoverableImageFailure = (
  report: MerchantFeedImageGovernanceReport,
  failure: MerchantFeedImageGovernanceFailure,
  requiresStrictScope: boolean
) => {
  if (requiresStrictScope) {
    report.unrecoverableFailures += 1;
    report.failures.push(failure);
    return;
  }

  report.informationalLegacyInvalidImages += 1;
  if (!report.informationalLegacyProductCodes.includes(failure.productCode)) {
    report.informationalLegacyProductCodes.push(failure.productCode);
  }
};

const isAcceptedImageContentType = (contentType: string) => {
  if (contentType.startsWith("image/")) {
    return true;
  }

  return contentType === "application/octet-stream";
};

const looksLikeImageResourceUrl = (value: string) =>
  /\.(?:jpe?g|png|webp|avif|gif)(?:$|[?#])/i.test(value) ||
  /\/media\//i.test(value) ||
  /tacdn\.com/i.test(value) ||
  /tripadvisor\.com/i.test(value);

export const loadBundledEngine6ExactProductPayload = (
  productCode: string
): unknown | null => {
  const trimmed = productCode.trim();
  const candidates = [
    path.join(
      process.cwd(),
      "data",
      "engine6",
      "viator",
      `${trimmed}.exact-product.json`
    ),
    path.join(
      process.cwd(),
      "data",
      "engine6",
      "viator",
      `${trimmed.toUpperCase()}.exact-product.json`
    ),
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    return JSON.parse(readFileSync(filePath, "utf8"));
  }

  return null;
};

export const extractEngine6PoiLocationImageUrls = (
  product: Record<string, unknown> | null | undefined
): string[] => {
  if (!product) {
    return [];
  }

  const urls: string[] = [];
  const seen = new Set<string>();

  const walk = (value: unknown, currentPath: string) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        walk(entry, `${currentPath}[${index}]`);
      });
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;

      if (
        typeof entry === "string" &&
        IMAGE_FIELD_NAMES.has(key) &&
        POI_PATH_PATTERN.test(nextPath) &&
        isDisplayableEngine6HeroUrl(entry) &&
        looksLikeImageResourceUrl(entry)
      ) {
        const normalized = entry.trim();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          urls.push(normalized);
        }
      }

      walk(entry, nextPath);
    }
  };

  walk(product, "product");
  return urls;
};

export const collectMerchantFeedImageFallbackCandidates = (
  tour: Engine6Tour,
  args?: {
    primaryImageUrl?: string;
    rawProductPayload?: unknown;
  }
): string[] => {
  const { stateSlug, citySlug } = parseEngine6StateCityFromCanonicalPath(
    tour.canonicalPath
  );
  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (url?: string | null) => {
    const normalized = (url ?? "").trim();
    if (!isDisplayableEngine6HeroUrl(normalized) || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    candidates.push(normalized);
  };

  push(args?.primaryImageUrl);
  push(tour.resolvedHero?.url);
  push(tour.heroImageUrl);

  const rawPayload =
    args?.rawProductPayload ??
    loadBundledEngine6ExactProductPayload(tour.productCode);
  if (rawPayload) {
    const extracted = extractEngine6Product(rawPayload);
    for (const candidate of extracted.heroCandidates ?? []) {
      push(candidate.url);
    }
    for (const url of extractEngine6PoiLocationImageUrls(extracted.product)) {
      push(url);
    }
  }

  for (const url of getEngine6CuratedProductHeroCandidates(tour.productCode)) {
    push(url);
  }

  push(resolveEngine6CanonicalCityHero(stateSlug, citySlug));
  push(ENGINE6_GLOBAL_FALLBACK_HERO_URL);

  return candidates;
};

export const validateEngine6MerchantFeedImageUrl = async (
  url: string,
  options?: {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
  }
): Promise<Engine6MerchantFeedImageValidationResult> => {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!isDisplayableEngine6HeroUrl(url)) {
    return { valid: false, reason: "not-displayable" };
  }

  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response = await fetchImpl(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
      });

      if (response.status === 405 || response.status === 501) {
        response = await fetchImpl(currentUrl, {
          method: "GET",
          headers: { Range: "bytes=0-0" },
          redirect: "manual",
          signal: controller.signal,
        });
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          return {
            valid: false,
            reason: "invalid-redirect",
            status: response.status,
          };
        }

        currentUrl = new URL(location, currentUrl).toString();
        if (!isDisplayableEngine6HeroUrl(currentUrl)) {
          return {
            valid: false,
            reason: "invalid-redirect-target",
            status: response.status,
          };
        }
        continue;
      }

      if (
        response.status === 404 ||
        response.status === 403 ||
        response.status >= 500 ||
        !response.ok
      ) {
        return {
          valid: false,
          reason: "http-error",
          status: response.status,
        };
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return {
          valid: false,
          reason: "empty-response",
          status: response.status,
        };
      }

      const contentType =
        response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ??
        "";
      if (contentType && !isAcceptedImageContentType(contentType)) {
        return {
          valid: false,
          reason: "not-image-content-type",
          status: response.status,
          contentType,
        };
      }

      return {
        valid: true,
        status: response.status,
        contentType: contentType || undefined,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { valid: false, reason: "timeout" };
      }

      return {
        valid: false,
        reason: "network-error",
        message: error instanceof Error ? error.message : String(error),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { valid: false, reason: "too-many-redirects" };
};

export const formatMerchantFeedImageValidationReport = (
  report: MerchantFeedImageGovernanceReport
) => {
  const lines = [
    "Merchant Feed Image Governance:",
    `  Images validated: ${report.imagesValidated}`,
    `  Automatically repaired: ${report.automaticallyRepaired}`,
    `  Requiring fallback: ${report.requiringFallback}`,
    `  Unrecoverable failures: ${report.unrecoverableFailures}`,
    `  Informational legacy invalid images: ${report.informationalLegacyInvalidImages}`,
  ];

  if (report.informationalLegacyProductCodes.length > 0) {
    lines.push(
      `  Informational legacy product codes: ${report.informationalLegacyProductCodes.slice(0, 20).join(", ")}`
    );
  }

  if (report.invalidUrlsReported.length > 0) {
    lines.push("  Invalid image URLs:");
    for (const entry of report.invalidUrlsReported.slice(0, 20)) {
      lines.push(
        `    ${entry.productCode}: ${entry.invalidUrl} (${entry.reason}${entry.status ? ` ${entry.status}` : ""})`
      );
    }
    if (report.invalidUrlsReported.length > 20) {
      lines.push(
        `    ...and ${report.invalidUrlsReported.length - 20} additional invalid image URL(s).`
      );
    }
  }

  return lines.join("\n");
};

export const applyMerchantFeedImageGovernance = async <
  TRow extends MerchantFeedImageGovernanceRow,
>(args: {
  rows: TRow[];
  toursByProductCode?: Map<string, Engine6Tour>;
  governanceByProductCode?: Map<string, MerchantFeedGovernanceTier>;
  branchModifiedProductCodes?: ReadonlySet<string>;
  validateImageUrl?: ValidateEngine6MerchantFeedImageUrl;
  loadProductPayload?: (productCode: string) => unknown | null;
}): Promise<ApplyMerchantFeedImageGovernanceResult<TRow>> => {
  const validateImageUrl =
    args.validateImageUrl ?? validateEngine6MerchantFeedImageUrl;
  const loadProductPayload =
    args.loadProductPayload ?? loadBundledEngine6ExactProductPayload;
  const validationCache = new Map<
    string,
    Engine6MerchantFeedImageValidationResult
  >();

  const validateCached = async (url: string) => {
    if (!validationCache.has(url)) {
      validationCache.set(url, await validateImageUrl(url));
    }

    return validationCache.get(url)!;
  };

  const report: MerchantFeedImageGovernanceReport = {
    imagesValidated: 0,
    automaticallyRepaired: 0,
    requiringFallback: 0,
    unrecoverableFailures: 0,
    informationalLegacyInvalidImages: 0,
    informationalLegacyProductCodes: [],
    invalidUrlsReported: [],
    failures: [],
  };

  const nextRows = await Promise.all(
    args.rows.map(async row => {
      const productCode = row.id.trim().toUpperCase();
      const tour = args.toursByProductCode?.get(productCode);
      const requiresStrictScope = requiresStrictMerchantFeedImageGovernance({
        productCode,
        hasEngine6Tour: Boolean(tour),
        governanceByProductCode: args.governanceByProductCode,
        branchModifiedProductCodes: args.branchModifiedProductCodes,
      });
      const currentUrl = row.image_link.trim();
      report.imagesValidated += 1;

      const currentValidation = await validateCached(currentUrl);
      if (currentValidation.valid) {
        return row;
      }

      report.invalidUrlsReported.push({
        productCode,
        invalidUrl: currentUrl,
        reason: currentValidation.reason ?? "http-error",
        status: currentValidation.status,
      });

      if (!tour) {
        recordUnrecoverableImageFailure(
          report,
          {
            productCode,
            attemptedUrls: [currentUrl],
            lastReason: currentValidation.reason,
            lastStatus: currentValidation.status,
          },
          requiresStrictScope
        );
        return row;
      }

      const candidates = collectMerchantFeedImageFallbackCandidates(tour, {
        primaryImageUrl: currentUrl,
        rawProductPayload: loadProductPayload(tour.productCode),
      });
      const primaryCandidate = candidates[0] ?? currentUrl;
      const attemptedUrls = [...candidates];
      let replacementUrl: string | null = null;

      for (const candidate of candidates) {
        if (candidate === currentUrl) {
          continue;
        }

        const candidateValidation = await validateCached(candidate);
        if (candidateValidation.valid) {
          replacementUrl = candidate;
          break;
        }

        report.invalidUrlsReported.push({
          productCode,
          invalidUrl: candidate,
          reason: candidateValidation.reason ?? "http-error",
          status: candidateValidation.status,
        });
      }

      if (!replacementUrl) {
        recordUnrecoverableImageFailure(
          report,
          {
            productCode,
            attemptedUrls,
            lastReason: currentValidation.reason,
            lastStatus: currentValidation.status,
          },
          requiresStrictScope
        );
        return row;
      }

      report.automaticallyRepaired += 1;
      if (replacementUrl !== primaryCandidate) {
        report.requiringFallback += 1;
      }

      return {
        ...row,
        image_link: replacementUrl,
      };
    })
  );

  return {
    pass: report.unrecoverableFailures === 0,
    rows: nextRows,
    report,
  };
};

export const enforceMerchantFeedImageGovernanceOnRows = async <
  TRow extends MerchantFeedImageGovernanceRow,
>(args: {
  rows: TRow[];
  tours: Engine6Tour[];
  validateImageUrl?: ValidateEngine6MerchantFeedImageUrl;
}) => {
  const toursByProductCode = new Map(
    args.tours.map(tour => [tour.productCode.trim().toUpperCase(), tour])
  );
  const result = await applyMerchantFeedImageGovernance({
    rows: args.rows,
    toursByProductCode,
    validateImageUrl: args.validateImageUrl,
  });

  console.log(formatMerchantFeedImageValidationReport(result.report));

  if (!result.pass) {
    throw new Error(
      `Merchant feed image governance failed for ${result.report.unrecoverableFailures} product(s).`
    );
  }

  return result.rows;
};
