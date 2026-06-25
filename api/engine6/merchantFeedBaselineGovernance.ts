import {
  passesMerchantFeedLiveCommercialGuard,
  type Engine6ViatorProductCommercialDiagnostic,
} from "./resolveEngine6ViatorProductCommercialExtract.js";

/**
 * Forward-looking merchant-feed governance uses the published merchantFeed.csv catalog
 * as the legacy baseline. Unchanged baseline products are not blocked by historical
 * runtime parity drift or bundled-fallback during catalog preservation builds.
 * New products and intentional commercial updates must satisfy strict live governance.
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
) => !merchantFeedCommercialSnapshotsEqual(outputCommercial, baselineCommercial);

/**
 * Classifies governance from final commercial values. A baseline product is
 * modified only when its output commercial snapshot differs from the published
 * baseline — not merely because it was regenerated during a build.
 */
export const classifyMerchantFeedGovernanceTier = (
  productCode: string,
  outputCommercial: MerchantFeedCommercialSnapshot,
  baseline: MerchantFeedPublishedBaselineCatalog
): MerchantFeedGovernanceTier => {
  const normalizedProductCode = normalizeProductCode(productCode);
  const baselineCommercial = baseline.get(normalizedProductCode);

  if (!baselineCommercial) {
    return "new-product";
  }

  if (
    isMerchantFeedCommercialModifiedFromBaseline(
      outputCommercial,
      baselineCommercial
    )
  ) {
    return "modified-commercial";
  }

  return "unchanged-legacy-baseline";
};

export const requiresStrictMerchantFeedLiveCommercialGuard = (
  tier: MerchantFeedGovernanceTier
) => tier !== "unchanged-legacy-baseline";

export const requiresStrictMerchantFeedRuntimeParity = (
  tier: MerchantFeedGovernanceTier
) => tier !== "unchanged-legacy-baseline";

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
  ) => Promise<Engine6ViatorProductCommercialDiagnostic>
): Promise<MerchantFeedGovernanceReconciliationResult<TRow>> => {
  const rows: TRow[] = [];
  const governanceByProductCode = new Map<string, MerchantFeedGovernanceTier>();
  const liveCommercialFailures: string[] = [];

  for (const generatedRow of generatedRows) {
    const productCode = normalizeProductCode(generatedRow.id);
    const generatedCommercial = snapshotMerchantFeedCommercial(generatedRow);
    const baselineCommercial = baseline.get(productCode);
    const diagnostic = await diagnose(productCode);

    if (!baselineCommercial) {
      const guard = passesMerchantFeedLiveCommercialGuard(diagnostic);
      if (!guard.pass) {
        liveCommercialFailures.push(`${productCode}: ${guard.reason}`);
      }
      governanceByProductCode.set(productCode, "new-product");
      rows.push(generatedRow);
      continue;
    }

    const generatedDiffersFromBaseline = isMerchantFeedCommercialModifiedFromBaseline(
      generatedCommercial,
      baselineCommercial
    );

    if (generatedDiffersFromBaseline) {
      const strictGuard = passesMerchantFeedLiveCommercialGuard(diagnostic);
      if (strictGuard.pass) {
        governanceByProductCode.set(productCode, "modified-commercial");
        rows.push(generatedRow);
        continue;
      }

      // Regeneration drift without live proof preserves the published baseline.
      governanceByProductCode.set(productCode, "unchanged-legacy-baseline");
      rows.push(applyBaselineCommercialToMerchantFeedRow(generatedRow, baseline));
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
