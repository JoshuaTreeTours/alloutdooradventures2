import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  applyMerchantFeedLiveRuntimeParityBaselinePolicy,
  buildMerchantFeedBranchScopedGovernanceByProductCode,
  buildMerchantFeedPublishedBaselineCatalog,
  reconcileMerchantFeedRowsWithBaselineGovernance,
} from "../api/engine6/merchantFeedBaselineGovernance";
import {
  loadMerchantFeedBranchModifiedProductCodes,
  loadMerchantFeedMainBaselineCatalog,
  loadMerchantFeedNotYetPublishedOnProductionProductCodes,
} from "../api/engine6/merchantFeedProductionDeploymentBaseline";
import {
  applyMerchantFeedChangeScopePreservingNonCommercial,
  type MerchantFeedCsvRow,
} from "../api/engine6/merchantFeedChangeScopeGovernance";
import { formatMerchantFeedCommercialRefreshAuditReport } from "../api/engine6/merchantFeedCommercialRefreshGovernance";
import { applyMerchantFeedCommercialRefresh } from "../api/engine6/runMerchantFeedCommercialBackfill";
import {
  diagnoseEngine6ViatorProductCommercialExtract,
  describeViatorApiConfigEnvVisibility,
  resolveViatorApiConfig,
} from "../api/engine6/resolveEngine6ViatorProductCommercialExtract";
import {
  applyMerchantFeedImageGovernance,
  formatMerchantFeedImageValidationReport,
} from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import {
  auditEngine6MerchantFeedCommercialParity,
  auditEngine6MerchantFeedSchemaParity,
  formatMerchantFeedCommercialParityAuditReport,
} from "../src/engine6/merchantFeedParity";
import {
  fetchEngine6LiveCommercialFieldsForSchema,
  requireLiveMerchantCommercial,
  resolveEngine6ToursForProductSchema,
} from "../src/engine6/fetchEngine6LiveCommercialFieldsForSchema";
import { merchantFeedEligibleTours } from "../src/engine6/merchantFeedEligibility";
import { resolveEngine6ToursWithCommercialSource } from "../src/engine6/commercialResolver";
import { engine6ResolvedTours } from "../src/engine6/registry";
import type { Engine6Tour } from "../src/engine6/types";
import {
  auditMerchantFeedLiveRuntimeParity,
  formatMerchantFeedLiveRuntimeParityReport,
  logMerchantFeedInformationalLegacyRuntimeDrifts,
} from "./audit-merchant-feed-live-runtime-parity";

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  process.env.MERCHANT_FEED_OUTPUT_PATH ?? "data/merchantFeed.csv"
);

const OUTPUT_HEADERS = [
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

const REQUIRED_MERCHANT_FIELDS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
] as const satisfies readonly OutputHeader[];

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type MerchantRow = Record<OutputHeader, string>;

type MerchantFeedBlankCounts = {
  totalRows: number;
  blankPriceRows: number;
  blankAverageRatingRows: number;
  blankRatingCountRows: number;
  blankReviewCountRows: number;
  blankRequiredFieldRows: number;
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: MerchantRow[]) => {
  const headerLine = OUTPUT_HEADERS.join(",");
  const body = rows
    .map(row => OUTPUT_HEADERS.map(header => escapeCsv(row[header])).join(","))
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
    OUTPUT_HEADERS.forEach(header => {
      const headerIndex = headers.indexOf(header);
      record[header] = headerIndex >= 0 ? (values[headerIndex] ?? "") : "";
    });
    return record;
  });
};

export const countMerchantFeedBlankFields = (
  rows: MerchantRow[]
): MerchantFeedBlankCounts => {
  const isBlank = (value: string | undefined) => !value?.trim();

  let blankRequiredFieldRows = 0;
  for (const row of rows) {
    if (REQUIRED_MERCHANT_FIELDS.some(field => isBlank(row[field]))) {
      blankRequiredFieldRows += 1;
    }
  }

  return {
    totalRows: rows.length,
    blankPriceRows: rows.filter(row => isBlank(row.price)).length,
    blankAverageRatingRows: rows.filter(row => isBlank(row.average_rating))
      .length,
    blankRatingCountRows: rows.filter(row => isBlank(row.rating_count)).length,
    blankReviewCountRows: rows.filter(row => isBlank(row.review_count)).length,
    blankRequiredFieldRows,
  };
};

export const validateMerchantFeedRows = (rows: MerchantRow[]) => {
  const report = countMerchantFeedBlankFields(rows);
  const failures: string[] = [];

  for (const row of rows) {
    for (const field of REQUIRED_MERCHANT_FIELDS) {
      if (!row[field]?.trim()) {
        failures.push(
          `Required field "${field}" is blank for product ${row.id || "(missing id)"}`
        );
      }
    }
  }

  if (report.blankPriceRows > 0) {
    failures.push(
      `Merchant feed validation failed: ${report.blankPriceRows} row(s) have blank price.`
    );
  }

  return {
    report,
    pass: failures.length === 0,
    failures,
  };
};

const logMerchantFeedReport = (
  label: string,
  report: MerchantFeedBlankCounts,
  pass?: boolean
) => {
  console.log(`\nMerchant Feed ${label}:`);
  console.log(`  Total rows: ${report.totalRows}`);
  console.log(`  Blank price rows: ${report.blankPriceRows}`);
  console.log(`  Blank average_rating rows: ${report.blankAverageRatingRows}`);
  console.log(`  Blank rating_count rows: ${report.blankRatingCountRows}`);
  console.log(`  Blank review_count rows: ${report.blankReviewCountRows}`);
  console.log(`  Blank required-field rows: ${report.blankRequiredFieldRows}`);
  if (typeof pass === "boolean") {
    console.log(`  Pass/Fail: ${pass ? "PASS" : "FAIL"}`);
  }
};

export const buildMerchantRow = (tour: Engine6Tour): MerchantRow =>
  buildMerchantFeedRowFromProductSchema(tour);

const readExistingMerchantFeedRows = async (): Promise<MerchantRow[]> => {
  try {
    const content = await readFile(OUTPUT_PATH, "utf8");
    return parseCsv(content);
  } catch {
    return [];
  }
};

const resolveRuntimeCommercialBaseUrl = () =>
  (
    process.env.MERCHANT_FEED_RUNTIME_BASE_URL ??
    process.env.ENGINE6_RUNTIME_BASE_URL ??
    ""
  ).replace(/\/$/, "");

const logMerchantFeedBuildEnvVisibility = () => {
  const runtimeBaseUrl = resolveRuntimeCommercialBaseUrl();
  console.log(
    "[merchant-feed-build] env visibility:",
    JSON.stringify(
      {
        VERCEL_ENV: process.env.VERCEL_ENV ?? "(unset)",
        REQUIRE_LIVE_MERCHANT_COMMERCIAL:
          process.env.REQUIRE_LIVE_MERCHANT_COMMERCIAL ?? "(unset)",
        requireLiveMerchantCommercial: requireLiveMerchantCommercial(),
        MERCHANT_FEED_OUTPUT_PATH: path.relative(process.cwd(), OUTPUT_PATH),
        primaryMerchantFeedOutput: path.relative(process.cwd(), OUTPUT_PATH),
        MERCHANT_FEED_RUNTIME_BASE_URL: process.env
          .MERCHANT_FEED_RUNTIME_BASE_URL
          ? "(set)"
          : "(unset)",
        ENGINE6_RUNTIME_BASE_URL: process.env.ENGINE6_RUNTIME_BASE_URL
          ? "(set)"
          : "(unset)",
        runtimeCommercialBaseUrlResolved: runtimeBaseUrl || "(empty)",
        VIATOR_API_BASE_URL: process.env.VIATOR_API_BASE_URL ?? "(unset)",
        VIATOR_BASE_URL: process.env.VIATOR_BASE_URL ?? "(unset)",
        ...describeViatorApiConfigEnvVisibility(),
      },
      null,
      2
    )
  );
};

const parseLiveCommercialFailureProductCode = (failure: string) =>
  failure.split(":")[0]?.trim().toUpperCase() ?? "";

const buildBaselineClassificationSnapshot = (
  governanceByProductCode: Map<string, string>,
  productCodes: string[]
) =>
  Object.fromEntries(
    productCodes.map(productCode => [
      productCode,
      governanceByProductCode.get(productCode) ?? "unknown",
    ])
  );

const buildDiagnosticFailureObjects = async (productCodes: string[]) => {
  const uniqueProductCodes = [...new Set(productCodes.filter(Boolean))].slice(
    0,
    5
  );

  return Promise.all(
    uniqueProductCodes.map(async productCode => {
      const diagnostic =
        await diagnoseEngine6ViatorProductCommercialExtract(productCode);
      return {
        productCode,
        source: diagnostic.commercial.source,
        failureReason: diagnostic.failureReason,
        pricingAvailable: diagnostic.pricingAvailable,
        ratingAvailable: diagnostic.ratingAvailable,
        reviewCountAvailable: diagnostic.reviewCountAvailable,
        ratingMetadataPresent: diagnostic.ratingMetadataPresent,
        upstreamStatus: diagnostic.upstreamStatus,
        priceAmount: diagnostic.commercial.priceAmount,
      };
    })
  );
};

const parseMerchantFeedParityFailure = (failure: string) => {
  const [productCode = "", ...fieldParts] = failure.split(".");
  return {
    productCode: productCode.split(":")[0]?.trim().toUpperCase() ?? "",
    field: fieldParts.join(".").split(":")[0]?.trim() ?? "",
  };
};

export const partitionMerchantFeedParityFailuresByBuildScope = (
  failures: string[],
  governanceByProductCode: Map<string, string>
) => {
  const blockingFailures: string[] = [];
  const informationalLegacyFailures: string[] = [];

  for (const failure of failures) {
    const { productCode } = parseMerchantFeedParityFailure(failure);
    const tier = governanceByProductCode.get(productCode) ?? "new-product";
    const isInformationalLegacyDrift = tier === "unchanged-legacy-baseline";

    if (isInformationalLegacyDrift) {
      informationalLegacyFailures.push(failure);
    } else {
      blockingFailures.push(failure);
    }
  }

  return {
    blockingFailures,
    informationalLegacyFailures,
  };
};

const logMerchantFeedInformationalLegacyParityDrift = (args: {
  guardName: string;
  failures: string[];
}) => {
  if (args.failures.length === 0) {
    return;
  }

  const productCodes = [
    ...new Set(
      args.failures
        .map(failure => parseMerchantFeedParityFailure(failure).productCode)
        .filter(Boolean)
    ),
  ];

  console.warn(
    "[merchant-feed-build-guard]",
    JSON.stringify(
      {
        guardName: args.guardName,
        pass: true,
        informationalPreExistingDrift: true,
        productCodes,
        failureObjects: args.failures.slice(0, 5).map(failure => ({
          failure,
        })),
      },
      null,
      2
    )
  );
};

const logMerchantFeedBuildGuardFailure = async (args: {
  guardName: string;
  pass: boolean;
  failingProductCodes?: string[];
  baselineClassification?: Record<string, string>;
  failureObjects?: unknown[];
  includeDiagnostics?: boolean;
}) => {
  const failingProductCodes = args.failingProductCodes ?? [];
  const failureObjects =
    args.includeDiagnostics && failingProductCodes.length > 0
      ? await buildDiagnosticFailureObjects(failingProductCodes)
      : (args.failureObjects ?? []).slice(0, 5);

  console.error(
    "[merchant-feed-build-guard]",
    JSON.stringify(
      {
        guardName: args.guardName,
        pass: args.pass,
        failingProductCodes,
        baselineClassification: args.baselineClassification ?? {},
        failureObjects: failureObjects.slice(0, 5),
      },
      null,
      2
    )
  );
};

const assertLiveCommercialExtracts = async (
  failures: string[],
  governanceByProductCode: Map<string, string>
) => {
  if (!requireLiveMerchantCommercial()) {
    return;
  }

  const { apiKey } = resolveViatorApiConfig();
  if (!apiKey) {
    if (resolveRuntimeCommercialBaseUrl()) {
      console.log(
        "Merchant feed live-commercial guard: using production runtime overlay (MERCHANT_FEED_RUNTIME_BASE_URL)."
      );
      return;
    }

    await logMerchantFeedBuildGuardFailure({
      guardName: "live-commercial-api-key",
      pass: false,
      failureObjects: [
        {
          reason:
            "Merchant feed production build requires VIATOR_API_KEY for live commercial resolution.",
          hasRuntimeBaseUrl: Boolean(resolveRuntimeCommercialBaseUrl()),
        },
      ],
    });
    throw new Error(
      "Merchant feed production build requires VIATOR_API_KEY for live commercial resolution."
    );
  }

  if (failures.length > 0) {
    const failingProductCodes = failures.map(
      parseLiveCommercialFailureProductCode
    );
    await logMerchantFeedBuildGuardFailure({
      guardName: "live-commercial-baseline-reconciliation",
      pass: false,
      failingProductCodes,
      baselineClassification: buildBaselineClassificationSnapshot(
        governanceByProductCode,
        failingProductCodes
      ),
      failureObjects: failures.slice(0, 5).map(failure => ({ failure })),
      includeDiagnostics: true,
    });
    throw new Error(
      `Merchant feed live commercial validation failed for ${failures.length} product issue(s):\n${failures.join("\n")}`
    );
  }
};

const resolveToursForMerchantFeedGeneration = async (
  tours = merchantFeedEligibleTours
) => {
  const { apiKey } = resolveViatorApiConfig();
  const runtimeBaseUrl = resolveRuntimeCommercialBaseUrl();

  if (!apiKey && runtimeBaseUrl) {
    return resolveEngine6ToursWithCommercialSource(tours);
  }

  return resolveEngine6ToursForProductSchema(tours);
};

const applyRuntimeResolvedCommercialFields = (
  rows: MerchantRow[],
  generatedRows: MerchantRow[]
): MerchantRow[] => {
  const generatedRowsByProductCode = new Map(
    generatedRows.map(row => [row.id.trim().toUpperCase(), row])
  );

  return rows.map(row => {
    const generatedRow = generatedRowsByProductCode.get(
      row.id.trim().toUpperCase()
    );

    if (!generatedRow) {
      return row;
    }

    return {
      ...row,
      price: generatedRow.price,
      average_rating: generatedRow.average_rating,
      rating_count: generatedRow.rating_count,
      review_count: generatedRow.review_count,
    };
  });
};

const main = async () => {
  logMerchantFeedBuildEnvVisibility();

  const existingRows = await readExistingMerchantFeedRows();
  const publishedBaseline =
    buildMerchantFeedPublishedBaselineCatalog(existingRows);
  const mainBaselineCatalog = loadMerchantFeedMainBaselineCatalog();
  const branchModifiedProductCodes = loadMerchantFeedBranchModifiedProductCodes(
    merchantFeedEligibleTours.map(tour => tour.productCode)
  );
  const notYetPublishedOnProductionProductCodes =
    loadMerchantFeedNotYetPublishedOnProductionProductCodes(
      merchantFeedEligibleTours.map(tour => tour.productCode)
    );
  if (existingRows.length > 0) {
    logMerchantFeedReport("Before", countMerchantFeedBlankFields(existingRows));
  } else {
    console.log("\nMerchant Feed Baseline: no existing merchantFeed.csv rows.");
  }

  const schemaResolvedTours = await resolveToursForMerchantFeedGeneration(
    merchantFeedEligibleTours
  );

  const generatedRows: MerchantRow[] = schemaResolvedTours.map(tour =>
    buildMerchantRow(tour)
  );

  const reconciliation = await reconcileMerchantFeedRowsWithBaselineGovernance(
    generatedRows,
    publishedBaseline,
    diagnoseEngine6ViatorProductCommercialExtract,
    branchModifiedProductCodes
  );

  await assertLiveCommercialExtracts(
    reconciliation.liveCommercialFailures,
    reconciliation.governanceByProductCode
  );

  if (reconciliation.degradedFallbackProductCodes.length > 0) {
    console.warn(
      "[merchant-feed-build] degraded commercial fallback:",
      JSON.stringify(
        {
          source: "published merchantFeed.csv baseline",
          reason:
            "live commercial source unavailable; preserving committed baseline commercial fields for affected legacy rows",
          productCodes: reconciliation.degradedFallbackProductCodes,
        },
        null,
        2
      )
    );
  }

  const changeScope = applyMerchantFeedChangeScopePreservingNonCommercial(
    existingRows as MerchantFeedCsvRow[],
    reconciliation.rows as MerchantFeedCsvRow[],
    { branchModifiedProductCodes }
  );

  if (changeScope.preservedNonCommercialProductCodes.length > 0) {
    console.log(
      "[merchant-feed-build] change-scope preservation:",
      JSON.stringify(
        {
          reason:
            "restored baseline non-commercial columns while keeping reconciled commercial fields",
          preservedNonCommercialCount:
            changeScope.preservedNonCommercialProductCodes.length,
          preservedNonCommercialProductCodes:
            changeScope.preservedNonCommercialProductCodes.slice(0, 20),
        },
        null,
        2
      )
    );
  }

  if (changeScope.appendedProductCodes.length > 0) {
    console.log(
      `[merchant-feed-build] appended ${changeScope.appendedProductCodes.length} new merchant feed row(s).`
    );
  }

  const { apiKey } = resolveViatorApiConfig();
  const runtimeBaseUrl = resolveRuntimeCommercialBaseUrl();
  const rowsForCommercialRefresh =
    !apiKey && runtimeBaseUrl
      ? applyRuntimeResolvedCommercialFields(
          changeScope.rows as MerchantRow[],
          generatedRows
        )
      : (changeScope.rows as MerchantRow[]);

  const commercialRefresh = await applyMerchantFeedCommercialRefresh({
    rows: rowsForCommercialRefresh as MerchantFeedCsvRow[],
    baselineRows: existingRows as MerchantFeedCsvRow[],
    mode: "generation",
  });

  const outputRows = commercialRefresh.rows as MerchantRow[];

  const preImageGovernanceParityAudit = auditEngine6MerchantFeedSchemaParity(
    schemaResolvedTours,
    new Map(outputRows.map(row => [row.id, row]))
  );

  const preImageProductJsonLdParityScope =
    partitionMerchantFeedParityFailuresByBuildScope(
      preImageGovernanceParityAudit.failures,
      reconciliation.governanceByProductCode
    );
  logMerchantFeedInformationalLegacyParityDrift({
    guardName: "product-jsonld-parity",
    failures: preImageProductJsonLdParityScope.informationalLegacyFailures,
  });

  if (preImageProductJsonLdParityScope.blockingFailures.length > 0) {
    for (const failure of preImageProductJsonLdParityScope.blockingFailures.slice(
      0,
      20
    )) {
      console.error(failure);
    }
    if (preImageProductJsonLdParityScope.blockingFailures.length > 20) {
      console.error(
        `...and ${preImageProductJsonLdParityScope.blockingFailures.length - 20} additional Product JSON-LD parity failures.`
      );
    }
    const failingProductCodes = [
      ...new Set(
        preImageProductJsonLdParityScope.blockingFailures
          .map(failure => failure.split(".")[0]?.trim().toUpperCase() ?? "")
          .filter(Boolean)
      ),
    ];
    await logMerchantFeedBuildGuardFailure({
      guardName: "product-jsonld-parity",
      pass: false,
      failingProductCodes,
      baselineClassification: buildBaselineClassificationSnapshot(
        reconciliation.governanceByProductCode,
        failingProductCodes
      ),
      failureObjects: preImageProductJsonLdParityScope.blockingFailures
        .slice(0, 5)
        .map(failure => ({
          failure,
        })),
    });
    throw new Error(
      "Merchant feed Product JSON-LD parity validation failed before image governance."
    );
  }

  const imageGovernance = await applyMerchantFeedImageGovernance({
    rows: outputRows,
    toursByProductCode: new Map(
      schemaResolvedTours.map(tour => [
        tour.productCode.trim().toUpperCase(),
        tour,
      ])
    ),
    governanceByProductCode: reconciliation.governanceByProductCode,
    branchModifiedProductCodes,
  });
  console.log(formatMerchantFeedImageValidationReport(imageGovernance.report));

  if (imageGovernance.report.informationalLegacyProductCodes.length > 0) {
    console.warn(
      "[merchant-feed-build-guard]",
      JSON.stringify(
        {
          guardName: "image-link-validation",
          pass: true,
          informationalPreExistingDrift: true,
          productCodes: imageGovernance.report.informationalLegacyProductCodes,
          failureObjects: imageGovernance.report.invalidUrlsReported
            .filter(entry =>
              imageGovernance.report.informationalLegacyProductCodes.includes(
                entry.productCode
              )
            )
            .slice(0, 5)
            .map(entry => ({
              productCode: entry.productCode,
              invalidUrl: entry.invalidUrl,
              reason: entry.reason,
              status: entry.status,
            })),
        },
        null,
        2
      )
    );
  }

  if (!imageGovernance.pass) {
    await logMerchantFeedBuildGuardFailure({
      guardName: "image-link-validation",
      pass: false,
      failingProductCodes: imageGovernance.report.failures.map(
        failure => failure.productCode
      ),
      baselineClassification: buildBaselineClassificationSnapshot(
        reconciliation.governanceByProductCode,
        imageGovernance.report.failures.map(failure => failure.productCode)
      ),
      failureObjects: imageGovernance.report.failures
        .slice(0, 5)
        .map(failure => ({
          productCode: failure.productCode,
          attemptedUrls: failure.attemptedUrls.slice(0, 5),
          lastReason: failure.lastReason,
          lastStatus: failure.lastStatus,
        })),
    });
    throw new Error(
      "Merchant feed image validation failed before write: no valid replacement image exists for one or more rows."
    );
  }

  const governedOutputRows = imageGovernance.rows;
  const validation = validateMerchantFeedRows(governedOutputRows);
  logMerchantFeedReport("After", validation.report, validation.pass);

  if (!validation.pass) {
    for (const failure of validation.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (validation.failures.length > 20) {
      console.error(
        `...and ${validation.failures.length - 20} additional validation failures.`
      );
    }
    const failingProductCodes = [
      ...new Set(
        validation.failures
          .map(failure => failure.match(/product\s+([A-Z0-9]+)/i)?.[1] ?? "")
          .filter(Boolean)
          .map(code => code.toUpperCase())
      ),
    ];
    await logMerchantFeedBuildGuardFailure({
      guardName: "required-field-validation",
      pass: false,
      failingProductCodes,
      baselineClassification: buildBaselineClassificationSnapshot(
        reconciliation.governanceByProductCode,
        failingProductCodes
      ),
      failureObjects: validation.failures.slice(0, 5).map(failure => ({
        failure,
      })),
    });
    throw new Error("Merchant feed validation failed before write.");
  }

  const commercialParityAudit = auditEngine6MerchantFeedCommercialParity(
    schemaResolvedTours,
    new Map(governedOutputRows.map(row => [row.id, row]))
  );

  const commercialParityScope = partitionMerchantFeedParityFailuresByBuildScope(
    commercialParityAudit.failures,
    reconciliation.governanceByProductCode
  );
  logMerchantFeedInformationalLegacyParityDrift({
    guardName: "commercial-parity",
    failures: commercialParityScope.informationalLegacyFailures,
  });

  if (commercialParityScope.blockingFailures.length > 0) {
    for (const failure of commercialParityScope.blockingFailures.slice(0, 20)) {
      console.error(failure);
    }
    if (commercialParityScope.blockingFailures.length > 20) {
      console.error(
        `...and ${commercialParityScope.blockingFailures.length - 20} additional commercial parity failures.`
      );
    }
    const failingProductCodes = [
      ...new Set(
        commercialParityScope.blockingFailures
          .map(failure => failure.split(".")[0]?.trim().toUpperCase() ?? "")
          .filter(Boolean)
      ),
    ];
    await logMerchantFeedBuildGuardFailure({
      guardName: "commercial-parity",
      pass: false,
      failingProductCodes,
      baselineClassification: buildBaselineClassificationSnapshot(
        reconciliation.governanceByProductCode,
        failingProductCodes
      ),
      failureObjects: commercialParityScope.blockingFailures
        .slice(0, 5)
        .map(failure => ({
          failure,
        })),
    });
    throw new Error(
      "Merchant feed commercial parity validation failed before write."
    );
  }

  const branchScopedGovernanceByProductCode =
    buildMerchantFeedBranchScopedGovernanceByProductCode(
      governedOutputRows,
      mainBaselineCatalog,
      branchModifiedProductCodes
    );

  const runtimeParityAudit = applyMerchantFeedLiveRuntimeParityBaselinePolicy(
    await auditMerchantFeedLiveRuntimeParity(
      governedOutputRows,
      branchScopedGovernanceByProductCode,
      notYetPublishedOnProductionProductCodes
    ),
    branchScopedGovernanceByProductCode
  );

  logMerchantFeedInformationalLegacyRuntimeDrifts(runtimeParityAudit);

  if (!runtimeParityAudit.pass) {
    const blockingDrifts = runtimeParityAudit.drifts.filter(drift => {
      const tier =
        branchScopedGovernanceByProductCode.get(
          drift.productCode.trim().toUpperCase()
        ) ?? "new-product";
      return tier !== "unchanged-legacy-baseline";
    });
    for (const drift of blockingDrifts.slice(0, 20)) {
      console.error(
        `${drift.productCode}: csv=${drift.csv.price}/${drift.csv.rating}/${drift.csv.reviews} live=${drift.liveJsonLd.price}/${drift.liveJsonLd.averageRating}/${drift.liveJsonLd.reviewCount}`
      );
    }
    const failingProductCodes = blockingDrifts.map(drift =>
      drift.productCode.trim().toUpperCase()
    );
    await logMerchantFeedBuildGuardFailure({
      guardName: "live-runtime-commercial-parity-baseline-policy",
      pass: false,
      failingProductCodes,
      baselineClassification: buildBaselineClassificationSnapshot(
        branchScopedGovernanceByProductCode,
        failingProductCodes
      ),
      failureObjects: blockingDrifts.slice(0, 5).map(drift => ({
        productCode: drift.productCode,
        baselineTier:
          branchScopedGovernanceByProductCode.get(
            drift.productCode.trim().toUpperCase()
          ) ?? "new-product",
        csv: drift.csv,
        liveJsonLd: drift.liveJsonLd,
        priceDrift: drift.priceDrift,
        ratingDrift: drift.ratingDrift,
        reviewCountDrift: drift.reviewCountDrift,
      })),
      includeDiagnostics: true,
    });
    throw new Error(
      "Merchant feed live runtime commercial parity validation failed before write."
    );
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, toCsv(governedOutputRows), "utf8");

  console.log(
    `Processed ${merchantFeedEligibleTours.length} Engine6 merchant-feed products (${engine6ResolvedTours.length - merchantFeedEligibleTours.length} excluded).`
  );
  console.log(
    `Wrote ${governedOutputRows.length} merchant feed rows to ${OUTPUT_PATH}.`
  );
  console.log("Product JSON-LD parity: PASS");
  console.log(
    formatMerchantFeedCommercialParityAuditReport(
      commercialParityAudit,
      validation.report.blankRequiredFieldRows
    )
  );
  console.log(formatMerchantFeedLiveRuntimeParityReport(runtimeParityAudit));
  console.log(commercialRefresh.report);
  if (!commercialRefresh.skipped) {
    console.log(
      formatMerchantFeedCommercialRefreshAuditReport(commercialRefresh.audit)
    );
  }

  const unratedProducts = governedOutputRows
    .filter(
      row =>
        !row.average_rating?.trim() ||
        !row.rating_count?.trim() ||
        !row.review_count?.trim()
    )
    .map(row => row.id);

  if (unratedProducts.length > 0) {
    console.log(
      `Legitimate unrated merchant feed rows (blank rating/review fields): ${unratedProducts.length}`
    );
    console.log(unratedProducts.join(", "));
  }
};

if (process.argv[1]?.includes("generate-merchant-feed")) {
  main().catch(error => {
    console.error(
      "[merchant-feed-build] failed:",
      error instanceof Error ? error.message : error
    );
    console.error(error);
    process.exit(1);
  });
}
