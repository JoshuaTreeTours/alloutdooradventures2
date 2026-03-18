import { useEffect, useMemo, useState } from "react";

import Engine6TourPage from "../../engine6/components/Engine6TourPage";
import { mapViatorToEngine6Tour } from "../../engine6/mapViatorToEngine6Tour";
import { ENGINE6_SPECIMEN_PRODUCT_CODE } from "../../engine6/routes";
import type { Engine6ApiResponse, Engine6Tour } from "../../engine6/types";

export type Engine6SpecimenDebug = {
  requestedProductCode: string;
  requestedApiUrl: string;
  httpStatus: number | null;
  parsedJsonKeys: string[];
  hasExtractedTitle: boolean;
  hasRawProductTitle: boolean;
  source: string | null;
  diagnosticsReturned: boolean;
  overviewFieldPath: string | null;
  highlightsFieldPath: string | null;
  itineraryFieldPath: string | null;
  faqsFieldPath: string | null;
  requirementsFieldPath: string | null;
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
  parsedJsonKeys: [],
  hasExtractedTitle: false,
  hasRawProductTitle: false,
  source: null,
  diagnosticsReturned: false,
  overviewFieldPath: null,
  highlightsFieldPath: null,
  itineraryFieldPath: null,
  faqsFieldPath: null,
  requirementsFieldPath: null,
  classificationFieldPath: null,
  primaryCategory: null,
  failureReason: null,
});

export const resolveEngine6SpecimenResponse = ({
  payload,
  httpStatus,
  productCode,
  apiUrl,
}: {
  payload: unknown;
  httpStatus: number;
  productCode: string;
  apiUrl: string;
}): Pick<Engine6SpecimenViewState, "tour" | "error" | "debug"> => {
  const fallbackDebug = buildInitialEngine6SpecimenDebug(productCode, apiUrl);

  if (!isRecord(payload)) {
    return {
      tour: null,
      error: "Engine6 API returned non-object JSON",
      debug: {
        ...fallbackDebug,
        httpStatus,
        failureReason: "non-object-json",
      },
    };
  }

  const extracted = isRecord(payload.extracted) ? payload.extracted : null;
  const rawProduct = isRecord(payload.rawProduct) ? payload.rawProduct : null;
  const payloadError = typeof payload.error === "string" ? payload.error : null;
  const debug: Engine6SpecimenDebug = {
    ...fallbackDebug,
    httpStatus,
    parsedJsonKeys: Object.keys(payload),
    hasExtractedTitle:
      typeof extracted?.title === "string" && extracted.title.trim().length > 0,
    hasRawProductTitle:
      typeof rawProduct?.title === "string" &&
      rawProduct.title.trim().length > 0,
    source: typeof payload.source === "string" ? payload.source : null,
    diagnosticsReturned: isRecord(payload.diagnostics),
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
    faqsFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>).faqsFieldPath ===
        "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .faqsFieldPath as string)
        : null,
    requirementsFieldPath:
      typeof payload.diagnostics === "object" &&
      payload.diagnostics &&
      typeof (payload.diagnostics as Record<string, unknown>)
        .requirementsFieldPath === "string"
        ? ((payload.diagnostics as Record<string, unknown>)
            .requirementsFieldPath as string)
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
    return {
      tour: null,
      error:
        payloadError ?? "Engine6 API response did not include extracted data",
      debug: {
        ...debug,
        failureReason:
          httpStatus >= 400 ? "api-error-response" : "missing-extracted-data",
      },
    };
  }

  try {
    return {
      tour: mapViatorToEngine6Tour(payload as Engine6ApiResponse),
      error: httpStatus >= 400 ? (payloadError ?? "Engine6 API failed") : null,
      debug: {
        ...debug,
        failureReason: httpStatus >= 400 ? "api-error-response" : null,
      },
    };
  } catch (error) {
    return {
      tour: null,
      error:
        error instanceof Error
          ? error.message
          : "Engine6 mapping failed for the specimen response",
      debug: {
        ...debug,
        failureReason: "mapping-failed",
      },
    };
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
            <dt className="font-medium text-slate-900">FAQs path</dt>
            <dd>{debug.faqsFieldPath ?? "missing upstream"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">Requirements path</dt>
            <dd>{debug.requirementsFieldPath ?? "missing upstream"}</dd>
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

export default function Engine6SpecimenRoute() {
  const requestedProductCode = ENGINE6_SPECIMEN_PRODUCT_CODE;
  const apiUrl = useMemo(
    () => buildEngine6SpecimenApiUrl(requestedProductCode),
    [requestedProductCode]
  );
  const [state, setState] = useState<Engine6SpecimenViewState>(() => ({
    tour: null,
    error: null,
    debug: buildInitialEngine6SpecimenDebug(requestedProductCode, apiUrl),
    isLoading: true,
  }));

  useEffect(() => {
    let isDisposed = false;

    (async () => {
      try {
        const response = await fetch(apiUrl);
        const rawBody = await response.text();
        let payload: unknown;

        try {
          payload = JSON.parse(rawBody);
        } catch {
          if (!isDisposed) {
            setState({
              tour: null,
              error: "Engine6 API returned invalid JSON",
              debug: {
                ...buildInitialEngine6SpecimenDebug(
                  requestedProductCode,
                  apiUrl
                ),
                httpStatus: response.status,
                failureReason: "invalid-json",
              },
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
        });

        if (!isDisposed) {
          setState({
            ...next,
            isLoading: false,
          });
        }
      } catch (error) {
        if (!isDisposed) {
          setState({
            tour: null,
            error:
              error instanceof Error
                ? error.message
                : "Engine6 specimen fetch failed",
            debug: {
              ...buildInitialEngine6SpecimenDebug(requestedProductCode, apiUrl),
              failureReason: "request-failed",
            },
            isLoading: false,
          });
        }
      }
    })();

    return () => {
      isDisposed = true;
    };
  }, [apiUrl, requestedProductCode]);

  if (state.isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        Loading Engine6 tour…
      </main>
    );
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
        <Engine6SpecimenDiagnostics debug={state.debug} />
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
        <Engine6SpecimenDiagnostics debug={state.debug} />
      </>
    );
  }

  return (
    <>
      <Engine6TourPage tour={state.tour} />
      <Engine6SpecimenDiagnostics debug={state.debug} />
    </>
  );
}
