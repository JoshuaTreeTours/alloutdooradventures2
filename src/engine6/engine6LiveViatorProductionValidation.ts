import { readEngine6BundledExactProductPayload } from "../../api/engine6/resolveEngine6ViatorProductCommercialExtract.js";
import {
  resolveViatorApiConfig,
} from "../../api/engine6/resolveEngine6ViatorProductCommercialExtract.js";
import { fetchViatorLiveJson } from "../../api/engine6/viatorLiveCommercialFetch.js";
import {
  assessViatorPublicPageAvailability,
  ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS,
  fetchViatorPublicPage,
} from "./viatorPublicAvailability.js";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures.js";

export type Engine6LiveViatorValidationResult = {
  productCode: string;
  sourceUrl: string;
  passed: boolean;
  publicPageAvailable: boolean;
  apiConfirmedActive: boolean;
  canonicalProductCodeMatches: boolean;
  merchantUrlMatches: boolean;
  bookable: boolean;
  knownUnavailableBlocklistHit: boolean;
  reason: string | null;
};

export type Engine6LiveViatorProductionValidationReport = {
  passed: boolean;
  validatedAt: string;
  results: Engine6LiveViatorValidationResult[];
  failures: Engine6LiveViatorValidationResult[];
};

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

const extractProductCodeFromUrl = (url: string) => {
  const match = url.match(/\/d\d+-([A-Z0-9_]+)(?:[/?#]|$)/i);
  return match ? normalizeProductCode(match[1]) : null;
};

const normalizeComparableUrl = (url: string) =>
  url.trim().replace(/\/$/, "").toLowerCase();

const isCaptchaBlockedHtml = (html: string) =>
  /captcha-delivery\.com/i.test(html) ||
  /Please enable JS and disable any ad blocker/i.test(html);

const extractApiProduct = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  return (
    (record.product as Record<string, unknown> | undefined) ?? record
  ) as Record<string, unknown>;
};

const readApiProductCode = (product: Record<string, unknown>) => {
  const code = product.productCode ?? product.code;
  return typeof code === "string" ? normalizeProductCode(code) : null;
};

const readApiProductUrl = (product: Record<string, unknown>) => {
  const url = product.productUrl ?? product.seoUrl ?? product.url;
  return typeof url === "string" && url.trim() ? url.trim() : null;
};

const readApiProductStatus = (product: Record<string, unknown>) => {
  const status =
    product.status ?? product.productStatus ?? product.availabilityStatus;
  return typeof status === "string" ? status.trim().toUpperCase() : null;
};

const isInactiveApiStatus = (status: string | null) =>
  status !== null &&
  ["UNAVAILABLE", "INACTIVE", "DISCONTINUED", "NOT_AVAILABLE"].includes(
    status
  );

const readBundledMerchantUrl = (productCode: string) => {
  const payload = readEngine6BundledExactProductPayload(productCode);
  if (!payload) {
    return null;
  }

  const product = extractApiProduct(payload);
  return product ? readApiProductUrl(product) : null;
};

const urlsReferToSameProduct = (left: string, right: string) => {
  const normalizedLeft = normalizeComparableUrl(left);
  const normalizedRight = normalizeComparableUrl(right);
  if (normalizedLeft === normalizedRight) {
    return true;
  }

  const leftCode = extractProductCodeFromUrl(left);
  const rightCode = extractProductCodeFromUrl(right);
  return Boolean(leftCode && rightCode && leftCode === rightCode);
};

export const validateEngine6LiveViatorCandidate = async (args: {
  productCode: string;
  sourceUrl: string;
  fetchImpl?: typeof fetch;
}): Promise<Engine6LiveViatorValidationResult> => {
  const productCode = normalizeProductCode(args.productCode);
  const sourceUrl = args.sourceUrl.trim();
  const knownUnavailable =
    productCode in ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS;

  const bundledMerchantUrl = readBundledMerchantUrl(productCode);
  const merchantUrlMatches = bundledMerchantUrl
    ? urlsReferToSameProduct(sourceUrl, bundledMerchantUrl)
    : true;

  let publicPageAvailable = false;
  let publicAssessmentReason: string | null = null;
  let canonicalProductCodeMatches = extractProductCodeFromUrl(sourceUrl) === productCode;
  let bookable = false;

  try {
    const page = await fetchViatorPublicPage(sourceUrl, args.fetchImpl);
    if (isCaptchaBlockedHtml(page.html)) {
      publicAssessmentReason =
        "public Viator fetch blocked by bot protection; API cross-check required";
    } else {
      const assessment = assessViatorPublicPageAvailability({
        productCode,
        sourceUrl,
        html: page.html,
        finalUrl: page.finalUrl,
        httpStatus: page.httpStatus,
      });
      publicPageAvailable = assessment.available;
      publicAssessmentReason = assessment.reason;
      canonicalProductCodeMatches =
        extractProductCodeFromUrl(assessment.finalUrl) === productCode;
      bookable = assessment.available;
    }
  } catch (error) {
    publicAssessmentReason =
      error instanceof Error
        ? error.message
        : "public Viator page fetch failed";
  }

  let apiConfirmedActive = false;
  let apiReason: string | null = null;
  const { apiKey, baseUrl } = resolveViatorApiConfig();

  if (apiKey) {
    const requestUrl = `${baseUrl}/products/${encodeURIComponent(productCode)}`;
    const response = await fetchViatorLiveJson({ apiKey, url: requestUrl });
    const product = extractApiProduct(response.payload);

    if (!response.payload || response.status < 200 || response.status >= 300) {
      apiReason = `Viator API returned HTTP ${response.status || "0"}`;
    } else if (!product) {
      apiReason = "Viator API payload missing product body";
    } else {
      const apiProductCode = readApiProductCode(product);
      const apiProductUrl = readApiProductUrl(product);
      const apiStatus = readApiProductStatus(product);

      if (apiProductCode !== productCode) {
        apiReason = `Viator API product code mismatch (${apiProductCode ?? "missing"})`;
      } else if (isInactiveApiStatus(apiStatus)) {
        apiReason = `Viator API reports inactive status ${apiStatus}`;
      } else if (apiProductUrl && !urlsReferToSameProduct(sourceUrl, apiProductUrl)) {
        apiReason = `Viator API productUrl does not match configured source URL (${apiProductUrl})`;
      } else {
        apiConfirmedActive = true;
        bookable = true;
        if (apiProductUrl) {
          canonicalProductCodeMatches =
            extractProductCodeFromUrl(apiProductUrl) === productCode;
        }
      }
    }
  } else {
    apiReason = "Viator API key not configured";
  }

  const passed =
    !knownUnavailable &&
    merchantUrlMatches &&
    canonicalProductCodeMatches &&
    (publicPageAvailable || apiConfirmedActive) &&
    bookable;

  const reason = passed
    ? null
    : knownUnavailable
      ? `product ${productCode} is on the Engine6 known-unavailable blocklist`
      : !merchantUrlMatches
        ? "bundled merchant/source URL does not match configured Viator URL"
        : !canonicalProductCodeMatches
          ? "canonical Viator product code does not match configured product"
          : !publicPageAvailable && !apiConfirmedActive
            ? [
                publicAssessmentReason ?? "public page unavailable",
                apiReason ?? "API confirmation unavailable",
              ].join("; ")
            : !bookable
              ? "product is not currently bookable"
              : "live Viator validation failed";

  return {
    productCode,
    sourceUrl,
    passed,
    publicPageAvailable,
    apiConfirmedActive,
    canonicalProductCodeMatches,
    merchantUrlMatches,
    bookable,
    knownUnavailableBlocklistHit: knownUnavailable,
    reason,
  };
};

export const validateConfiguredEngine6ProductionViatorProducts = async (args?: {
  fetchImpl?: typeof fetch;
}): Promise<Engine6LiveViatorProductionValidationReport> => {
  const results: Engine6LiveViatorValidationResult[] = [];

  for (const fixture of ENGINE6_VALIDATION_FIXTURES) {
    results.push(
      await validateEngine6LiveViatorCandidate({
        productCode: fixture.productCode,
        sourceUrl: fixture.publicUrl,
        fetchImpl: args?.fetchImpl,
      })
    );
  }

  const failures = results.filter(result => !result.passed);

  return {
    passed: failures.length === 0,
    validatedAt: new Date().toISOString(),
    results,
    failures,
  };
};

export const formatEngine6LiveViatorProductionValidationReport = (
  report: Engine6LiveViatorProductionValidationReport
) => {
  const lines = [
    `Engine6 live Viator production validation (${report.validatedAt})`,
    `Products validated: ${report.results.length}`,
    `Failures: ${report.failures.length}`,
  ];

  for (const failure of report.failures) {
    lines.push(
      `- ${failure.productCode}: ${failure.reason ?? "validation failed"} (${failure.sourceUrl})`
    );
  }

  return lines.join("\n");
};

export type Engine6RankedViatorCandidate = {
  productCode: string;
  sourceUrl: string;
};

export const selectValidEngine6CandidatesFromRankedList = async (args: {
  candidates: Engine6RankedViatorCandidate[];
  desiredCount: number;
  fetchImpl?: typeof fetch;
}) => {
  const accepted: Engine6LiveViatorValidationResult[] = [];
  const rejected: Engine6LiveViatorValidationResult[] = [];

  for (const candidate of args.candidates) {
    if (accepted.length >= args.desiredCount) {
      break;
    }

    const result = await validateEngine6LiveViatorCandidate({
      productCode: candidate.productCode,
      sourceUrl: candidate.sourceUrl,
      fetchImpl: args.fetchImpl,
    });

    if (result.passed) {
      accepted.push(result);
    } else {
      rejected.push(result);
    }
  }

  return {
    accepted,
    rejected,
    filled: accepted.length >= args.desiredCount,
    report: formatEngine6LiveViatorProductionValidationReport({
      passed: accepted.length >= args.desiredCount,
      validatedAt: new Date().toISOString(),
      results: [...accepted, ...rejected],
      failures: rejected,
    }),
  };
};
