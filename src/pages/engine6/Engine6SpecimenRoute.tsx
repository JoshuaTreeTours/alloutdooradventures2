import { useEffect, useMemo, useState } from "react";

import Engine6TourPage from "../../engine6/components/Engine6TourPage";
import { mapViatorToEngine6Tour } from "../../engine6/mapViatorToEngine6Tour";
import { preserveEngine6BaselineItineraryWhenStronger } from "../../engine6/liveItineraryMergeGuard";
import { getEngine6NativeTourByCanonicalPath } from "../../engine6/registry";
import { resolveEngine6ProductCodeForPath } from "../../engine6/routes";
import { assertEngine6RequestedPathMatchesResolvedTour } from "../../engine6/routeIntegrity";
import type { Engine6ApiResponse, Engine6Tour } from "../../engine6/types";

export type Engine6SpecimenDebug = {
  requestedProductCode: string;
  requestedApiUrl: string;
  httpStatus: number | null;
  responseContentType: string | null;
  responseBodyPreview: string | null;
  parsedJsonKeys: string[];
  hasExtractedTitle: boolean;
  hasRawProductTitle: boolean;
  source: string | null;
  diagnosticsReturned: boolean;
  overviewFieldPath: string | null;
  highlightsFieldPath: string | null;
  itineraryFieldPath: string | null;
  itineraryItemCount: number | null;
  itinerarySourceUsed: string | null;
  itineraryStructuredSourceUsed: boolean | null;
  itineraryFallbackSummaryUsed: boolean | null;
  faqsFieldPath: string | null;
  faqCount: number | null;
  faqSourceUsed: string | null;
  requirementsFieldPath: string | null;
  sourceProductUrl: string | null;
  finalHeroUrl: string | null;
  heroSourceType: string | null;
  heroVariantFieldPath: string | null;
  selectedHeroWidth: number | null;
  selectedHeroHeight: number | null;
  imageSourceUsed: string | null;
  fallbackTriggered: boolean | null;
  rejectedForeignHeroCandidates: Array<{
    url: string;
    sourceType: string;
    reason: string;
    candidateProductCode: string | null;
    candidateSourceProductUrl: string | null;
    fieldPath: string | null;
  }>;
  commercialPriceRawValue: string | number | null;
  priceSourceUsed: string | null;
  highlightClassificationReason: string | null;
  classificationFieldPath: string | null;
  primaryCategory: string | null;
  failureReason: string | null;
};

type Engine6SpecimenViewState = {
  tour: Engine6Tour | null;
  error: string | null;
  debug: Engine6SpecimenDebug;
  isLoading: boolean;
};

export const shouldShowEngine6Diagnostics = (search: string) =>
  new URLSearchParams(search).get("engine6Debug") === "1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const buildEngine6SpecimenApiUrl = (productCode: string) =>
  `/api/engine6/viator-product?productCode=${encodeURIComponent(productCode)}`;

export const buildInitialEngine6SpecimenDebug = (
  productCode: string,
  apiUrl: string
): Engine6SpecimenDebug => ({
  requestedProductCode: productCode,
  requestedApiUrl: apiUrl,
  httpStatus: null,
  responseContentType: null,
  responseBodyPreview: null,
  parsedJsonKeys: [],
  hasExtractedTitle: false,
  hasRawProductTitle: false,
  source: null,
  diagnosticsReturned: false,
  overviewFieldPath: null,
  highlightsFieldPath: null,
  itineraryFieldPath: null,
  itineraryItemCount: null,
  itinerarySourceUsed: null,
  itineraryStructuredSourceUsed: null,
  itineraryFallbackSummaryUsed: null,
  faqsFieldPath: null,
  faqCount: null,
  faqSourceUsed: null,
  requirementsFieldPath: null,
  sourceProductUrl: null,
  finalHeroUrl: null,
  heroSourceType: null,
  heroVariantFieldPath: null,
  selectedHeroWidth: null,
  selectedHeroHeight: null,
  imageSourceUsed: null,
  fallbackTriggered: null,
  rejectedForeignHeroCandidates: [],
  commercialPriceRawValue: null,
  priceSourceUsed: null,
  highlightClassificationReason: null,
  classificationFieldPath: null,
  primaryCategory: null,
  failureReason: null,
});

const withEngine6RouteBackedFallback = ({
  fallbackTour,
  error,
  debug,
}: {
  fallbackTour?: Engine6Tour | null;
  error: string;
  debug: Engine6SpecimenDebug;
}): Pick<Engine6SpecimenViewState, "tour" | "error" | "debug"> => {
  if (!fallbackTour) {
    return { tour: null, error, debug };
  }

  return {
    tour: fallbackTour,
    error: null,
    debug: {
      ...debug,
      source:
        debug.source ??
        fallbackTour.diagnostics.source ??
        "route-backed-fallback",
    },
  };
};

export const resolveEngine6SpecimenResponse = ({
  payload,
  httpStatus,
  productCode,
  apiUrl,
  responseContentType,
  responseBodyPreview,
  fallbackTour = null,
}: {
  payload: unknown;
  httpStatus: number;
  productCode: string;
  apiUrl: string;
  responseContentType?: string | null;
  responseBodyPreview?: string | null;
  fallbackTour?: Engine6Tour | null;
}): Pick<Engine6SpecimenViewState, "tour" | "error" | "debug"> => {
  const fallbackDebug = buildInitialEngine6SpecimenDebug(productCode, apiUrl);

  if (!isRecord(payload)) {
    return withEngine6RouteBackedFallback({
      fallbackTour,
      error: "Engine6 API returned non-object JSON",
      debug: {
        ...fallbackDebug,
        httpStatus,
        responseContentType: responseContentType ?? null,
        responseBodyPreview: responseBodyPreview ?? null,
        failureReason: "non-object-json",
      },
    });
  }

  const extracted = isRecord(payload.extracted) ? payload.extracted : null;
  const rawProduct = isRecord(payload.rawProduct) ? payload.rawProduct : null;
  const payloadError = typeof payload.error === "string" ? payload.error : null;
  const debug: Engine6SpecimenDebug = {
    ...fallbackDebug,
    httpStatus,
    responseContentType: responseContentType ?? null,
    responseBodyPreview: responseBodyPreview ?? null,
    parsedJsonKeys: Object.keys(payload),
    hasExtractedTitle:
      typeof extracted?.title === "string" && extracted.title.trim().length > 0,
    hasRawProductTitle:
      typeof rawProduct?.title === "string" &&
      rawProduct.title.trim().length > 0,
    source: typeof payload.source === "string" ? payload.source : null,
    diagnosticsReturned: isRecord(payload.diagnostics),
    sourceProductUrl:
      typeof extracted?.productUrl === "string" ? extracted.productUrl : null,
    finalHeroUrl:
      typeof extracted?.heroImageUrl === "string"
        ? extracted.heroImageUrl
        : null,
    overviewFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .overviewFieldPath === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .overviewFieldPath as string)
        : null,
    highlightsFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .highlightsFieldPath === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .highlightsFieldPath as string)
        : null,
    itineraryFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .itineraryFieldPath === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .itineraryFieldPath as string)
        : null,
    itineraryItemCount:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .itineraryItemCount === "number"
        ? ((payload.diagnostics as Record<string, unknown>)
            .itineraryItemCount as number)
        : null,
    itinerarySourceUsed:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .itinerarySourceUsed === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .itinerarySourceUsed as string)
        : null,
    itineraryStructuredSourceUsed:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .itineraryStructuredSourceUsed === "boolean"
        ? ((payload.diagnostics as Record<string, unknown>)
            .itineraryStructuredSourceUsed as boolean)
        : null,
    itineraryFallbackSummaryUsed:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .itineraryFallbackSummaryUsed === "boolean"
        ? ((payload.diagnostics as Record<string, unknown>)
            .itineraryFallbackSummaryUsed as boolean)
        : null,
    faqsFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>).faqsFieldPath ===
        "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .faqsFieldPath as string)
        : null,
    faqCount:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>).faqCount ===
        "number"
        ? ((payload.diagnostics as Record<string, unknown>).faqCount as number)
        : null,
    faqSourceUsed:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>).faqSourceUsed ===
        "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .faqSourceUsed as string)
        : null,
    requirementsFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .requirementsFieldPath === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .requirementsFieldPath as string)
        : null,
    heroVariantFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .heroVariantFieldPath === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .heroVariantFieldPath as string)
        : null,
    selectedHeroWidth:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .selectedHeroWidth === "number"
        ? ((payload.diagnostics as Record<string, unknown>)
            .selectedHeroWidth as number)
        : null,
    selectedHeroHeight:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .selectedHeroHeight === "number"
        ? ((payload.diagnostics as Record<string, unknown>)
            .selectedHeroHeight as number)
        : null,
    heroSourceType:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>).heroSourceType ===
        "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .heroSourceType as string)
        : null,
    imageSourceUsed:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .imageSourceUsed === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .imageSourceUsed as string)
        : null,
    fallbackTriggered:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .heroFallbackTriggered === "boolean"
        ? ((payload.diagnostics as Record<string, unknown>)
            .heroFallbackTriggered as boolean)
        : null,
    rejectedForeignHeroCandidates:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      Array.isArray(
        (payload.diagnostics as Record<string, unknown>)
          .rejectedForeignHeroCandidates
      )
        ? (
            (payload.diagnostics as Record<string, unknown>)
              .rejectedForeignHeroCandidates as Array<Record<string, unknown>>
          )
            .filter(candidate => typeof candidate.url === "string")
            .map(candidate => ({
              url: candidate.url as string,
              sourceType:
                typeof candidate.sourceType === "string"
                  ? (candidate.sourceType as string)
                  : "unknown",
              reason:
                typeof candidate.reason === "string"
                  ? (candidate.reason as string)
                  : "unknown",
              candidateProductCode:
                typeof candidate.candidateProductCode === "string"
                  ? (candidate.candidateProductCode as string)
                  : null,
              candidateSourceProductUrl:
                typeof candidate.candidateSourceProductUrl === "string"
                  ? (candidate.candidateSourceProductUrl as string)
                  : null,
              fieldPath:
                typeof candidate.fieldPath === "string"
                  ? (candidate.fieldPath as string)
                  : null,
            }))
        : [],
    commercialPriceRawValue:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      (typeof (payload.diagnostics as Record<string, unknown>)
        .commercialPriceRawValue === "string" ||
        typeof (payload.diagnostics as Record<string, unknown>)
          .commercialPriceRawValue === "number")
        ? ((payload.diagnostics as Record<string, unknown>)
            .commercialPriceRawValue as string | number)
        : null,
    priceSourceUsed:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .priceSourceUsed === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .priceSourceUsed as string)
        : null,
    highlightClassificationReason:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .highlightClassificationReason === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .highlightClassificationReason as string)
        : null,
    classificationFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .classificationFieldPath === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .classificationFieldPath as string)
        : null,
    primaryCategory:
      typeof extracted?.primaryCategory === "string"
        ? extracted.primaryCategory
        : null,
    failureReason: null,
  };

  if (!extracted) {
    return withEngine6RouteBackedFallback({
      fallbackTour,
      error:
        payloadError ?? "Engine6 API response did not include extracted data",
      debug: {
        ...debug,
        failureReason:
          httpStatus >= 400 ? "api-error-response" : "missing-extracted-data",
      },
    });
  }

  if (httpStatus >= 500) {
    return withEngine6RouteBackedFallback({
      fallbackTour,
      error: payloadError ?? "Engine6 API failed",
      debug: {
        ...debug,
        failureReason: "api-error-response",
      },
    });
  }

  try {
    const liveTour = mapViatorToEngine6Tour(payload as Engine6ApiResponse);
    const tour = preserveEngine6BaselineItineraryWhenStronger({
      baselineTour: fallbackTour,
      liveTour,
    });

    return {
      tour,
      error: httpStatus >= 400 ? (payloadError ?? "Engine6 API failed") : null,
      debug: {
        ...debug,
        failureReason: httpStatus >= 400 ? "api-error-response" : null,
      },
    };
  } catch (error) {
    return withEngine6RouteBackedFallback({
      fallbackTour,
      error:
        error instanceof Error
          ? error.message
          : "Engine6 mapping failed for the specimen response",
      debug: {
        ...debug,
        failureReason: "mapping-failed",
      },
    });
  }
};

const Engine6SpecimenDiagnostics = ({
  debug,
}: {
  debug: Engine6SpecimenDebug;
}) => {
  const jsonKeysLabel =
    debug.parsedJsonKeys.length > 0 ? debug.parsedJsonKeys.join(", ") : "none";

  return (
    <section className="mx-auto mt-6 max-w-6xl px-4 pb-12">
      <details className="rounded-xl border border-green-200 bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
        <summary className="cursor-pointer font-semibold text-green-900">
          Engine6 specimen diagnostics
        </summary>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-900">
              Requested product code
            </dt>
            <dd>{debug.requestedProductCode}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Requested API URL</dt>
            <dd className="break-all">{debug.requestedApiUrl}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">HTTP status</dt>
            <dd>{debug.httpStatus ?? "pending"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">
              Response content type
            </dt>
            <dd>{debug.responseContentType ?? "unknown"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Response preview</dt>
            <dd className="break-all">{debug.responseBodyPreview ?? "none"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Parsed JSON keys</dt>
            <dd>{jsonKeysLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">
              Extracted title present
            </dt>
            <dd>{debug.hasExtractedTitle ? "yes" : "no"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">
              Raw product title present
            </dt>
            <dd>{debug.hasRawProductTitle ? "yes" : "no"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Source</dt>
            <dd>{debug.source ?? "unknown"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Source product URL</dt>
            <dd className="break-all">
              {debug.sourceProductUrl ?? "missing upstream"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Final hero URL</dt>
            <dd className="break-all">
              {debug.finalHeroUrl ?? "missing upstream"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Hero source type</dt>
            <dd>
              {debug.heroSourceType ?? debug.imageSourceUsed ?? "unknown"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Fallback triggered</dt>
            <dd>
              {debug.fallbackTriggered === null
                ? "unknown"
                : debug.fallbackTriggered
                  ? "true"
                  : "false"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Hero variant path</dt>
            <dd>{debug.heroVariantFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Hero size</dt>
            <dd>
              {debug.selectedHeroWidth && debug.selectedHeroHeight
                ? `${debug.selectedHeroWidth}×${debug.selectedHeroHeight}`
                : "unknown"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-slate-900">
              Rejected foreign hero candidates
            </dt>
            <dd className="space-y-1 break-all">
              {debug.rejectedForeignHeroCandidates.length > 0 ? (
                debug.rejectedForeignHeroCandidates.map(candidate => (
                  <div key={`${candidate.url}-${candidate.reason}`}>
                    {candidate.reason}: {candidate.url}
                    {candidate.candidateProductCode
                      ? ` [${candidate.candidateProductCode}]`
                      : ""}
                  </div>
                ))
              ) : (
                <span>none</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Price source</dt>
            <dd>{debug.priceSourceUsed ?? "unknown"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Price raw value</dt>
            <dd>{debug.commercialPriceRawValue ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Overview path</dt>
            <dd>{debug.overviewFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Highlights path</dt>
            <dd>{debug.highlightsFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Itinerary path</dt>
            <dd>{debug.itineraryFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Itinerary source</dt>
            <dd>{debug.itinerarySourceUsed ?? "none"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">
              Structured itinerary found
            </dt>
            <dd>
              {debug.itineraryStructuredSourceUsed === null
                ? "unknown"
                : debug.itineraryStructuredSourceUsed
                  ? "yes"
                  : "no"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Itinerary count</dt>
            <dd>{debug.itineraryItemCount ?? 0}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">
              Fallback summary mode
            </dt>
            <dd>
              {debug.itineraryFallbackSummaryUsed === null
                ? "unknown"
                : debug.itineraryFallbackSummaryUsed
                  ? "yes"
                  : "no"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">FAQs path</dt>
            <dd>{debug.faqsFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">FAQ source</dt>
            <dd>{debug.faqSourceUsed ?? "none"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">FAQ count</dt>
            <dd>{debug.faqCount ?? 0}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Requirements path</dt>
            <dd>{debug.requirementsFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">
              Highlight classification
            </dt>
            <dd>{debug.highlightClassificationReason ?? "none"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Classification path</dt>
            <dd>{debug.classificationFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Primary category</dt>
            <dd>{debug.primaryCategory ?? "unclassified"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Failure reason</dt>
            <dd>{debug.failureReason ?? "none"}</dd>
          </div>
        </dl>
      </details>
    </section>
  );
};

const Engine6SpecimenLoadingShell = () => (
  <main
    className="bg-[#f6f1e8] text-[#1f2a1f]"
    aria-busy="true"
    aria-live="polite"
    aria-label="Loading tour details"
  >
    <section className="bg-[#2f4a2f] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="space-y-4">
          <div className="h-3 w-48 animate-pulse rounded bg-white/20" />
          <div className="h-3 w-32 animate-pulse rounded bg-white/20" />
          <div className="h-10 w-full max-w-2xl animate-pulse rounded bg-white/20" />
          <div className="h-28 w-full max-w-xl animate-pulse rounded-2xl bg-white/15" />
          <div className="h-11 w-32 animate-pulse rounded-full bg-white/25" />
        </div>
        <div
          className="h-80 w-full animate-pulse rounded-3xl bg-white/15 md:h-[440px]"
          aria-hidden="true"
        />
      </div>
    </section>

    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      {Array.from({ length: 3 }, (_, sectionIndex) => (
        <section
          key={sectionIndex}
          className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm"
        >
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-[94%] animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-[86%] animate-pulse rounded bg-slate-100" />
          </div>
        </section>
      ))}
    </div>
  </main>
);

export default function Engine6SpecimenRoute() {
  const requestedPath = useMemo(
    () => (typeof window === "undefined" ? "" : window.location.pathname),
    []
  );
  const requestedProductCode = useMemo(
    () => resolveEngine6ProductCodeForPath(requestedPath),
    [requestedPath]
  );
  const apiUrl = useMemo(
    () =>
      requestedProductCode
        ? buildEngine6SpecimenApiUrl(requestedProductCode)
        : null,
    [requestedProductCode]
  );
  const routeBackedFallbackTour = useMemo(
    () =>
      requestedPath ? getEngine6NativeTourByCanonicalPath(requestedPath) : null,
    [requestedPath]
  );
  const [state, setState] = useState<Engine6SpecimenViewState>(() => ({
    tour: null,
    error: null,
    debug: buildInitialEngine6SpecimenDebug(
      requestedProductCode ?? "",
      apiUrl ?? ""
    ),
    isLoading: true,
  }));
  const showDiagnostics = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return shouldShowEngine6Diagnostics(window.location.search);
  }, []);

  useEffect(() => {
    let isDisposed = false;

    if (!requestedProductCode || !apiUrl) {
      setState({
        tour: null,
        error:
          "Requested path is not mapped to an Engine6 canonical product route.",
        debug: buildInitialEngine6SpecimenDebug(
          requestedProductCode ?? "",
          apiUrl ?? ""
        ),
        isLoading: false,
      });
      return;
    }

    (async () => {
      try {
        const response = await fetch(apiUrl);
        const rawBody = await response.text();
        const responseContentType = response.headers.get("content-type");
        const responseBodyPreview = rawBody.slice(0, 200) || null;
        let payload: unknown;

        try {
          payload = JSON.parse(rawBody);
        } catch {
          const failureReason =
            response.ok || responseContentType?.includes("json")
              ? "invalid-json"
              : "non-json-error-response";
          const errorMessage =
            failureReason === "non-json-error-response"
              ? `Engine6 API returned a non-JSON error response (HTTP ${response.status})`
              : "Engine6 API returned invalid JSON";

          if (!isDisposed) {
            const fallbackState = withEngine6RouteBackedFallback({
              fallbackTour: routeBackedFallbackTour,
              error: errorMessage,
              debug: {
                ...buildInitialEngine6SpecimenDebug(
                  requestedProductCode,
                  apiUrl
                ),
                httpStatus: response.status,
                responseContentType,
                responseBodyPreview,
                failureReason,
              },
            });
            setState({
              ...fallbackState,
              isLoading: false,
            });
          }
          return;
        }

        const next = resolveEngine6SpecimenResponse({
          payload,
          httpStatus: response.status,
          productCode: requestedProductCode,
          apiUrl,
          responseContentType,
          responseBodyPreview,
          fallbackTour: routeBackedFallbackTour,
        });

        if (!isDisposed) {
          if (next.tour) {
            assertEngine6RequestedPathMatchesResolvedTour({
              requestedPath,
              resolvedTour: next.tour,
            });
          }

          setState({
            ...next,
            isLoading: false,
          });
        }
      } catch (error) {
        if (!isDisposed) {
          const fallbackState = withEngine6RouteBackedFallback({
            fallbackTour: routeBackedFallbackTour,
            error:
              error instanceof Error
                ? error.message
                : "Engine6 specimen fetch failed",
            debug: {
              ...buildInitialEngine6SpecimenDebug(requestedProductCode, apiUrl),
              failureReason: "request-failed",
            },
          });
          setState({
            ...fallbackState,
            isLoading: false,
          });
        }
      }
    })();

    return () => {
      isDisposed = true;
    };
  }, [apiUrl, requestedPath, requestedProductCode, routeBackedFallbackTour]);

  if (!requestedProductCode || !apiUrl) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950">
          <h1 className="text-2xl font-semibold">Engine6 route mismatch</h1>
          <p className="mt-3 text-sm leading-6">
            Requested path is not mapped to an Engine6 canonical product route.
          </p>
        </div>
      </main>
    );
  }

  if (state.isLoading) {
    return <Engine6SpecimenLoadingShell />;
  }

  if (state.error && !state.tour) {
    return (
      <>
        <main className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950">
            <h1 className="text-2xl font-semibold">
              Engine6 specimen unavailable
            </h1>
            <p className="mt-3 text-sm leading-6">{state.error}</p>
          </div>
        </main>
        {showDiagnostics ? (
          <Engine6SpecimenDiagnostics debug={state.debug} />
        ) : null}
      </>
    );
  }

  if (!state.tour) {
    return (
      <>
        <main className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <h1 className="text-2xl font-semibold">
              Engine6 specimen did not map to a tour
            </h1>
            <p className="mt-3 text-sm leading-6">
              The Engine6 API responded, but the specimen page could not build a
              renderable tour model.
            </p>
          </div>
        </main>
        {showDiagnostics ? (
          <Engine6SpecimenDiagnostics debug={state.debug} />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Engine6TourPage tour={state.tour} />
      {showDiagnostics ? (
        <Engine6SpecimenDiagnostics debug={state.debug} />
      ) : null}
    </>
  );
}
