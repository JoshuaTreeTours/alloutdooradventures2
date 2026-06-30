import { DEFAULT_CURRENCY } from "../../src/constants/merchantDefaults.js";
import { formatMerchantPrice } from "../../src/utils/merchantPricing.js";
import type { MerchantFeedCsvRow } from "./merchantFeedChangeScopeGovernance.js";
import { MERCHANT_FEED_ROW_HEADERS } from "./merchantFeedChangeScopeGovernance.js";
import type { Engine6ViatorProductCommercialDiagnostic } from "./resolveEngine6ViatorProductCommercialExtract.js";

/**
 * Commercial fields automatically refreshed from the live authoritative Viator
 * source on every successful Engine6 merchant-feed generation. All other CSV
 * columns are preserved from the existing row.
 *
 * `rating_count` is not a fourth independently refreshed field. It is maintained
 * as a synchronized mirror of `review_count` for merchant-feed compatibility
 * and changes only when `review_count` changes.
 */
export const MERCHANT_FEED_COMMERCIAL_REFRESH_FIELDS = [
  "price",
  "average_rating",
  "review_count",
] as const;

/** Documented in every commercial refresh audit report. */
export const MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE =
  "rating_count is maintained as a synchronized mirror of review_count for merchant-feed compatibility. No independent live refresh of rating_count is performed; it changes only when review_count changes.";

export type MerchantFeedCommercialRefreshField =
  (typeof MERCHANT_FEED_COMMERCIAL_REFRESH_FIELDS)[number];

export type MerchantFeedCommercialRefreshFieldChange = {
  productCode: string;
  field: MerchantFeedCommercialRefreshField;
  previousValue: string;
  refreshedValue: string;
};

export type MerchantFeedCommercialRefreshPreservedField = {
  productCode: string;
  field: MerchantFeedCommercialRefreshField;
  value: string;
  reason: "live-unavailable" | "live-value-unchanged";
};

export type MerchantFeedCommercialRefreshUnavailableLiveValue = {
  productCode: string;
  field: MerchantFeedCommercialRefreshField;
  reason: string;
  preservedValue: string;
};

export type MerchantFeedCommercialRefreshAudit = {
  productsChecked: number;
  fieldsRefreshed: MerchantFeedCommercialRefreshFieldChange[];
  fieldsPreserved: MerchantFeedCommercialRefreshPreservedField[];
  unavailableLiveValues: MerchantFeedCommercialRefreshUnavailableLiveValue[];
};

export type MerchantFeedCommercialRefreshResult<
  TRow extends MerchantFeedCsvRow,
> = {
  rows: TRow[];
  audit: MerchantFeedCommercialRefreshAudit;
};

const normalizeProductCode = (productCode: string) =>
  productCode.trim().toUpperCase();

const formatMerchantRating = (value: number) => value.toFixed(1);
const formatMerchantCount = (value: number) => String(Math.trunc(value));

const parseCurrencyFromMerchantPrice = (price: string) => {
  const match = price.trim().match(/\s([A-Z]{3})$/);
  return match?.[1] ?? DEFAULT_CURRENCY;
};

const isLivePriceAvailable = (
  diagnostic: Engine6ViatorProductCommercialDiagnostic
) =>
  diagnostic.commercial.source === "live-api" &&
  diagnostic.pricingAvailable &&
  typeof diagnostic.commercial.priceAmount === "number" &&
  Number.isFinite(diagnostic.commercial.priceAmount) &&
  diagnostic.commercial.priceAmount > 0;

const isLiveRatingAvailable = (
  diagnostic: Engine6ViatorProductCommercialDiagnostic
) =>
  diagnostic.commercial.source === "live-api" &&
  diagnostic.ratingAvailable &&
  typeof diagnostic.commercial.aggregateRating === "number" &&
  Number.isFinite(diagnostic.commercial.aggregateRating);

const isLiveReviewCountAvailable = (
  diagnostic: Engine6ViatorProductCommercialDiagnostic
) =>
  diagnostic.commercial.source === "live-api" &&
  diagnostic.reviewCountAvailable &&
  typeof diagnostic.commercial.reviewCount === "number" &&
  Number.isFinite(diagnostic.commercial.reviewCount);

const liveUnavailableReason = (
  diagnostic: Engine6ViatorProductCommercialDiagnostic
) => {
  if (diagnostic.commercial.source !== "live-api") {
    return `live source unavailable (${diagnostic.failureReason})`;
  }

  return diagnostic.failureReason;
};

const nonCommercialRefreshHeaders = () =>
  MERCHANT_FEED_ROW_HEADERS.filter(
    header =>
      !MERCHANT_FEED_COMMERCIAL_REFRESH_FIELDS.includes(
        header as MerchantFeedCommercialRefreshField
      ) && header !== "rating_count"
  );

/** Fields that must remain identical before and after commercial refresh. */
export const merchantFeedNonCommercialRefreshHeaders = () =>
  nonCommercialRefreshHeaders();

export const merchantFeedCommercialRefreshOnlyFieldsChanged = (
  before: MerchantFeedCsvRow,
  after: MerchantFeedCsvRow
) => {
  for (const header of nonCommercialRefreshHeaders()) {
    if ((before[header] ?? "") !== (after[header] ?? "")) {
      return false;
    }
  }

  const reviewCountChanged =
    (before.review_count ?? "") !== (after.review_count ?? "");
  const ratingCountChanged =
    (before.rating_count ?? "") !== (after.rating_count ?? "");

  if (reviewCountChanged !== ratingCountChanged) {
    return false;
  }

  if (reviewCountChanged && before.rating_count !== before.review_count) {
    // rating_count may only change when review_count changes and must stay paired.
    if (after.rating_count !== after.review_count) {
      return false;
    }
  }

  return true;
};

const applyLiveCommercialRefreshToRow = <
  TRow extends MerchantFeedCsvRow,
>(args: {
  row: TRow;
  fallbackRow: MerchantFeedCsvRow;
  diagnostic: Engine6ViatorProductCommercialDiagnostic;
  audit: MerchantFeedCommercialRefreshAudit;
}) => {
  const productCode = normalizeProductCode(args.row.id);
  const refreshed = { ...args.row };

  const refreshField = (
    field: MerchantFeedCommercialRefreshField,
    nextValue: string,
    liveAvailable: boolean,
    unavailableReason: string
  ) => {
    const previousValue = args.fallbackRow[field] ?? "";

    if (!liveAvailable) {
      refreshed[field] = previousValue;
      args.audit.fieldsPreserved.push({
        productCode,
        field,
        value: previousValue,
        reason: "live-unavailable",
      });
      args.audit.unavailableLiveValues.push({
        productCode,
        field,
        reason: unavailableReason,
        preservedValue: previousValue,
      });
      return;
    }

    if (nextValue === previousValue) {
      refreshed[field] = previousValue;
      args.audit.fieldsPreserved.push({
        productCode,
        field,
        value: previousValue,
        reason: "live-value-unchanged",
      });
      return;
    }

    refreshed[field] = nextValue;
    args.audit.fieldsRefreshed.push({
      productCode,
      field,
      previousValue,
      refreshedValue: nextValue,
    });
  };

  const unavailableReason = liveUnavailableReason(args.diagnostic);

  refreshField(
    "price",
    formatMerchantPrice(
      args.diagnostic.commercial.priceAmount,
      parseCurrencyFromMerchantPrice(args.fallbackRow.price)
    ),
    isLivePriceAvailable(args.diagnostic),
    unavailableReason
  );

  refreshField(
    "average_rating",
    isLiveRatingAvailable(args.diagnostic)
      ? formatMerchantRating(args.diagnostic.commercial.aggregateRating!)
      : args.fallbackRow.average_rating ?? "",
    isLiveRatingAvailable(args.diagnostic),
    unavailableReason
  );

  const reviewCountLive = isLiveReviewCountAvailable(args.diagnostic);
  const nextReviewCount = reviewCountLive
    ? formatMerchantCount(args.diagnostic.commercial.reviewCount!)
    : args.fallbackRow.review_count ?? "";

  refreshField(
    "review_count",
    nextReviewCount,
    reviewCountLive,
    unavailableReason
  );

  // rating_count is not independently refreshed from live; mirror review_count only.
  if (reviewCountLive && nextReviewCount !== (args.fallbackRow.review_count ?? "")) {
    refreshed.rating_count = nextReviewCount;
  } else if (reviewCountLive && nextReviewCount === (args.fallbackRow.review_count ?? "")) {
    refreshed.rating_count = args.fallbackRow.rating_count ?? "";
  } else {
    refreshed.rating_count = args.fallbackRow.rating_count ?? "";
  }

  return refreshed;
};

/**
 * Refreshes live commercial values for existing Engine6 merchant-feed rows while
 * preserving row order, product identity, routing, and every non-commercial column.
 */
export const refreshExistingMerchantFeedCommercialFields = async <
  TRow extends MerchantFeedCsvRow,
>(
  rows: TRow[],
  existingBaselineRows: MerchantFeedCsvRow[],
  diagnose: (
    productCode: string
  ) => Promise<Engine6ViatorProductCommercialDiagnostic>
): Promise<MerchantFeedCommercialRefreshResult<TRow>> => {
  const existingProductCodes = new Set<string>();
  const fallbackByProductCode = new Map<string, MerchantFeedCsvRow>();

  for (const row of existingBaselineRows) {
    const productCode = normalizeProductCode(row.id);
    if (!productCode) {
      continue;
    }

    existingProductCodes.add(productCode);
    fallbackByProductCode.set(productCode, row);
  }

  const audit: MerchantFeedCommercialRefreshAudit = {
    productsChecked: 0,
    fieldsRefreshed: [],
    fieldsPreserved: [],
    unavailableLiveValues: [],
  };

  const refreshedRows: TRow[] = [];

  for (const row of rows) {
    const productCode = normalizeProductCode(row.id);
    const fallbackRow = fallbackByProductCode.get(productCode);

    if (!productCode || !fallbackRow || !existingProductCodes.has(productCode)) {
      refreshedRows.push({ ...row });
      continue;
    }

    audit.productsChecked += 1;
    const diagnostic = await diagnose(productCode);
    refreshedRows.push(
      applyLiveCommercialRefreshToRow({
        row,
        fallbackRow,
        diagnostic,
        audit,
      })
    );
  }

  return {
    rows: refreshedRows,
    audit,
  };
};

export const formatMerchantFeedCommercialRefreshAuditReport = (
  audit: MerchantFeedCommercialRefreshAudit
) => {
  const lines = [
    "Engine6 merchant feed commercial refresh audit:",
    `- products checked: ${audit.productsChecked}`,
    `- fields refreshed: ${audit.fieldsRefreshed.length}`,
    `- fields preserved: ${audit.fieldsPreserved.length}`,
    `- unavailable live values: ${audit.unavailableLiveValues.length}`,
    "",
    MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE,
  ];

  if (audit.fieldsRefreshed.length > 0) {
    lines.push("", "Refreshed fields:");
    for (const entry of audit.fieldsRefreshed.slice(0, 25)) {
      lines.push(
        `  ${entry.productCode}.${entry.field}: ${entry.previousValue} -> ${entry.refreshedValue}`
      );
    }
    if (audit.fieldsRefreshed.length > 25) {
      lines.push(
        `  ...and ${audit.fieldsRefreshed.length - 25} additional refreshed field(s).`
      );
    }
  }

  if (audit.unavailableLiveValues.length > 0) {
    lines.push("", "Unavailable live values (preserved existing CSV values):");
    for (const entry of audit.unavailableLiveValues.slice(0, 25)) {
      lines.push(
        `  ${entry.productCode}.${entry.field}: preserved=${entry.preservedValue} (${entry.reason})`
      );
    }
    if (audit.unavailableLiveValues.length > 25) {
      lines.push(
        `  ...and ${audit.unavailableLiveValues.length - 25} additional unavailable live value(s).`
      );
    }
  }

  return lines.join("\n");
};
