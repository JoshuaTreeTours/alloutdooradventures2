import { MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS } from "../../src/engine6/merchantFeedParity.js";

/**
 * Forward-looking change-scope governance prevents destination PRs from
 * unintentionally rewriting existing merchantFeed.csv rows during catalog
 * expansion. Standard PRs may append new rows and edit only branch-scoped
 * products. Existing rows stay byte-for-byte identical unless the PR is an
 * explicitly documented governance PR.
 */
export const MERCHANT_FEED_GOVERNANCE_PURPOSES = [
  "editorial-governance",
  "commercial-governance",
  "schema-governance",
  "image-governance",
  "routing-governance",
  "parity-governance",
] as const;

export type MerchantFeedGovernancePurpose =
  (typeof MERCHANT_FEED_GOVERNANCE_PURPOSES)[number];

export const MERCHANT_FEED_ROW_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

export type MerchantFeedCsvRow = Record<
  (typeof MERCHANT_FEED_ROW_HEADERS)[number],
  string
>;

export type MerchantFeedChangeScopeContext = {
  /** New routes or artifacts explicitly scoped to this branch. */
  branchModifiedProductCodes: ReadonlySet<string>;
  /** When set, the PR is a governance PR that may regenerate existing rows. */
  governancePurpose?: MerchantFeedGovernancePurpose;
  /** Existing product codes authorized for regeneration under governancePurpose. */
  governanceRegenerationProductCodes?: ReadonlySet<string>;
  /** Required documentation explaining why regeneration is required. */
  governanceRegenerationReason?: string;
};

export type MerchantFeedChangeScopeViolationKind =
  | "removed-row"
  | "unchanged-row-modified"
  | "commercial-field-modified"
  | "governance-regeneration-unauthorized"
  | "governance-regeneration-undocumented";

export type MerchantFeedChangeScopeViolation = {
  productCode: string;
  kind: MerchantFeedChangeScopeViolationKind;
  detail: string;
};

export type MerchantFeedChangeScopeValidationResult = {
  pass: boolean;
  violations: MerchantFeedChangeScopeViolation[];
  appendedProductCodes: string[];
  preservedExistingRowCount: number;
};

const normalizeProductCode = (productCode: string) =>
  productCode.trim().toUpperCase();

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

export const serializeMerchantFeedCsvRow = (row: MerchantFeedCsvRow): string =>
  MERCHANT_FEED_ROW_HEADERS.map(header =>
    escapeCsv(row[header] ?? "")
  ).join(",");

export const merchantFeedCsvRowsByteIdentical = (
  left: MerchantFeedCsvRow,
  right: MerchantFeedCsvRow
) => serializeMerchantFeedCsvRow(left) === serializeMerchantFeedCsvRow(right);

export const parseMerchantFeedCsvRows = (content: string): MerchantFeedCsvRow[] => {
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
    const record = {} as MerchantFeedCsvRow;
    for (const header of MERCHANT_FEED_ROW_HEADERS) {
      const headerIndex = headers.indexOf(header);
      record[header] = headerIndex >= 0 ? (values[headerIndex] ?? "") : "";
    }
    return record;
  });
};

export const isMerchantFeedGovernancePurpose = (
  value: string | undefined
): value is MerchantFeedGovernancePurpose =>
  MERCHANT_FEED_GOVERNANCE_PURPOSES.includes(
    value as MerchantFeedGovernancePurpose
  );

const commercialFieldsChanged = (
  baselineRow: MerchantFeedCsvRow,
  proposedRow: MerchantFeedCsvRow
) =>
  MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS.some(
    field => (baselineRow[field] ?? "") !== (proposedRow[field] ?? "")
  );

const changedNonCommercialFields = (
  baselineRow: MerchantFeedCsvRow,
  proposedRow: MerchantFeedCsvRow
) =>
  MERCHANT_FEED_ROW_HEADERS.filter(
    header =>
      !MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS.includes(
        header as (typeof MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS)[number]
      ) && (baselineRow[header] ?? "") !== (proposedRow[header] ?? "")
  );

const isGovernanceRegenerationAuthorized = (
  productCode: string,
  context: MerchantFeedChangeScopeContext
) => {
  if (!context.governancePurpose) {
    return false;
  }

  const reason = context.governanceRegenerationReason?.trim() ?? "";
  if (!reason) {
    return false;
  }

  return context.governanceRegenerationProductCodes?.has(productCode) ?? false;
};

const isStandardBranchScopedModificationAllowed = (
  productCode: string,
  context: MerchantFeedChangeScopeContext
) => context.branchModifiedProductCodes.has(productCode);

const isFullRowRegenerationAllowed = (
  productCode: string,
  context: MerchantFeedChangeScopeContext
) =>
  isStandardBranchScopedModificationAllowed(productCode, context) ||
  isGovernanceRegenerationAuthorized(productCode, context);

/** Non-commercial columns from baseline; commercial columns from proposed. */
export const mergeMerchantFeedBaselineNonCommercialWithProposedCommercial = <
  TRow extends MerchantFeedCsvRow,
>(
  baselineRow: TRow,
  proposedRow: TRow
): TRow => {
  const merged = { ...baselineRow };

  for (const field of MERCHANT_FEED_COMMERCIAL_PARITY_FIELDS) {
    merged[field] = proposedRow[field] ?? "";
  }

  return merged;
};

export type MerchantFeedChangeScopePreservationResult = {
  rows: MerchantFeedCsvRow[];
  /** Existing products whose regenerated non-commercial columns were restored from baseline. */
  preservedNonCommercialProductCodes: string[];
  appendedProductCodes: string[];
};

/**
 * Production merchant-feed builds reconcile live commercial values first, then
 * restore baseline non-commercial columns for unchanged catalog products so
 * deploy-time regeneration cannot drift titles, descriptions, heroes, or links.
 * Branch-scoped and governance-authorized products keep full proposed rows.
 */
export const applyMerchantFeedChangeScopePreservingNonCommercial = (
  baselineRows: MerchantFeedCsvRow[],
  proposedRows: MerchantFeedCsvRow[],
  context: MerchantFeedChangeScopeContext
): MerchantFeedChangeScopePreservationResult => {
  const baselineByProductCode = new Map<string, MerchantFeedCsvRow>();
  const proposedByProductCode = new Map<string, MerchantFeedCsvRow>();
  const preservedNonCommercialProductCodes: string[] = [];
  const rows: MerchantFeedCsvRow[] = [];

  for (const row of baselineRows) {
    const productCode = normalizeProductCode(row.id);
    if (productCode) {
      baselineByProductCode.set(productCode, row);
    }
  }

  for (const row of proposedRows) {
    const productCode = normalizeProductCode(row.id);
    if (productCode) {
      proposedByProductCode.set(productCode, row);
    }
  }

  for (const baselineRow of baselineRows) {
    const productCode = normalizeProductCode(baselineRow.id);
    const proposedRow = proposedByProductCode.get(productCode);

    if (!proposedRow) {
      rows.push({ ...baselineRow });
      continue;
    }

    if (isFullRowRegenerationAllowed(productCode, context)) {
      rows.push({ ...proposedRow });
      continue;
    }

    const nonCommercialChanged = changedNonCommercialFields(
      baselineRow,
      proposedRow
    );

    if (nonCommercialChanged.length > 0) {
      preservedNonCommercialProductCodes.push(productCode);
    }

    rows.push(
      mergeMerchantFeedBaselineNonCommercialWithProposedCommercial(
        baselineRow,
        proposedRow
      )
    );
  }

  const appendedProductCodes = Array.from(proposedByProductCode.keys()).filter(
    productCode => !baselineByProductCode.has(productCode)
  );

  for (const productCode of appendedProductCodes) {
    const appendedRow = proposedByProductCode.get(productCode);
    if (appendedRow) {
      rows.push({ ...appendedRow });
    }
  }

  return {
    rows,
    preservedNonCommercialProductCodes,
    appendedProductCodes,
  };
};

/**
 * Validates that proposed merchant feed output respects branch change scope.
 * Baseline rows represent the published main-branch merchantFeed.csv catalog.
 */
export const validateMerchantFeedChangeScope = (
  baselineRows: MerchantFeedCsvRow[],
  proposedRows: MerchantFeedCsvRow[],
  context: MerchantFeedChangeScopeContext
): MerchantFeedChangeScopeValidationResult => {
  const violations: MerchantFeedChangeScopeViolation[] = [];
  const baselineByProductCode = new Map<string, MerchantFeedCsvRow>();
  const proposedByProductCode = new Map<string, MerchantFeedCsvRow>();

  for (const row of baselineRows) {
    const productCode = normalizeProductCode(row.id);
    if (productCode) {
      baselineByProductCode.set(productCode, row);
    }
  }

  for (const row of proposedRows) {
    const productCode = normalizeProductCode(row.id);
    if (productCode) {
      proposedByProductCode.set(productCode, row);
    }
  }

  for (const [productCode, baselineRow] of Array.from(
    baselineByProductCode.entries()
  )) {
    const proposedRow = proposedByProductCode.get(productCode);
    if (!proposedRow) {
      violations.push({
        productCode,
        kind: "removed-row",
        detail:
          "existing merchant feed row removed; destination PRs may only append new rows",
      });
      continue;
    }

    if (merchantFeedCsvRowsByteIdentical(baselineRow, proposedRow)) {
      continue;
    }

    const commercialChanged = commercialFieldsChanged(baselineRow, proposedRow);
    const nonCommercialChanged = changedNonCommercialFields(
      baselineRow,
      proposedRow
    );

    if (commercialChanged) {
      const commercialGovernanceAllowed =
        context.governancePurpose === "commercial-governance" &&
        isGovernanceRegenerationAuthorized(productCode, context);

      if (!commercialGovernanceAllowed) {
        violations.push({
          productCode,
          kind: "commercial-field-modified",
          detail:
            "commercial fields are protected; only commercial-governance PRs may regenerate existing commercial values when explicitly authorized",
        });
        continue;
      }
    }

    if (nonCommercialChanged.length === 0) {
      continue;
    }

    if (isStandardBranchScopedModificationAllowed(productCode, context)) {
      continue;
    }

    if (isGovernanceRegenerationAuthorized(productCode, context)) {
      continue;
    }

    if (context.governancePurpose && !context.governanceRegenerationReason?.trim()) {
      violations.push({
        productCode,
        kind: "governance-regeneration-undocumented",
        detail:
          "governance PRs must document why existing row regeneration is required",
      });
      continue;
    }

    if (context.governancePurpose) {
      violations.push({
        productCode,
        kind: "governance-regeneration-unauthorized",
        detail:
          "existing row regeneration requires explicit governanceRegenerationProductCodes authorization",
      });
      continue;
    }

    violations.push({
      productCode,
      kind: "unchanged-row-modified",
      detail:
        "existing merchant feed row changed outside branch scope; destination PRs must preserve baseline rows byte-for-byte",
    });
  }

  const appendedProductCodes = Array.from(proposedByProductCode.keys()).filter(
    productCode => !baselineByProductCode.has(productCode)
  );

  return {
    pass: violations.length === 0,
    violations,
    appendedProductCodes,
    preservedExistingRowCount: baselineByProductCode.size,
  };
};

/**
 * Applies change-scope policy to proposed rows, restoring baseline rows that
 * fall outside branch or governance authorization.
 */
export const enforceMerchantFeedChangeScope = (
  baselineRows: MerchantFeedCsvRow[],
  proposedRows: MerchantFeedCsvRow[],
  context: MerchantFeedChangeScopeContext
): MerchantFeedCsvRow[] => {
  const validation = validateMerchantFeedChangeScope(
    baselineRows,
    proposedRows,
    context
  );
  if (validation.pass) {
    return proposedRows;
  }

  const baselineByProductCode = new Map(
    baselineRows.map(row => [normalizeProductCode(row.id), row])
  );
  const proposedByProductCode = new Map(
    proposedRows.map(row => [normalizeProductCode(row.id), row])
  );
  const blockedProductCodes = new Set(
    validation.violations.map(violation => violation.productCode)
  );

  const enforcedRows: MerchantFeedCsvRow[] = [];

  for (const baselineRow of baselineRows) {
    const productCode = normalizeProductCode(baselineRow.id);
    if (blockedProductCodes.has(productCode)) {
      enforcedRows.push({ ...baselineRow });
      continue;
    }

    enforcedRows.push(proposedByProductCode.get(productCode) ?? { ...baselineRow });
  }

  for (const productCode of validation.appendedProductCodes) {
    const appendedRow = proposedByProductCode.get(productCode);
    if (appendedRow) {
      enforcedRows.push({ ...appendedRow });
    }
  }

  return enforcedRows;
};
