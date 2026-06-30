import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  merchantFeedCommercialRefreshOnlyFieldsChanged,
  MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE,
  refreshExistingMerchantFeedCommercialFields,
  type MerchantFeedCommercialRefreshAudit,
  type MerchantFeedCommercialRefreshField,
} from "./merchantFeedCommercialRefreshGovernance.js";
import type { MerchantFeedCsvRow } from "./merchantFeedChangeScopeGovernance.js";
import { MERCHANT_FEED_ROW_HEADERS } from "./merchantFeedChangeScopeGovernance.js";
import {
  describeViatorApiConfigEnvVisibility,
  diagnoseEngine6ViatorProductCommercialExtract,
  resolveViatorApiConfig,
} from "./resolveEngine6ViatorProductCommercialExtract.js";
import { merchantFeedEligibleTours } from "../../src/engine6/merchantFeedEligibility.js";
import {
  requireLiveMerchantCommercial,
  resolveRuntimeCommercialBaseUrl,
} from "../../src/engine6/fetchEngine6LiveCommercialFieldsForSchema.js";

export const MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE =
  "commercial refresh skipped: credentials unavailable";

export const MERCHANT_FEED_COMMERCIAL_BACKFILL_AUDIT_FILENAME =
  "merchantFeed-commercial-refresh-audit.json";

type MerchantRow = Record<(typeof MERCHANT_FEED_ROW_HEADERS)[number], string>;

export type MerchantFeedCommercialBackfillSummary = {
  productsScanned: number;
  productsSuccessfullyRefreshed: string[];
  productsUnchanged: string[];
  productsWithUpdatedPrice: string[];
  productsWithUpdatedRating: string[];
  productsWithUpdatedReviewCount: string[];
  productsCouldNotRefresh: Array<{ productCode: string; reason: string }>;
};

export type MerchantFeedCommercialBackfillSkippedResult = {
  status: "skipped";
  reason: typeof MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE;
  runtime: "local" | "vercel";
  viatorApiConfig: ReturnType<typeof describeViatorApiConfigEnvVisibility>;
};

export type MerchantFeedCommercialRefreshMode = "generation" | "backfill";

export type MerchantFeedCommercialRefreshPolicy =
  | { action: "refresh" }
  | {
      action: "skip";
      reason: typeof MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE;
    }
  | { action: "fail"; reason: string };

export type ApplyMerchantFeedCommercialRefreshOptions<
  TRow extends MerchantFeedCsvRow,
> = {
  rows: TRow[];
  baselineRows: MerchantFeedCsvRow[];
  mode?: MerchantFeedCommercialRefreshMode;
  onProgress?: (args: {
    productCode: string;
    completed: number;
    total: number;
  }) => void;
};

export type ApplyMerchantFeedCommercialRefreshResult<
  TRow extends MerchantFeedCsvRow,
> =
  | {
      skipped: true;
      skipMessage: typeof MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE;
      rows: TRow[];
      audit: null;
      summary: null;
      report: typeof MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE;
    }
  | {
      skipped: false;
      rows: TRow[];
      audit: MerchantFeedCommercialRefreshAudit;
      summary: MerchantFeedCommercialBackfillSummary;
      report: string;
    };

export type MerchantFeedCommercialBackfillCompletedResult = {
  status: "completed";
  runtime: "local" | "vercel";
  merchantFeedPath: string;
  auditPath: string;
  viatorApiConfig: ReturnType<typeof describeViatorApiConfigEnvVisibility>;
  summary: MerchantFeedCommercialBackfillSummary;
  fieldLevelAudit: MerchantFeedCommercialRefreshAudit;
  report: string;
};

export type MerchantFeedCommercialBackfillResult =
  | MerchantFeedCommercialBackfillSkippedResult
  | MerchantFeedCommercialBackfillCompletedResult;

export type RunMerchantFeedCommercialBackfillOptions = {
  merchantFeedPath?: string;
  auditPath?: string;
  onProgress?: (args: {
    productCode: string;
    completed: number;
    total: number;
  }) => void;
};

export const isVercelRuntime = () => process.env.VERCEL === "1";

export const hasEngine6ViatorApiCredentials = () =>
  Boolean(resolveViatorApiConfig().apiKey);

export const resolveMerchantFeedCommercialBackfillPaths = (
  cwd = process.cwd()
) => ({
  merchantFeedPath: path.resolve(
    cwd,
    process.env.MERCHANT_FEED_OUTPUT_PATH ?? "data/merchantFeed.csv"
  ),
  auditPath: path.resolve(
    cwd,
    "data",
    MERCHANT_FEED_COMMERCIAL_BACKFILL_AUDIT_FILENAME
  ),
});

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: MerchantRow[]) => {
  const headerLine = MERCHANT_FEED_ROW_HEADERS.join(",");
  const body = rows
    .map(row =>
      MERCHANT_FEED_ROW_HEADERS.map(header => escapeCsv(row[header])).join(",")
    )
    .join("\n");
  return `${headerLine}\n${body}\n`;
};

const parseCsv = (content: string): MerchantRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );
  return bodyRows.map(values => {
    const record = {} as MerchantRow;
    MERCHANT_FEED_ROW_HEADERS.forEach(header => {
      const headerIndex = headers.indexOf(header);
      record[header] = headerIndex >= 0 ? (values[headerIndex] ?? "") : "";
    });
    return record;
  });
};

const normalizeProductCode = (productCode: string) =>
  productCode.trim().toUpperCase();

const engine6ProductCodesInCsv = (
  rows: MerchantFeedCsvRow[],
  engine6Codes: Set<string>
) =>
  rows.filter(row => engine6Codes.has(normalizeProductCode(row.id))).length;

export const summarizeProductCommercialRefresh = (
  audit: MerchantFeedCommercialRefreshAudit
): MerchantFeedCommercialBackfillSummary => {
  const refreshedByProduct = new Map<
    string,
    Set<MerchantFeedCommercialRefreshField>
  >();
  for (const entry of audit.fieldsRefreshed) {
    const productCode = normalizeProductCode(entry.productCode);
    const fields =
      refreshedByProduct.get(productCode) ??
      new Set<MerchantFeedCommercialRefreshField>();
    fields.add(entry.field);
    refreshedByProduct.set(productCode, fields);
  }

  const preservedByProduct = new Map<
    string,
    Map<
      MerchantFeedCommercialRefreshField,
      "live-unavailable" | "live-value-unchanged"
    >
  >();
  for (const entry of audit.fieldsPreserved) {
    const productCode = normalizeProductCode(entry.productCode);
    const fields =
      preservedByProduct.get(productCode) ??
      new Map<
        MerchantFeedCommercialRefreshField,
        "live-unavailable" | "live-value-unchanged"
      >();
    fields.set(entry.field, entry.reason);
    preservedByProduct.set(productCode, fields);
  }

  const unavailableReasonByProduct = new Map<string, string>();
  for (const entry of audit.unavailableLiveValues) {
    const productCode = normalizeProductCode(entry.productCode);
    if (!unavailableReasonByProduct.has(productCode)) {
      unavailableReasonByProduct.set(productCode, entry.reason);
    }
  }

  const allProductCodes = new Set<string>([
    ...refreshedByProduct.keys(),
    ...preservedByProduct.keys(),
  ]);

  const productsSuccessfullyRefreshed: string[] = [];
  const productsUnchanged: string[] = [];
  const productsWithUpdatedPrice: string[] = [];
  const productsWithUpdatedRating: string[] = [];
  const productsWithUpdatedReviewCount: string[] = [];
  const productsCouldNotRefresh: Array<{ productCode: string; reason: string }> =
    [];

  for (const productCode of [...allProductCodes].sort()) {
    const refreshedFields = refreshedByProduct.get(productCode);
    if (refreshedFields && refreshedFields.size > 0) {
      productsSuccessfullyRefreshed.push(productCode);
      if (refreshedFields.has("price")) {
        productsWithUpdatedPrice.push(productCode);
      }
      if (refreshedFields.has("average_rating")) {
        productsWithUpdatedRating.push(productCode);
      }
      if (refreshedFields.has("review_count")) {
        productsWithUpdatedReviewCount.push(productCode);
      }
      continue;
    }

    const preservedFields = preservedByProduct.get(productCode);
    const allUnavailable =
      preservedFields &&
      [...preservedFields.values()].every(
        reason => reason === "live-unavailable"
      );

    if (allUnavailable) {
      productsCouldNotRefresh.push({
        productCode,
        reason:
          unavailableReasonByProduct.get(productCode) ??
          "live source unavailable for all commercial fields",
      });
      continue;
    }

    productsUnchanged.push(productCode);
  }

  return {
    productsScanned: audit.productsChecked,
    productsSuccessfullyRefreshed,
    productsUnchanged,
    productsWithUpdatedPrice,
    productsWithUpdatedRating,
    productsWithUpdatedReviewCount,
    productsCouldNotRefresh,
  };
};

export const formatMerchantFeedCommercialBackfillReport = (
  summary: MerchantFeedCommercialBackfillSummary
) => {
  const lines = [
    "Engine6 merchant feed commercial refresh backfill audit",
    "",
    `- Products scanned: ${summary.productsScanned}`,
    `- Products successfully refreshed: ${summary.productsSuccessfullyRefreshed.length}`,
    `- Products unchanged: ${summary.productsUnchanged.length}`,
    `- Products with updated price: ${summary.productsWithUpdatedPrice.length}`,
    `- Products with updated rating: ${summary.productsWithUpdatedRating.length}`,
    `- Products with updated review count: ${summary.productsWithUpdatedReviewCount.length}`,
    `- Products that could not be refreshed: ${summary.productsCouldNotRefresh.length}`,
    "",
    MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE,
  ];

  if (summary.productsWithUpdatedPrice.length > 0) {
    lines.push("", "Price updates:");
    for (const productCode of summary.productsWithUpdatedPrice.slice(0, 30)) {
      lines.push(`  ${productCode}`);
    }
    if (summary.productsWithUpdatedPrice.length > 30) {
      lines.push(
        `  ...and ${summary.productsWithUpdatedPrice.length - 30} more.`
      );
    }
  }

  if (summary.productsWithUpdatedRating.length > 0) {
    lines.push("", "Rating updates:");
    for (const productCode of summary.productsWithUpdatedRating.slice(0, 30)) {
      lines.push(`  ${productCode}`);
    }
    if (summary.productsWithUpdatedRating.length > 30) {
      lines.push(
        `  ...and ${summary.productsWithUpdatedRating.length - 30} more.`
      );
    }
  }

  if (summary.productsWithUpdatedReviewCount.length > 0) {
    lines.push("", "Review count updates:");
    for (const productCode of summary.productsWithUpdatedReviewCount.slice(
      0,
      30
    )) {
      lines.push(`  ${productCode}`);
    }
    if (summary.productsWithUpdatedReviewCount.length > 30) {
      lines.push(
        `  ...and ${summary.productsWithUpdatedReviewCount.length - 30} more.`
      );
    }
  }

  if (summary.productsCouldNotRefresh.length > 0) {
    lines.push("", "Could not refresh (existing CSV values retained):");
    for (const entry of summary.productsCouldNotRefresh) {
      lines.push(`  ${entry.productCode}: ${entry.reason}`);
    }
  }

  return lines.join("\n");
};

export const resolveMerchantFeedCommercialRefreshPolicy = (
  mode: MerchantFeedCommercialRefreshMode = "generation"
): MerchantFeedCommercialRefreshPolicy => {
  if (hasEngine6ViatorApiCredentials()) {
    return { action: "refresh" };
  }

  const runtime = isVercelRuntime() ? "vercel" : "local";

  if (mode === "backfill") {
    if (runtime === "local") {
      return {
        action: "skip",
        reason: MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE,
      };
    }

    return {
      action: "fail",
      reason:
        "Engine6 Viator API credentials are unavailable in the Vercel environment.",
    };
  }

  const requiresLive = requireLiveMerchantCommercial();
  const runtimeBaseUrl = resolveRuntimeCommercialBaseUrl();

  if (!requiresLive) {
    return {
      action: "skip",
      reason: MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE,
    };
  }

  if (runtimeBaseUrl) {
    return {
      action: "skip",
      reason: MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE,
    };
  }

  return {
    action: "fail",
    reason:
      "Merchant feed production build requires VIATOR_API_KEY for live commercial resolution.",
  };
};

export const applyMerchantFeedCommercialRefresh = async <
  TRow extends MerchantFeedCsvRow,
>(
  options: ApplyMerchantFeedCommercialRefreshOptions<TRow>
): Promise<ApplyMerchantFeedCommercialRefreshResult<TRow>> => {
  const mode = options.mode ?? "generation";
  const policy = resolveMerchantFeedCommercialRefreshPolicy(mode);

  if (policy.action === "skip") {
    console.log(`[merchant-feed-build] ${policy.reason}`);
    if (
      mode === "generation" &&
      requireLiveMerchantCommercial() &&
      resolveRuntimeCommercialBaseUrl()
    ) {
      console.warn(
        "[merchant-feed-build] MERCHANT_FEED_RUNTIME_BASE_URL is configured for schema overlay only; live commercial refresh requires direct Viator credentials."
      );
    }

    return {
      skipped: true,
      skipMessage: policy.reason,
      rows: options.rows,
      audit: null,
      summary: null,
      report: policy.reason,
    };
  }

  if (policy.action === "fail") {
    throw new Error(policy.reason);
  }

  const engine6Codes = new Set(
    merchantFeedEligibleTours.map(tour =>
      tour.productCode.trim().toUpperCase()
    )
  );
  const engine6RowsInCsv = engine6ProductCodesInCsv(
    options.baselineRows,
    engine6Codes
  );

  let progress = 0;
  const diagnoseWithProgress = async (productCode: string) => {
    progress += 1;
    options.onProgress?.({
      productCode,
      completed: progress,
      total: engine6RowsInCsv,
    });
    return diagnoseEngine6ViatorProductCommercialExtract(productCode);
  };

  const result = await refreshExistingMerchantFeedCommercialFields(
    options.rows,
    options.baselineRows,
    diagnoseWithProgress
  );

  for (let index = 0; index < options.rows.length; index += 1) {
    const before = options.rows[index]!;
    const after = result.rows[index]!;
    if (!merchantFeedCommercialRefreshOnlyFieldsChanged(before, after)) {
      throw new Error(
        `Non-commercial field drift detected for ${before.id} after commercial refresh.`
      );
    }
  }

  const summary = summarizeProductCommercialRefresh(result.audit);
  const report = formatMerchantFeedCommercialBackfillReport(summary);

  return {
    skipped: false,
    rows: result.rows as TRow[],
    audit: result.audit,
    summary,
    report,
  };
};

/**
 * Refreshes live commercial fields for existing Engine6 merchant-feed rows using
 * the same server-side Viator credential path as Engine6 live diagnostics
 * (`resolveViatorApiConfig` + `diagnoseEngine6ViatorProductCommercialExtract`).
 *
 * When credentials are unavailable outside Vercel, returns a skipped result
 * instead of throwing.
 */
export const runMerchantFeedCommercialBackfill = async (
  options: RunMerchantFeedCommercialBackfillOptions = {}
): Promise<MerchantFeedCommercialBackfillResult> => {
  const runtime = isVercelRuntime() ? "vercel" : "local";
  const viatorApiConfig = describeViatorApiConfigEnvVisibility();
  const { merchantFeedPath, auditPath } = resolveMerchantFeedCommercialBackfillPaths();
  const resolvedMerchantFeedPath = options.merchantFeedPath ?? merchantFeedPath;
  const resolvedAuditPath = options.auditPath ?? auditPath;

  const csvContent = await readFile(resolvedMerchantFeedPath, "utf8");
  const baselineRows = parseCsv(csvContent) as MerchantFeedCsvRow[];

  const refreshResult = await applyMerchantFeedCommercialRefresh({
    rows: baselineRows,
    baselineRows,
    mode: "backfill",
    onProgress: options.onProgress,
  });

  if (refreshResult.skipped) {
    return {
      status: "skipped",
      reason: refreshResult.skipMessage,
      runtime,
      viatorApiConfig,
    };
  }

  await mkdir(path.dirname(resolvedAuditPath), { recursive: true });
  await writeFile(
    resolvedAuditPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        runtime,
        merchantFeedPath: resolvedMerchantFeedPath,
        viatorApiConfig,
        summary: refreshResult.summary,
        fieldLevelAudit: refreshResult.audit,
      },
      null,
      2
    ),
    "utf8"
  );

  await writeFile(
    resolvedMerchantFeedPath,
    toCsv(refreshResult.rows as MerchantRow[]),
    "utf8"
  );

  return {
    status: "completed",
    runtime,
    merchantFeedPath: resolvedMerchantFeedPath,
    auditPath: resolvedAuditPath,
    viatorApiConfig,
    summary: refreshResult.summary,
    fieldLevelAudit: refreshResult.audit,
    report: refreshResult.report,
  };
};
