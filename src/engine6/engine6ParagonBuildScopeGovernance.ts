import {
  validateMerchantFeedChangeScope,
  type MerchantFeedCsvRow,
} from "../../api/engine6/merchantFeedChangeScopeGovernance.js";
import {
  ENGINE6_PARAGON_PRODUCT_CODE,
  ENGINE6_SPECIMEN_PRODUCT_CODE,
} from "./routes.js";
import {
  classifyEngine6Stage2FindingSeverity,
  isEngine6Stage2StrictScopeProduct,
  type Engine6Stage2GovernanceAuditMode,
} from "./engine6Stage2GovernanceAudit.js";
import type { Engine6GovernanceMode } from "./engine6GovernanceMode.js";
import type { Engine6GitChangedFile } from "./resolveEngine6ChangedProductCodes.js";

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

/** Paths governance-only PRs may modify without destination build scope. */
export const ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_ALLOWLIST = [
  /^src\/engine6\/engine6ParagonBuildScopeGovernance(?:\.test)?\.ts$/,
  /^src\/engine6\/engine6CreationSelfHealing(?:\.test)?\.tsx?$/,
  /^src\/engine6\/ENGINE6_HARDENED_CONTRACT\.md$/,
  /^src\/engine6\/.*_GOVERNANCE_POLICY\.md$/,
  /^reports\/engine6-paragon-build-scope-governance.*\.(md|json)$/,
  /^reports\/engine6-creation-self-healing.*\.(md|json)$/,
  /^\.github\/workflows\/engine6.*\.yml$/,
] as const;

export const ENGINE6_PARAGON_REFERENCE_PRODUCT_CODES = [
  ENGINE6_PARAGON_PRODUCT_CODE,
  ENGINE6_SPECIMEN_PRODUCT_CODE,
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

const EXACT_PRODUCT_JSON_PATH =
  /^data\/engine6\/viator\/([A-Z0-9_]+)\.exact-product\.json$/i;

const GENERATED_CATALOG_PATH_PATTERNS = [
  /^data\/engine6\/viator\/[A-Z0-9_]+\.exact-product\.json$/i,
  /^data\/merchantFeed\.csv$/,
  /^public\/sitemap(?:-[a-z-]+)?\.xml$/,
  /^src\/engine6\/validationFixtures\.ts$/,
  /^src\/engine6\/routes\.ts$/,
  /^src\/engine6\/.*ViatorPublicRatings\.ts$/,
  /^reports\/engine6-.*\.(json|md)$/,
] as const;

const PARAGON_PROTECTED_PATH_PATTERNS = [
  new RegExp(
    `data/engine6/viator/(?:${ENGINE6_PARAGON_PRODUCT_CODE}|${ENGINE6_SPECIMEN_PRODUCT_CODE})\\.exact-product\\.json`,
    "i"
  ),
  /^src\/engine6\/validationFixtures\.ts$/,
  /^src\/engine6\/routes\.ts$/,
  /^src\/pages\/engine6\/Engine6SpecimenRoute\.tsx$/,
  /^api\/engine6\/itineraryTitleOverrides\.ts$/,
] as const;

const PUBLISHED_DESTINATION_PATH_PATTERNS =
  ENGINE6_PUBLISHED_DESTINATION_SLUGS.map(
    slug =>
      new RegExp(
        `(?:^scripts/(?:generate-)?${slug}(?:-engine6(?:-fixtures)?|-product-selection)|^data/engine6/(?:destinations/)?${slug}/|^data/engine6/viator/.*${slug})`,
        "i"
      )
  );

export const ENGINE6_GOVERNANCE_CLEANUP_LOOP_MAX_MS = 5 * 60 * 1000;

export type Engine6BuildScopeFileKind =
  | "governance-allowlisted"
  | "branch-scoped-generated"
  | "unrelated-generated"
  | "paragon-reference-protected"
  | "published-destination-protected"
  | "unrelated";

export type Engine6BuildScopeFileViolationKind =
  | "unrelated-generated-catalog"
  | "paragon-reference-modified"
  | "published-destination-modified"
  | "merchant-feed-row-rewritten"
  | "sitemap-url-rewritten"
  | "cleanup-loop-timeout"
  | "cleanup-loop-repeated-cycle";

export type Engine6BuildScopeFileViolation = {
  path: string;
  kind: Engine6BuildScopeFileViolationKind;
  detail: string;
};

export type Engine6EditorialFindingSeverity =
  | "blocking"
  | "warning"
  | "informational";

export type Engine6ParagonBuildScopeGovernanceReport = {
  moduleId: typeof ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_MODULE_ID;
  generatedAt: string;
  pass: boolean;
  branchScopedProductCodes: string[];
  blockedFiles: Engine6BuildScopeFileViolation[];
  warnings: Array<{ path: string; detail: string }>;
  informational: Array<{ path: string; detail: string }>;
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
  cleanupLoop: {
    stopped: boolean;
    reason: string | null;
    cycleCount: number;
    elapsedMs: number;
  };
  idempotency: {
    pass: boolean;
    repeatedFileWrites: string[];
  };
  deployScope: {
    blockingProductCodes: string[];
    reportOnlyProductCodes: string[];
  };
};

export type Engine6GovernanceCleanupLoopState = {
  startedAtMs: number;
  cycleFingerprints: string[];
  lastCycleAtMs: number | null;
};

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

export const isEngine6ParagonBuildScopeGovernanceAllowlistedPath = (
  filePath: string
) =>
  ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_ALLOWLIST.some(pattern =>
    pattern.test(filePath)
  );

export const isEngine6GeneratedCatalogPath = (filePath: string) =>
  GENERATED_CATALOG_PATH_PATTERNS.some(pattern => pattern.test(filePath));

export const isEngine6ParagonProtectedPath = (filePath: string) =>
  PARAGON_PROTECTED_PATH_PATTERNS.some(pattern => pattern.test(filePath));

export const isEngine6PublishedDestinationProtectedPath = (filePath: string) =>
  PUBLISHED_DESTINATION_PATH_PATTERNS.some(pattern => pattern.test(filePath));

export const extractEngine6ProductCodeFromExactProductPath = (filePath: string) => {
  const match = filePath.match(EXACT_PRODUCT_JSON_PATH);
  return match ? normalizeProductCode(match[1]) : null;
};

export const isEngine6ParagonReferenceProductPath = (
  filePath: string,
  scopedProductCodes: ReadonlySet<string>
) => {
  const productCode = extractEngine6ProductCodeFromExactProductPath(filePath);
  if (!productCode) {
    return isEngine6ParagonProtectedPath(filePath);
  }

  if (!ENGINE6_PARAGON_REFERENCE_PRODUCT_CODES.includes(productCode as never)) {
    return false;
  }

  return !scopedProductCodes.has(productCode);
};

export const classifyEngine6BuildScopeFileChange = (args: {
  file: Engine6GitChangedFile;
  branchScopedProductCodes: ReadonlySet<string>;
  explicitlyScopedParagonPaths?: ReadonlySet<string>;
}): Engine6BuildScopeFileKind => {
  const { path } = args.file;

  if (isEngine6ParagonBuildScopeGovernanceAllowlistedPath(path)) {
    return "governance-allowlisted";
  }

  const productCode = extractEngine6ProductCodeFromExactProductPath(path);
  if (productCode && args.branchScopedProductCodes.has(productCode)) {
    return "branch-scoped-generated";
  }

  if (
    isEngine6ParagonReferenceProductPath(path, args.branchScopedProductCodes) &&
    !args.explicitlyScopedParagonPaths?.has(path)
  ) {
    return "paragon-reference-protected";
  }

  if (
    isEngine6PublishedDestinationProtectedPath(path) &&
    !args.branchScopedProductCodes.size
  ) {
    return "published-destination-protected";
  }

  if (isEngine6GeneratedCatalogPath(path)) {
    if (productCode && args.branchScopedProductCodes.has(productCode)) {
      return "branch-scoped-generated";
    }
    return "unrelated-generated";
  }

  return "unrelated";
};

export const parseSitemapLocUrls = (sitemapXml: string) => {
  const urls: string[] = [];
  for (const match of sitemapXml.matchAll(
    /<loc>(https:\/\/www\.alloutdooradventures\.com[^<]*)<\/loc>/g
  )) {
    urls.push(match[1].replace(/\/$/, ""));
  }
  return urls;
};

export type Engine6SitemapAppendOnlyValidationResult = {
  pass: boolean;
  violations: Array<{ url: string; detail: string }>;
  appendedUrls: string[];
  preservedExistingUrlCount: number;
};

export const validateEngine6SitemapAppendOnlyScope = (args: {
  baselineXml: string;
  proposedXml: string;
  branchScopedTourPaths?: ReadonlySet<string>;
}): Engine6SitemapAppendOnlyValidationResult => {
  const baselineUrls = parseSitemapLocUrls(args.baselineXml);
  const proposedUrls = parseSitemapLocUrls(args.proposedXml);
  const baselineSet = new Set(baselineUrls);
  const proposedSet = new Set(proposedUrls);
  const branchScopedPaths = args.branchScopedTourPaths ?? new Set<string>();
  const violations: Array<{ url: string; detail: string }> = [];

  for (const url of baselineUrls) {
    if (!proposedSet.has(url)) {
      violations.push({
        url,
        detail:
          "existing sitemap URL removed; destination PRs may only append new URLs",
      });
      continue;
    }

    const path = url.replace("https://www.alloutdooradventures.com", "");
    if (branchScopedPaths.has(path)) {
      continue;
    }

    const baselineIndex = baselineUrls.indexOf(url);
    const proposedIndex = proposedUrls.indexOf(url);
    if (baselineIndex !== proposedIndex) {
      violations.push({
        url,
        detail:
          "existing sitemap URL reordered or rewritten outside branch scope",
      });
    }
  }

  const appendedUrls = proposedUrls.filter(url => !baselineSet.has(url));

  return {
    pass: violations.length === 0,
    violations,
    appendedUrls,
    preservedExistingUrlCount: baselineUrls.length,
  };
};

export const createEngine6GovernanceCleanupLoopState = (
  startedAtMs: number = Date.now()
): Engine6GovernanceCleanupLoopState => ({
  startedAtMs,
  cycleFingerprints: [],
  lastCycleAtMs: null,
});

export const recordEngine6GovernanceCleanupCycle = (
  state: Engine6GovernanceCleanupLoopState,
  fingerprint: string,
  nowMs: number = Date.now()
): {
  state: Engine6GovernanceCleanupLoopState;
  stopped: boolean;
  reason: string | null;
} => {
  const elapsedMs = nowMs - state.startedAtMs;
  const repeatedCycle = state.cycleFingerprints.includes(fingerprint);

  const nextState: Engine6GovernanceCleanupLoopState = {
    ...state,
    cycleFingerprints: [...state.cycleFingerprints, fingerprint],
    lastCycleAtMs: nowMs,
  };

  if (elapsedMs > ENGINE6_GOVERNANCE_CLEANUP_LOOP_MAX_MS) {
    return {
      state: nextState,
      stopped: true,
      reason: `unrelated cleanup loop exceeded ${ENGINE6_GOVERNANCE_CLEANUP_LOOP_MAX_MS / 1000 / 60} minute limit`,
    };
  }

  if (repeatedCycle) {
    return {
      state: nextState,
      stopped: true,
      reason: "unrelated cleanup loop repeated the same fix cycle",
    };
  }

  return { state: nextState, stopped: false, reason: null };
};

export const detectEngine6GovernanceIdempotentFileWrites = (args: {
  proposedWrites: ReadonlyArray<{ path: string; content: string }>;
  priorWrites: ReadonlyArray<{ path: string; content: string }>;
}) => {
  const priorByPath = new Map(
    args.priorWrites.map(write => [write.path, write.content])
  );
  const repeatedFileWrites: string[] = [];

  for (const write of args.proposedWrites) {
    const priorContent = priorByPath.get(write.path);
    if (priorContent !== undefined && priorContent === write.content) {
      repeatedFileWrites.push(write.path);
    }
  }

  return {
    pass: repeatedFileWrites.length === 0,
    repeatedFileWrites,
  };
};

const BLOCKING_EDITORIAL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /wrong destination|cross-destination|destination bleed/i,
    label: "wrong destination/city/park",
  },
  {
    pattern: /title.*description.*contradict|description.*title.*contradict/i,
    label: "contradiction between title and description",
  },
  {
    pattern:
      /claims activity.*not in source|location.*not in source|activity.*not in source/i,
    label: "product claims activity/location not in source",
  },
  {
    pattern: /json-ld.*mismatch|rendered content mismatch|schema.*mismatch/i,
    label: "Product JSON-LD/rendered content mismatch",
  },
  {
    pattern: /merchant feed.*governed description|governed description.*merchant feed/i,
    label: "merchant feed/governed description mismatch",
  },
  {
    pattern: /missing commercial|commercial fields missing/i,
    label: "missing commercial fields",
  },
  {
    pattern: /unavailable|removed|blocked product/i,
    label: "unavailable/removed/blocked product",
  },
  {
    pattern: /misleading hero|hero.*mismatch/i,
    label: "misleading hero",
  },
  {
    pattern: /merchant feed row rewritten|old merchant feed row/i,
    label: "old merchant feed row rewritten",
  },
  {
    pattern: /sitemap url rewritten|old sitemap url/i,
    label: "old sitemap URL rewritten",
  },
  {
    pattern: /paragon reference|5119P13|63657P1/i,
    label: "Paragon reference product modified",
  },
];

const WARNING_EDITORIAL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /keyword|style mismatch/i, label: "keyword/style mismatch" },
  {
    pattern: /first sentence.*destination name|destination name.*first sentence/i,
    label: "first sentence missing destination name",
  },
  {
    pattern: /wording could be more natural|more natural wording/i,
    label: "wording could be more natural",
  },
  {
    pattern: /minor phrasing|phrasing difference without meaning/i,
    label: "minor phrasing difference without meaning change",
  },
  {
    pattern: /cosmetic itinerary|itinerary phrasing/i,
    label: "cosmetic itinerary phrasing issue",
  },
];

export const classifyEngine6EditorialFindingSeverity = (
  message: string
): Engine6EditorialFindingSeverity => {
  if (BLOCKING_EDITORIAL_PATTERNS.some(entry => entry.pattern.test(message))) {
    return "blocking";
  }

  if (WARNING_EDITORIAL_PATTERNS.some(entry => entry.pattern.test(message))) {
    return "warning";
  }

  if (/unchanged legacy|legacy finding|non-deploy-scoped|report-only/i.test(message)) {
    return "informational";
  }

  return "blocking";
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

  const blockingProductCodes = [...addedOrModified].filter(code =>
    deployScoped.has(code)
  );
  const reportOnlyProductCodes = [...deployScoped].filter(
    code => !addedOrModified.has(code)
  );

  return {
    blockingProductCodes: blockingProductCodes.sort(),
    reportOnlyProductCodes: reportOnlyProductCodes.sort(),
    shouldBlockFinding: (
      productCode: string | null | undefined,
      message: string,
      options?: { warningOnly?: boolean; alwaysBlock?: boolean }
    ) => {
      const editorialSeverity = classifyEngine6EditorialFindingSeverity(message);
      if (editorialSeverity === "informational") {
        return false;
      }
      if (editorialSeverity === "warning") {
        return false;
      }

      const governanceMode = args.governanceMode ?? "warn";
      const mode = args.mode ?? "pr-scoped";
      const severity = classifyEngine6Stage2FindingSeverity({
        governanceMode,
        mode,
        productCode,
        scopedProductCodes: new Set(blockingProductCodes),
        alwaysBlock: options?.alwaysBlock,
        warningOnly: options?.warningOnly ?? editorialSeverity === "warning",
      });

      return severity === "blocking";
    },
    classifyStage2Severity: (
      productCode: string | null | undefined,
      message: string,
      options?: { warningOnly?: boolean; alwaysBlock?: boolean }
    ) => {
      const editorialSeverity = classifyEngine6EditorialFindingSeverity(message);
      if (editorialSeverity === "informational") {
        return "legacy" as const;
      }
      if (editorialSeverity === "warning") {
        return "warning" as const;
      }

      const governanceMode = args.governanceMode ?? "warn";
      const mode = args.mode ?? "pr-scoped";
      return classifyEngine6Stage2FindingSeverity({
        governanceMode,
        mode,
        productCode,
        scopedProductCodes: new Set(blockingProductCodes),
        alwaysBlock: options?.alwaysBlock,
        warningOnly: options?.warningOnly,
      });
    },
    isDeployScopedProduct: (productCode: string | null | undefined) =>
      isEngine6Stage2StrictScopeProduct(
        productCode,
        new Set(blockingProductCodes)
      ),
  };
};

export const validateEngine6ParagonBuildScope = (args: {
  changedFiles: readonly Engine6GitChangedFile[];
  branchScopedProductCodes: ReadonlySet<string>;
  baselineMerchantFeedRows?: MerchantFeedCsvRow[];
  proposedMerchantFeedRows?: MerchantFeedCsvRow[];
  baselineSitemapXml?: string;
  proposedSitemapXml?: string;
  branchScopedTourPaths?: ReadonlySet<string>;
  cleanupLoopState?: Engine6GovernanceCleanupLoopState;
  priorFileWrites?: ReadonlyArray<{ path: string; content: string }>;
  proposedFileWrites?: ReadonlyArray<{ path: string; content: string }>;
  addedOrModifiedProductCodes?: readonly string[];
  deployScopedProductCodes?: readonly string[];
  explicitlyScopedParagonPaths?: ReadonlySet<string>;
  generatedAt?: string;
}): Engine6ParagonBuildScopeGovernanceReport => {
  const blockedFiles: Engine6BuildScopeFileViolation[] = [];
  const warnings: Array<{ path: string; detail: string }> = [];
  const informational: Array<{ path: string; detail: string }> = [];

  for (const file of args.changedFiles) {
    const kind = classifyEngine6BuildScopeFileChange({
      file,
      branchScopedProductCodes: args.branchScopedProductCodes,
      explicitlyScopedParagonPaths: args.explicitlyScopedParagonPaths,
    });

    switch (kind) {
      case "unrelated-generated":
        blockedFiles.push({
          path: file.path,
          kind: "unrelated-generated-catalog",
          detail:
            "generated/catalog file changed outside branch-scoped product codes",
        });
        break;
      case "paragon-reference-protected":
        blockedFiles.push({
          path: file.path,
          kind: "paragon-reference-modified",
          detail:
            "Paragon reference tour, fixture, route, or mock modified without explicit scope",
        });
        break;
      case "published-destination-protected":
        warnings.push({
          path: file.path,
          detail:
            "published destination artifact touched; verify explicit governance authorization",
        });
        break;
      case "governance-allowlisted":
        informational.push({
          path: file.path,
          detail: "governance-only allowlisted file",
        });
        break;
      default:
        break;
    }
  }

  let merchantFeedResult: Engine6ParagonBuildScopeGovernanceReport["merchantFeed"] =
    {
      pass: true,
      appendedProductCodes: [],
      preservedExistingRowCount: 0,
      violations: [],
    };

  if (args.baselineMerchantFeedRows && args.proposedMerchantFeedRows) {
    const validation = validateMerchantFeedChangeScope(
      args.baselineMerchantFeedRows,
      args.proposedMerchantFeedRows,
      { branchModifiedProductCodes: args.branchScopedProductCodes }
    );
    merchantFeedResult = {
      pass: validation.pass,
      appendedProductCodes: validation.appendedProductCodes,
      preservedExistingRowCount: validation.preservedExistingRowCount,
      violations: validation.violations.map(violation => ({
        productCode: violation.productCode,
        detail: violation.detail,
      })),
    };

    for (const violation of validation.violations) {
      if (
        violation.kind === "unchanged-row-modified" ||
        violation.kind === "removed-row"
      ) {
        blockedFiles.push({
          path: "data/merchantFeed.csv",
          kind: "merchant-feed-row-rewritten",
          detail: `${violation.productCode}: ${violation.detail}`,
        });
      }
    }
  }

  let sitemapResult: Engine6ParagonBuildScopeGovernanceReport["sitemap"] = {
    pass: true,
    appendedUrls: [],
    preservedExistingUrlCount: 0,
    violations: [],
  };

  if (args.baselineSitemapXml && args.proposedSitemapXml) {
    const validation = validateEngine6SitemapAppendOnlyScope({
      baselineXml: args.baselineSitemapXml,
      proposedXml: args.proposedSitemapXml,
      branchScopedTourPaths: args.branchScopedTourPaths,
    });
    sitemapResult = {
      pass: validation.pass,
      appendedUrls: validation.appendedUrls,
      preservedExistingUrlCount: validation.preservedExistingUrlCount,
      violations: validation.violations,
    };

    for (const violation of validation.violations) {
      blockedFiles.push({
        path: "public/sitemap-tours.xml",
        kind: "sitemap-url-rewritten",
        detail: `${violation.url}: ${violation.detail}`,
      });
    }
  }

  const cleanupLoop = args.cleanupLoopState ?? {
    startedAtMs: Date.now(),
    cycleFingerprints: [],
    lastCycleAtMs: null,
  };

  const idempotency = detectEngine6GovernanceIdempotentFileWrites({
    proposedWrites: args.proposedFileWrites ?? [],
    priorWrites: args.priorFileWrites ?? [],
  });

  if (!idempotency.pass) {
    for (const path of idempotency.repeatedFileWrites) {
      warnings.push({
        path,
        detail: "governance proposed rewriting file with identical content",
      });
    }
  }

  const deployScope = resolveEngine6PrScopedDeployBlocking({
    addedOrModifiedProductCodes: args.addedOrModifiedProductCodes ?? [
      ...args.branchScopedProductCodes,
    ],
    deployScopedProductCodes:
      args.deployScopedProductCodes ?? [...args.branchScopedProductCodes],
  });

  const pass =
    blockedFiles.length === 0 &&
    merchantFeedResult.pass &&
    sitemapResult.pass &&
    !cleanupLoop.cycleFingerprints.some((_, index, arr) => {
      const fingerprint = arr[index];
      return arr.indexOf(fingerprint) !== index;
    });

  return {
    moduleId: ENGINE6_PARAGON_BUILD_SCOPE_GOVERNANCE_MODULE_ID,
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    pass,
    branchScopedProductCodes: [...args.branchScopedProductCodes].sort(),
    blockedFiles,
    warnings,
    informational,
    merchantFeed: merchantFeedResult,
    sitemap: sitemapResult,
    cleanupLoop: {
      stopped: false,
      reason: null,
      cycleCount: cleanupLoop.cycleFingerprints.length,
      elapsedMs: Date.now() - cleanupLoop.startedAtMs,
    },
    idempotency,
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
    `# Engine6 Paragon Build Scope Governance`,
    ``,
    `Generated: ${report.generatedAt}`,
    `Pass: ${report.pass ? "yes" : "no"}`,
    `Branch-scoped product codes: ${report.branchScopedProductCodes.join(", ") || "(none)"}`,
    ``,
    `## Blocked files (${report.blockedFiles.length})`,
    ...report.blockedFiles.map(
      violation => `- [${violation.kind}] ${violation.path}: ${violation.detail}`
    ),
    ``,
    `## Warnings (${report.warnings.length})`,
    ...report.warnings.map(warning => `- ${warning.path}: ${warning.detail}`),
    ``,
    `## Informational (${report.informational.length})`,
    ...report.informational.map(
      entry => `- ${entry.path}: ${entry.detail}`
    ),
    ``,
    `## Merchant feed`,
    `Pass: ${report.merchantFeed.pass ? "yes" : "no"}`,
    `Appended: ${report.merchantFeed.appendedProductCodes.join(", ") || "(none)"}`,
    `Preserved existing rows: ${report.merchantFeed.preservedExistingRowCount}`,
    ...report.merchantFeed.violations.map(
      violation => `- ${violation.productCode}: ${violation.detail}`
    ),
    ``,
    `## Sitemap`,
    `Pass: ${report.sitemap.pass ? "yes" : "no"}`,
    `Appended: ${report.sitemap.appendedUrls.length}`,
    `Preserved existing URLs: ${report.sitemap.preservedExistingUrlCount}`,
    ...report.sitemap.violations.map(
      violation => `- ${violation.url}: ${violation.detail}`
    ),
    ``,
    `## Deploy scope`,
    `Blocking product codes: ${report.deployScope.blockingProductCodes.join(", ") || "(none)"}`,
    `Report-only product codes: ${report.deployScope.reportOnlyProductCodes.join(", ") || "(none)"}`,
    ``,
    `## Idempotency`,
    `Pass: ${report.idempotency.pass ? "yes" : "no"}`,
    ...(report.idempotency.repeatedFileWrites.length > 0
      ? report.idempotency.repeatedFileWrites.map(path => `- repeated: ${path}`)
      : ["- no repeated writes"]),
  ];

  return lines.join("\n");
};
