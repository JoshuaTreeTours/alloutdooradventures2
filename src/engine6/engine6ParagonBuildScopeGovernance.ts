import {
  parseMerchantFeedCsvRows,
  type MerchantFeedCsvRow,
} from "../../api/engine6/merchantFeedChangeScopeGovernance.js";
import type { Engine6GovernanceMode } from "./engine6GovernanceMode.js";
import {
  extractEngine6ProductCodesFromExactProductPath,
  type Engine6GitChangedFile,
} from "./resolveEngine6ChangedProductCodes.js";
import type { Engine6Stage2GovernanceAuditMode } from "./engine6Stage2GovernanceAudit.js";

export const ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_MODULE_ID =
  "engine6-paragon-build-scope-governance" as const;

export const ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_ALLOWLIST = [
  /^src\/engine6\/engine6ParagonBuildScopeGovernance(?:\.test)?\.ts$/,
  /^src\/engine6\/engine6DestinationInfrastructureValidation(?:\.test)?\.ts$/,
  /^src\/engine6\/engine6ExactProductFixtureGovernance(?:\.test)?\.ts$/,
  /^src\/engine6\/engine6ProductHeroGovernance(?:\.test)?\.ts$/,
  /^src\/engine6\/ENGINE6_HARDENED_CONTRACT\.md$/,
  /^src\/engine6\/.*_GOVERNANCE_POLICY\.md$/,
  /^reports\/engine6-paragon-build-scope-governance.*\.(md|json)$/,
  /^\.github\/workflows\/engine6.*\.yml$/,
] as const;

export const ENGINE6_PUBLISHED_DESTINATION_SLUGS = [
  "sedona",
  "great-smoky-mountains-national-park",
  "glacier",
  "yellowstone-national-park",
  "grand-canyon-national-park",
  "yosemite",
  "zion-national-park",
] as const;

const GENERATED_CATALOG_PATH =
  /^(?:data\/engine6\/viator\/[A-Z0-9_]+\.exact-product\.json|data\/merchantFeed\.csv|public\/sitemap-tours\.xml|src\/engine6\/(?:validationFixtures\.ts|routes\.ts|.*ViatorPublicRatings\.ts))$/;

const PUBLISHED_DESTINATION_PATH = new RegExp(
  `^(?:scripts\/(?:generate-)?(?:${ENGINE6_PUBLISHED_DESTINATION_SLUGS.join("|")})-|data\/engine6\/(?:destinations\/)?(?:${ENGINE6_PUBLISHED_DESTINATION_SLUGS.join("|")})\/)`,
  "i"
);

export type Engine6BuildScopeFileKind =
  | "governance-allowlisted"
  | "branch-scoped-generated"
  | "published-destination-protected"
  | "unrelated-generated"
  | "unrelated";

export type Engine6BuildScopeFileViolation = {
  path: string;
  kind:
    | "unrelated-generated-catalog"
    | "published-destination-modified"
    | "merchant-feed-row-rewritten"
    | "sitemap-url-rewritten";
  detail: string;
};

export type Engine6ParagonBuildScopeGovernanceReport = {
  moduleId: typeof ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_MODULE_ID;
  generatedAt: string;
  pass: boolean;
  branchScopedProductCodes: string[];
  blockedFiles: Engine6BuildScopeFileViolation[];
  warnings: Array<{ path: string; detail: string }>;
  merchantFeed: {
    pass: boolean;
    appendedProductCodes: string[];
    preservedExistingRowCount: number;
    violations: Array<{ productCode: string; detail: string }>;
  };
  sitemap: {
    pass: boolean;
    appendedUrls: string[];
    preservedExistingUrlCount: number;
    violations: Array<{ url: string; detail: string }>;
  };
  deployScope: {
    blockingProductCodes: string[];
    reportOnlyProductCodes: string[];
  };
};

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

export const isEngine6ParagonBuildScopeGovernanceAllowlistedPath = (
  filePath: string
) =>
  ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_ALLOWLIST.some(pattern =>
    pattern.test(filePath)
  );

export const isEngine6GeneratedCatalogPath = (filePath: string) =>
  GENERATED_CATALOG_PATH.test(filePath);

export const isEngine6PublishedDestinationProtectedPath = (filePath: string) =>
  PUBLISHED_DESTINATION_PATH.test(filePath);

export const classifyEngine6BuildScopeFileChange = (args: {
  file: Engine6GitChangedFile;
  branchScopedProductCodes: ReadonlySet<string>;
}): Engine6BuildScopeFileKind => {
  if (isEngine6ParagonBuildScopeGovernanceAllowlistedPath(args.file.path)) {
    return "governance-allowlisted";
  }

  if (!isEngine6GeneratedCatalogPath(args.file.path)) {
    return "unrelated";
  }

  if (isEngine6PublishedDestinationProtectedPath(args.file.path)) {
    return "published-destination-protected";
  }

  const productCodes = extractEngine6ProductCodesFromExactProductPath(
    args.file.path
  );
  if (
    productCodes.some(code => args.branchScopedProductCodes.has(normalizeProductCode(code)))
  ) {
    return "branch-scoped-generated";
  }

  if (/^(?:src\/engine6\/(?:validationFixtures\.ts|routes\.ts)|data\/merchantFeed\.csv|public\/sitemap-tours\.xml)$/.test(args.file.path)) {
    return args.branchScopedProductCodes.size > 0
      ? "branch-scoped-generated"
      : "unrelated-generated";
  }

  return "unrelated-generated";
};

export const parseSitemapLocUrls = (sitemapXml: string) => {
  const urls = new Set<string>();
  for (const match of sitemapXml.matchAll(
    /<loc>https:\/\/www\.alloutdooradventures\.com([^<]+)<\/loc>/g
  )) {
    urls.add(match[1].replace(/\/$/, ""));
  }
  return [...urls].sort();
};

export const validateEngine6SitemapAppendOnlyScope = (args: {
  baselineXml: string;
  proposedXml: string;
  branchScopedTourPaths?: ReadonlySet<string>;
}) => {
  const baselineUrls = parseSitemapLocUrls(args.baselineXml);
  const proposedUrls = parseSitemapLocUrls(args.proposedXml);
  const baselineSet = new Set(baselineUrls);
  const proposedSet = new Set(proposedUrls);
  const violations: Array<{ url: string; detail: string }> = [];
  const scopedPaths = args.branchScopedTourPaths ?? new Set<string>();

  for (const url of baselineUrls) {
    if (!proposedSet.has(url) && !scopedPaths.has(url)) {
      violations.push({
        url,
        detail: "Removed existing sitemap URL outside deploy scope",
      });
    }
  }

  const appendedUrls = proposedUrls.filter(url => !baselineSet.has(url));

  return {
    pass: violations.length === 0,
    violations,
    appendedUrls,
    preservedExistingUrlCount: baselineUrls.filter(url => proposedSet.has(url))
      .length,
  };
};

export const validateEngine6MerchantFeedAppendOnlyScope = (args: {
  baselineRows: MerchantFeedCsvRow[];
  proposedRows: MerchantFeedCsvRow[];
  branchScopedProductCodes: ReadonlySet<string>;
}) => {
  const baselineById = new Map(
    args.baselineRows.map(row => [normalizeProductCode(row.id), row])
  );
  const proposedById = new Map(
    args.proposedRows.map(row => [normalizeProductCode(row.id), row])
  );
  const violations: Array<{ productCode: string; detail: string }> = [];
  const appendedProductCodes: string[] = [];

  for (const [productCode, baselineRow] of baselineById.entries()) {
    const proposedRow = proposedById.get(productCode);
    if (!proposedRow) {
      if (!args.branchScopedProductCodes.has(productCode)) {
        violations.push({
          productCode,
          detail: "Removed existing merchant-feed row outside deploy scope",
        });
      }
      continue;
    }

    const serializedBaseline = JSON.stringify(baselineRow);
    const serializedProposed = JSON.stringify(proposedRow);
    if (
      serializedBaseline !== serializedProposed &&
      !args.branchScopedProductCodes.has(productCode)
    ) {
      violations.push({
        productCode,
        detail: "Rewrote existing merchant-feed row outside deploy scope",
      });
    }
  }

  for (const productCode of proposedById.keys()) {
    if (!baselineById.has(productCode)) {
      appendedProductCodes.push(productCode);
    }
  }

  return {
    pass: violations.length === 0,
    violations,
    appendedProductCodes: appendedProductCodes.sort(),
    preservedExistingRowCount: [...baselineById.keys()].filter(code =>
      proposedById.has(code)
    ).length,
  };
};

export const resolveEngine6PrScopedDeployBlocking = (args: {
  addedOrModifiedProductCodes: readonly string[];
  deployScopedProductCodes: readonly string[];
  governanceMode?: Engine6GovernanceMode;
  mode?: Engine6Stage2GovernanceAuditMode;
}) => {
  const addedOrModified = new Set(
    args.addedOrModifiedProductCodes.map(normalizeProductCode)
  );
  const deployScoped = new Set(
    args.deployScopedProductCodes.map(normalizeProductCode)
  );

  const blockingProductCodes = [...deployScoped].filter(code =>
    addedOrModified.has(code)
  );
  const reportOnlyProductCodes = [...deployScoped].filter(
    code => !addedOrModified.has(code)
  );

  const shouldBlockFinding = (
    productCode: string | null | undefined,
    _message: string,
    options?: { warningOnly?: boolean; alwaysBlock?: boolean }
  ) => {
    const normalized = normalizeProductCode(productCode ?? "");
    if (!normalized) {
      return Boolean(options?.alwaysBlock);
    }

    if (options?.warningOnly) {
      return false;
    }

    return blockingProductCodes.includes(normalized);
  };

  return {
    blockingProductCodes,
    reportOnlyProductCodes,
    shouldBlockFinding,
    isDeployScopedProduct: (productCode: string | null | undefined) =>
      deployScoped.has(normalizeProductCode(productCode ?? "")),
  };
};

export const validateEngine6ParagonBuildScope = (args: {
  changedFiles: readonly Engine6GitChangedFile[];
  branchScopedProductCodes: ReadonlySet<string>;
  addedOrModifiedProductCodes?: readonly string[];
  deployScopedProductCodes?: readonly string[];
  baselineMerchantFeedCsv?: string;
  proposedMerchantFeedCsv?: string;
  baselineSitemapXml?: string;
  proposedSitemapXml?: string;
  generatedAt?: string;
}): Engine6ParagonBuildScopeGovernanceReport => {
  const blockedFiles: Engine6BuildScopeFileViolation[] = [];
  const warnings: Array<{ path: string; detail: string }> = [];

  for (const file of args.changedFiles) {
    const kind = classifyEngine6BuildScopeFileChange({
      file,
      branchScopedProductCodes: args.branchScopedProductCodes,
    });

    if (kind === "unrelated-generated") {
      blockedFiles.push({
        path: file.path,
        kind: "unrelated-generated-catalog",
        detail: "Generated catalog file changed outside deploy scope",
      });
    }

    if (
      kind === "published-destination-protected" &&
      args.branchScopedProductCodes.size === 0
    ) {
      warnings.push({
        path: file.path,
        detail:
          "Published destination artifact changed without deploy-scoped product codes",
      });
    }
  }

  const deployScope = resolveEngine6PrScopedDeployBlocking({
    addedOrModifiedProductCodes:
      args.addedOrModifiedProductCodes ??
      [...args.branchScopedProductCodes],
    deployScopedProductCodes:
      args.deployScopedProductCodes ?? [...args.branchScopedProductCodes],
  });

  let merchantFeed = {
    pass: true,
    appendedProductCodes: [] as string[],
    preservedExistingRowCount: 0,
    violations: [] as Array<{ productCode: string; detail: string }>,
  };

  if (args.baselineMerchantFeedCsv && args.proposedMerchantFeedCsv) {
    const baselineRows = parseMerchantFeedCsvRows(args.baselineMerchantFeedCsv);
    const proposedRows = parseMerchantFeedCsvRows(args.proposedMerchantFeedCsv);
    const result = validateEngine6MerchantFeedAppendOnlyScope({
      baselineRows,
      proposedRows,
      branchScopedProductCodes: new Set(deployScope.blockingProductCodes),
    });
    merchantFeed = result;
    for (const violation of result.violations) {
      blockedFiles.push({
        path: "data/merchantFeed.csv",
        kind: "merchant-feed-row-rewritten",
        detail: `${violation.productCode}: ${violation.detail}`,
      });
    }
  }

  let sitemap = {
    pass: true,
    appendedUrls: [] as string[],
    preservedExistingUrlCount: 0,
    violations: [] as Array<{ url: string; detail: string }>,
  };

  if (args.baselineSitemapXml && args.proposedSitemapXml) {
    const result = validateEngine6SitemapAppendOnlyScope({
      baselineXml: args.baselineSitemapXml,
      proposedXml: args.proposedSitemapXml,
    });
    sitemap = result;
    for (const violation of result.violations) {
      blockedFiles.push({
        path: "public/sitemap-tours.xml",
        kind: "sitemap-url-rewritten",
        detail: `${violation.url}: ${violation.detail}`,
      });
    }
  }

  return {
    moduleId: ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_MODULE_ID,
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    pass: blockedFiles.length === 0,
    branchScopedProductCodes: [...args.branchScopedProductCodes].sort(),
    blockedFiles,
    warnings,
    merchantFeed,
    sitemap,
    deployScope: {
      blockingProductCodes: deployScope.blockingProductCodes,
      reportOnlyProductCodes: deployScope.reportOnlyProductCodes,
    },
  };
};

export const formatEngine6ParagonBuildScopeGovernanceReport = (
  report: Engine6ParagonBuildScopeGovernanceReport
) => {
  const lines = [
    "# Engine6 Paragon Build Scope Governance",
    "",
    `Generated: ${report.generatedAt}`,
    `Pass: ${report.pass ? "yes" : "no"}`,
    "",
    `Branch-scoped product codes: ${report.branchScopedProductCodes.join(", ") || "none"}`,
    `Deploy-blocking product codes: ${report.deployScope.blockingProductCodes.join(", ") || "none"}`,
    "",
  ];

  if (report.blockedFiles.length > 0) {
    lines.push("## Blocked files", "");
    for (const blocked of report.blockedFiles) {
      lines.push(`- **${blocked.path}** (${blocked.kind}): ${blocked.detail}`);
    }
    lines.push("");
  }

  if (report.warnings.length > 0) {
    lines.push("## Warnings", "");
    for (const warning of report.warnings) {
      lines.push(`- **${warning.path}**: ${warning.detail}`);
    }
    lines.push("");
  }

  return lines.join("\n");
};
