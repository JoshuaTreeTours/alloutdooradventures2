import {
  passesMerchantFeedLiveCommercialGuard,
  type Engine6ViatorProductCommercialDiagnostic,
} from "./resolveEngine6ViatorProductCommercialExtract.js";

/**
 * Forward-looking merchant-feed governance uses the published merchantFeed.csv catalog
 * as the legacy baseline. Production deployments validate the work introduced by
 * the current branch: unchanged baseline products remain continuously audited but
 * are not blocked by historical runtime parity drift or bundled-fallback during
 * catalog preservation builds. New products and intentional commercial updates
 * must satisfy strict live governance before publication.
 */
export type MerchantFeedCommercialSnapshot = {
  price: string;
  averageRating: string;
  ratingCount: string;
  reviewCount: string;
};

export type MerchantFeedPublishedBaselineCatalog = Map<
  string,
  MerchantFeedCommercialSnapshot
>;

export type MerchantFeedGovernanceTier =
  | "unchanged-legacy-baseline"
  | "modified-commercial"
  | "new-product";

export type MerchantFeedLiveRuntimeParityDrift = {
  productCode: string;
};

export type MerchantFeedLiveRuntimeParityBuildEvaluation = {
  pass: boolean;
  informationalLegacyProductCodes: string[];
  blockingDriftCount: number;
};

const normalizeProductCode = (productCode: string) =>
  productCode.trim().toUpperCase();

const normalizeCommercialField = (value: string | undefined) =>
  (value ?? "").trim();

export const snapshotMerchantFeedCommercial = (row: {
  price?: string;
  average_rating?: string;
  rating_count?: string;
  review_count?: string;
}): MerchantFeedCommercialSnapshot => ({
  price: normalizeCommercialField(row.price),
  averageRating: normalizeCommercialField(row.average_rating),
  ratingCount: normalizeCommercialField(row.rating_count),
  reviewCount: normalizeCommercialField(row.review_count),
});

export const merchantFeedCommercialSnapshotsEqual = (
  left: MerchantFeedCommercialSnapshot,
  right: MerchantFeedCommercialSnapshot
) =>
  left.price === right.price &&
  left.averageRating === right.averageRating &&
  left.ratingCount === right.ratingCount &&
  left.reviewCount === right.reviewCount;

export const buildMerchantFeedPublishedBaselineCatalog = (
  rows: Array<{
    id: string;
    price?: string;
    average_rating?: string;
    rating_count?: string;
    review_count?: string;
  }>
): MerchantFeedPublishedBaselineCatalog => {
  const catalog: MerchantFeedPublishedBaselineCatalog = new Map();

  for (const row of rows) {
    const productCode = normalizeProductCode(row.id);
    if (!productCode) {
      continue;
    }

    catalog.set(productCode, snapshotMerchantFeedCommercial(row));
  }

  return catalog;
};

/** True when output commercial fields differ from the published baseline snapshot. */
export const isMerchantFeedCommercialModifiedFromBaseline = (
  outputCommercial: MerchantFeedCommercialSnapshot,
  baselineCommercial: MerchantFeedCommercialSnapshot
) =>
  !merchantFeedCommercialSnapshotsEqual(outputCommercial, baselineCommercial);

/**
 * Classifies governance from the current branch scope. A baseline product is
 * modified only when the current branch intentionally changed that product, not
 * merely because live commercial values drifted during regeneration.
 */
export const classifyMerchantFeedGovernanceTier = (
  productCode: string,
  outputCommercial: MerchantFeedCommercialSnapshot,
  baseline: MerchantFeedPublishedBaselineCatalog,
  branchModifiedProductCodes: ReadonlySet<string> = new Set()
): MerchantFeedGovernanceTier => {
  const normalizedProductCode = normalizeProductCode(productCode);
  const baselineCommercial = baseline.get(normalizedProductCode);

  if (!baselineCommercial) {
    return "new-product";
  }

  if (branchModifiedProductCodes.has(normalizedProductCode)) {
    return "modified-commercial";
  }

  if (
    isMerchantFeedCommercialModifiedFromBaseline(
      outputCommercial,
      baselineCommercial
    )
  ) {
    return "unchanged-legacy-baseline";
  }

  return "unchanged-legacy-baseline";
};

export const requiresStrictMerchantFeedLiveCommercialGuard = (
  tier: MerchantFeedGovernanceTier
) => tier !== "unchanged-legacy-baseline";

export const requiresStrictMerchantFeedRuntimeParity = (
  tier: MerchantFeedGovernanceTier
) => tier !== "unchanged-legacy-baseline";

export const isMerchantFeedProductionRuntimeNotYetPublishedError = (
  error: unknown
): boolean =>
  error instanceof Error &&
  /Live runtime commercial fetch failed for [^:]+: HTTP 422\b/.test(
    error.message
  );

/**
 * Defers production runtime parity fetch failures for unchanged baseline rows and
 * for Engine6 catalog products not yet live on production. Published products keep
 * strict runtime enforcement for non-422 fetch failures and for successful fetches.
 */
export const shouldDeferMerchantFeedProductionRuntimeParityFetch = (context: {
  tier: MerchantFeedGovernanceTier;
  productCode: string;
  error?: unknown;
  notYetPublishedOnProductionProductCodes?: ReadonlySet<string>;
}): boolean => {
  if (!requiresStrictMerchantFeedRuntimeParity(context.tier)) {
    return true;
  }

  const normalizedProductCode = normalizeProductCode(context.productCode);

  if (
    context.notYetPublishedOnProductionProductCodes?.has(normalizedProductCode)
  ) {
    return true;
  }

  return false;
};

export const applyBaselineCommercialToMerchantFeedRow = <
  TRow extends {
    id: string;
    price: string;
    average_rating: string;
    rating_count: string;
    review_count: string;
  },
>(
  row: TRow,
  baseline: MerchantFeedPublishedBaselineCatalog
): TRow => {
  const baselineCommercial = baseline.get(normalizeProductCode(row.id));
  if (!baselineCommercial) {
    return row;
  }

  return {
    ...row,
    price: baselineCommercial.price,
    average_rating: baselineCommercial.averageRating,
    rating_count: baselineCommercial.ratingCount,
    review_count: baselineCommercial.reviewCount,
  };
};

const formatMerchantRating = (value: number) => value.toFixed(1);
const formatMerchantCount = (value: number) => String(Math.trunc(value));

export const applyLiveRatingMetadataToMerchantFeedRow = <
  TRow extends {
    average_rating: string;
    rating_count: string;
    review_count: string;
  },
>(
  row: TRow,
  diagnostic: Engine6ViatorProductCommercialDiagnostic
): TRow => {
  if (!diagnostic.ratingMetadataPresent) {
    return row;
  }

  const { aggregateRating, reviewCount } = diagnostic.commercial;
  if (
    typeof aggregateRating !== "number" ||
    !Number.isFinite(aggregateRating) ||
    typeof reviewCount !== "number" ||
    !Number.isFinite(reviewCount)
  ) {
    return row;
  }

  return {
    ...row,
    average_rating: formatMerchantRating(aggregateRating),
    rating_count: formatMerchantCount(reviewCount),
    review_count: formatMerchantCount(reviewCount),
  };
};

export const passesMerchantFeedLiveCommercialGuardForBuild = (
  diagnostic: Engine6ViatorProductCommercialDiagnostic,
  context: {
    tier: MerchantFeedGovernanceTier;
    baselineCommercial?: MerchantFeedCommercialSnapshot;
  }
): { pass: boolean; reason?: string } => {
  const strict = passesMerchantFeedLiveCommercialGuard(diagnostic);
  if (strict.pass) {
    return strict;
  }

  if (requiresStrictMerchantFeedLiveCommercialGuard(context.tier)) {
    return strict;
  }

  if (diagnostic.commercial.source !== "bundled-fallback") {
    return strict;
  }

  const baselinePrice = context.baselineCommercial?.price ?? "";
  const diagnosticPriceAvailable =
    diagnostic.pricingAvailable ||
    Boolean(normalizeCommercialField(baselinePrice));

  if (!diagnosticPriceAvailable) {
    return {
      pass: false,
      reason: `published baseline requires existing commercial price (price=${diagnostic.commercial.priceAmount ?? (baselinePrice || "null")})`,
    };
  }

  if (
    diagnostic.ratingMetadataPresent &&
    (!diagnostic.ratingAvailable || !diagnostic.reviewCountAvailable)
  ) {
    return strict;
  }

  return {
    pass: true,
    reason:
      "published-baseline-legacy-commercial (TODO: remove once live-api parity is stable for legacy catalog)",
  };
};

export const evaluateMerchantFeedLiveRuntimeParityForBuild = (
  report: { drifts: MerchantFeedLiveRuntimeParityDrift[] },
  governanceByProductCode: Map<string, MerchantFeedGovernanceTier>
): MerchantFeedLiveRuntimeParityBuildEvaluation => {
  const informationalLegacyProductCodes: string[] = [];
  let blockingDriftCount = 0;

  for (const drift of report.drifts) {
    const normalizedProductCode = normalizeProductCode(drift.productCode);
    const tier =
      governanceByProductCode.get(normalizedProductCode) ?? "new-product";

    if (!requiresStrictMerchantFeedRuntimeParity(tier)) {
      if (!informationalLegacyProductCodes.includes(normalizedProductCode)) {
        informationalLegacyProductCodes.push(normalizedProductCode);
      }
      continue;
    }

    blockingDriftCount += 1;
  }

  return {
    pass: blockingDriftCount === 0,
    informationalLegacyProductCodes,
    blockingDriftCount,
  };
};

export const buildMerchantFeedBranchScopedGovernanceByProductCode = <
  TRow extends {
    id: string;
    price?: string;
    average_rating?: string;
    rating_count?: string;
    review_count?: string;
  },
>(
  outputRows: TRow[],
  mainBaseline: MerchantFeedPublishedBaselineCatalog,
  branchModifiedProductCodes: ReadonlySet<string> = new Set()
): Map<string, MerchantFeedGovernanceTier> => {
  const governanceByProductCode = new Map<string, MerchantFeedGovernanceTier>();

  for (const row of outputRows) {
    const productCode = normalizeProductCode(row.id);
    if (!productCode) {
      continue;
    }

    governanceByProductCode.set(
      productCode,
      classifyMerchantFeedGovernanceTier(
        productCode,
        snapshotMerchantFeedCommercial(row),
        mainBaseline,
        branchModifiedProductCodes
      )
    );
  }

  return governanceByProductCode;
};

export const applyMerchantFeedLiveRuntimeParityBaselinePolicy = <
  TReport extends {
    pass: boolean;
    drifts: MerchantFeedLiveRuntimeParityDrift[];
  },
>(
  report: TReport,
  governanceByProductCode: Map<string, MerchantFeedGovernanceTier>
): TReport & { informationalLegacyProductCodes: string[] } => {
  const buildEvaluation = evaluateMerchantFeedLiveRuntimeParityForBuild(
    report,
    governanceByProductCode
  );

  return {
    ...report,
    pass: buildEvaluation.pass,
    informationalLegacyProductCodes:
      buildEvaluation.informationalLegacyProductCodes,
  };
};

export type MerchantFeedGovernanceReconciliationResult<
  TRow extends {
    id: string;
    price: string;
    average_rating: string;
    rating_count: string;
    review_count: string;
  },
> = {
  rows: TRow[];
  governanceByProductCode: Map<string, MerchantFeedGovernanceTier>;
  liveCommercialFailures: string[];
};

export const reconcileMerchantFeedRowsWithBaselineGovernance = async <
  TRow extends {
    id: string;
    price: string;
    average_rating: string;
    rating_count: string;
    review_count: string;
  },
>(
  generatedRows: TRow[],
  baseline: MerchantFeedPublishedBaselineCatalog,
  diagnose: (
    productCode: string
  ) => Promise<Engine6ViatorProductCommercialDiagnostic>,
  branchModifiedProductCodes: ReadonlySet<string> = new Set()
): Promise<MerchantFeedGovernanceReconciliationResult<TRow>> => {
  const rows: TRow[] = [];
  const governanceByProductCode = new Map<string, MerchantFeedGovernanceTier>();
  const liveCommercialFailures: string[] = [];

  for (const generatedRow of generatedRows) {
    const productCode = normalizeProductCode(generatedRow.id);
    const generatedCommercial = snapshotMerchantFeedCommercial(generatedRow);
    const baselineCommercial = baseline.get(productCode);
    const diagnostic = await diagnose(productCode);
    const branchModified = branchModifiedProductCodes.has(productCode);

    if (!baselineCommercial) {
      const guard = passesMerchantFeedLiveCommercialGuard(diagnostic);
      if (!guard.pass) {
        liveCommercialFailures.push(`${productCode}: ${guard.reason}`);
      }
      governanceByProductCode.set(productCode, "new-product");
      rows.push(
        applyLiveRatingMetadataToMerchantFeedRow(generatedRow, diagnostic)
      );
      continue;
    }

    const generatedDiffersFromBaseline =
      isMerchantFeedCommercialModifiedFromBaseline(
        generatedCommercial,
        baselineCommercial
      );

    if (branchModified) {
      const strictGuard = passesMerchantFeedLiveCommercialGuard(diagnostic);
      if (!strictGuard.pass) {
        liveCommercialFailures.push(`${productCode}: ${strictGuard.reason}`);
      }
      governanceByProductCode.set(productCode, "modified-commercial");
      rows.push(
        applyLiveRatingMetadataToMerchantFeedRow(generatedRow, diagnostic)
      );
      continue;
    }

    if (generatedDiffersFromBaseline) {
      // Regeneration drift outside the current branch scope preserves the
      // published baseline, even when the live API proves the values changed.
      governanceByProductCode.set(productCode, "unchanged-legacy-baseline");
      rows.push(
        applyBaselineCommercialToMerchantFeedRow(generatedRow, baseline)
      );
      continue;
    }

    governanceByProductCode.set(productCode, "unchanged-legacy-baseline");
    rows.push(applyBaselineCommercialToMerchantFeedRow(generatedRow, baseline));
  }

  return {
    rows,
    governanceByProductCode,
    liveCommercialFailures,
  };
};
