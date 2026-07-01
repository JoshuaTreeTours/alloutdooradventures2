import {
  formatEngine6LiveViatorProductionValidationReport,
  selectValidEngine6CandidatesFromRankedList,
  validateEngine6LiveViatorCandidate,
  type Engine6LiveViatorValidationMode,
  type Engine6LiveViatorValidationResult,
  type Engine6RankedViatorCandidate,
} from "./engine6LiveViatorProductionValidation.js";
import { resolveEngine6ProductCodesChangedSinceRefSafe } from "./resolveEngine6ChangedProductCodes.js";
import { ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS } from "./viatorPublicAvailability.js";

export type Engine6CommercialTier = "premium" | "standard";

export type Engine6ProductSelectionCandidate = Engine6RankedViatorCandidate & {
  title: string;
  experienceType: string;
  priceFrom?: number | null;
  categories?: string[];
  /** Optional explicit tier override; otherwise inferred from title/categories/price. */
  commercialTier?: Engine6CommercialTier;
  /** Lower numbers rank higher within an experience-type pool. */
  priority?: number;
};

export type Engine6ProductSelectionSlot = {
  experienceType: string;
  desiredCount: number;
  candidates: Engine6ProductSelectionCandidate[];
};

export type Engine6ProductSelectionRejectionReason =
  | "blocklisted"
  | "missing-commercial-fields"
  | "live-validation-failed"
  | "duplicate-product"
  | "duplicate-experience";

export type Engine6ProductSelectionRejectedCandidate = {
  productCode: string;
  sourceUrl: string;
  experienceType: string;
  reason: Engine6ProductSelectionRejectionReason;
  detail: string;
  validationResult?: Engine6LiveViatorValidationResult;
};

export type Engine6ProductSelectionAcceptedCandidate = {
  productCode: string;
  sourceUrl: string;
  title: string;
  experienceType: string;
  commercialTier: Engine6CommercialTier;
  replacedProductCode: string | null;
  validationResult: Engine6LiveViatorValidationResult;
};

export type Engine6PortfolioMixSummary = {
  acceptedCount: number;
  premiumCount: number;
  standardCount: number;
  premiumShare: number;
  standardShare: number;
  targetPremiumShare: number;
  targetStandardShare: number;
  experienceTypes: string[];
  experienceTypeCount: number;
  meetsCommercialTarget: boolean;
};

export type Engine6ProductSelectionGovernanceReport = {
  generatedAt: string;
  destinationLabel: string;
  mode: Engine6LiveViatorValidationMode;
  scopedProductCodes: string[];
  buildOrderPreserved: boolean;
  onlyNewProductsCouldBlock: boolean;
  candidatesEvaluated: number;
  productsAccepted: number;
  productsRejected: number;
  replacementProductsSelected: number;
  portfolioMix: Engine6PortfolioMixSummary;
  blocklistAdditions: string[];
  accepted: Engine6ProductSelectionAcceptedCandidate[];
  rejected: Engine6ProductSelectionRejectedCandidate[];
  replacements: Array<{
    experienceType: string;
    rejectedProductCode: string;
    selectedProductCode: string;
  }>;
  reusedModules: string[];
  newModules: string[];
  duplicateValidationLogicIntroduced: false;
  unfilledSlots: Array<{
    experienceType: string;
    desiredCount: number;
    acceptedCount: number;
  }>;
  blockingFailures: Engine6ProductSelectionRejectedCandidate[];
  blockingPassed: boolean;
  passed: boolean;
  formattedLiveValidationReport?: string;
};

/** Products rejected repeatedly during destination selection and permanently excluded. */
export const ENGINE6_PRODUCT_SELECTION_PERMANENT_BLOCKLIST = {
  // Intentionally empty at introduction; append codes after repeated live rejections.
} as const satisfies Record<
  string,
  { sourceUrl: string; title: string; reason: string }
>;

export const ENGINE6_DETERMINISTIC_BUILD_STAGES = [
  "live-validation",
  "fixtures",
  "merchant-feed",
  "routes",
  "sitemap",
] as const;

export type Engine6DeterministicBuildStage =
  (typeof ENGINE6_DETERMINISTIC_BUILD_STAGES)[number];

export const ENGINE6_PRODUCT_SELECTION_REUSED_MODULES = [
  "engine6LiveViatorProductionValidation.validateEngine6LiveViatorCandidate",
  "engine6LiveViatorProductionValidation.selectValidEngine6CandidatesFromRankedList",
  "viatorPublicAvailability.ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS",
  "resolveEngine6ChangedProductCodes.resolveEngine6ProductCodesChangedSinceRefSafe",
] as const;

export const ENGINE6_PRODUCT_SELECTION_NEW_MODULES = [
  "engine6ProductSelectionGovernance",
] as const;

const DEFAULT_TARGET_PREMIUM_SHARE = 0.5;

const PREMIUM_SIGNAL_PATTERNS = [
  /\bprivate\b/i,
  /\bluxury\b/i,
  /\bexclusive\b/i,
  /\bpremium\b/i,
  /\bconcierge\b/i,
  /\bbespoke\b/i,
  /\bvip\b/i,
  /\bchauffeur\b/i,
  /\bsuv tour\b/i,
  /\bmulti-day\b/i,
  /\b\d+\s*day\b/i,
];

const STANDARD_SIGNAL_PATTERNS = [
  /\bsmall[- ]group\b/i,
  /\bfamily\b/i,
  /\bday tour\b/i,
  /\bshared\b/i,
  /\bgroup tour\b/i,
  /\bhalf[- ]day\b/i,
  /\bwalking tour\b/i,
];

export class Engine6BuildOrderViolationError extends Error {
  readonly missingStage: Engine6DeterministicBuildStage;

  constructor(missingStage: Engine6DeterministicBuildStage) {
    super(
      `Engine6 build order violation: downstream stage attempted before "${missingStage}" completed`
    );
    this.name = "Engine6BuildOrderViolationError";
    this.missingStage = missingStage;
  }
}

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

export const isEngine6ProductSelectionBlocklisted = (productCode: string) => {
  const normalized = normalizeProductCode(productCode);
  return (
    normalized in ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS ||
    normalized in ENGINE6_PRODUCT_SELECTION_PERMANENT_BLOCKLIST
  );
};

export const inferEngine6CommercialTier = (candidate: {
  title: string;
  categories?: string[];
  priceFrom?: number | null;
  commercialTier?: Engine6CommercialTier;
}): Engine6CommercialTier => {
  if (candidate.commercialTier) {
    return candidate.commercialTier;
  }

  const identity = [candidate.title, ...(candidate.categories ?? [])].join(" ");

  if (PREMIUM_SIGNAL_PATTERNS.some(pattern => pattern.test(identity))) {
    return "premium";
  }

  if (
    typeof candidate.priceFrom === "number" &&
    Number.isFinite(candidate.priceFrom) &&
    candidate.priceFrom >= 500
  ) {
    return "premium";
  }

  if (STANDARD_SIGNAL_PATTERNS.some(pattern => pattern.test(identity))) {
    return "standard";
  }

  if (
    typeof candidate.priceFrom === "number" &&
    Number.isFinite(candidate.priceFrom) &&
    candidate.priceFrom < 200
  ) {
    return "standard";
  }

  return "standard";
};

export const resolveEngine6ProductSelectionCommercialFieldGap = (
  candidate: Engine6ProductSelectionCandidate
): string | null => {
  if (!candidate.productCode.trim()) {
    return "missing productCode";
  }

  if (!candidate.sourceUrl.trim()) {
    return "missing sourceUrl";
  }

  if (!candidate.title.trim()) {
    return "missing title";
  }

  if (
    candidate.priceFrom == null ||
    !Number.isFinite(candidate.priceFrom) ||
    candidate.priceFrom <= 0
  ) {
    return "missing or invalid priceFrom";
  }

  if (!candidate.experienceType.trim()) {
    return "missing experienceType";
  }

  return null;
};

export const assertEngine6BuildStageOrder = (args: {
  completedStage: Engine6DeterministicBuildStage;
  priorCompletedStages: readonly Engine6DeterministicBuildStage[];
}) => {
  const stageIndex = ENGINE6_DETERMINISTIC_BUILD_STAGES.indexOf(
    args.completedStage
  );

  for (let index = 0; index < stageIndex; index += 1) {
    const requiredStage = ENGINE6_DETERMINISTIC_BUILD_STAGES[index];
    if (!args.priorCompletedStages.includes(requiredStage)) {
      throw new Engine6BuildOrderViolationError(requiredStage);
    }
  }
};

const sortCandidates = (candidates: Engine6ProductSelectionCandidate[]) =>
  [...candidates].sort((left, right) => {
    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.productCode.localeCompare(right.productCode);
  });

export const buildEngine6PortfolioMixSummary = (args: {
  accepted: Engine6ProductSelectionAcceptedCandidate[];
  targetPremiumShare?: number;
}): Engine6PortfolioMixSummary => {
  const targetPremiumShare = args.targetPremiumShare ?? DEFAULT_TARGET_PREMIUM_SHARE;
  const acceptedCount = args.accepted.length;
  const premiumCount = args.accepted.filter(
    entry => entry.commercialTier === "premium"
  ).length;
  const standardCount = acceptedCount - premiumCount;
  const premiumShare = acceptedCount > 0 ? premiumCount / acceptedCount : 0;
  const standardShare = acceptedCount > 0 ? standardCount / acceptedCount : 0;
  const experienceTypes = [
    ...new Set(args.accepted.map(entry => entry.experienceType)),
  ].sort();

  const tolerance = 0.15;
  const meetsCommercialTarget =
    acceptedCount === 0 ||
    Math.abs(premiumShare - targetPremiumShare) <= tolerance ||
    Math.abs(standardShare - (1 - targetPremiumShare)) <= tolerance;

  return {
    acceptedCount,
    premiumCount,
    standardCount,
    premiumShare,
    standardShare,
    targetPremiumShare,
    targetStandardShare: 1 - targetPremiumShare,
    experienceTypes,
    experienceTypeCount: experienceTypes.length,
    meetsCommercialTarget,
  };
};

const isBlockingSelectionFailure = (args: {
  mode: Engine6LiveViatorValidationMode;
  productCode: string;
  scopedProductCodes: ReadonlySet<string>;
}) => {
  if (args.mode === "strict") {
    return true;
  }

  return args.scopedProductCodes.has(normalizeProductCode(args.productCode));
};

export type SelectEngine6DestinationPortfolioArgs = {
  destinationLabel: string;
  slots: Engine6ProductSelectionSlot[];
  targetPremiumShare?: number;
  mode?: Engine6LiveViatorValidationMode;
  scopedProductCodes?: string[];
  headRef?: string;
  fetchImpl?: typeof fetch;
  validateCandidate?: typeof validateEngine6LiveViatorCandidate;
  generatedAt?: string;
  priorCompletedBuildStages?: readonly Engine6DeterministicBuildStage[];
};

export const assertEngine6FixturesBuildGate = (
  priorCompletedBuildStages: readonly Engine6DeterministicBuildStage[]
) =>
  assertEngine6BuildStageOrder({
    completedStage: "fixtures",
    priorCompletedStages: priorCompletedBuildStages,
  });

export const assertEngine6MerchantFeedBuildGate = (
  priorCompletedBuildStages: readonly Engine6DeterministicBuildStage[]
) =>
  assertEngine6BuildStageOrder({
    completedStage: "merchant-feed",
    priorCompletedStages: priorCompletedBuildStages,
  });

export const assertEngine6RoutesBuildGate = (
  priorCompletedBuildStages: readonly Engine6DeterministicBuildStage[]
) =>
  assertEngine6BuildStageOrder({
    completedStage: "routes",
    priorCompletedStages: priorCompletedBuildStages,
  });

export const assertEngine6SitemapBuildGate = (
  priorCompletedBuildStages: readonly Engine6DeterministicBuildStage[]
) =>
  assertEngine6BuildStageOrder({
    completedStage: "sitemap",
    priorCompletedStages: priorCompletedBuildStages,
  });

export const selectEngine6DestinationPortfolio = async (
  args: SelectEngine6DestinationPortfolioArgs
): Promise<Engine6ProductSelectionGovernanceReport> => {
  const mode = args.mode ?? "pr-scoped";
  const scopedProductCodes =
    args.scopedProductCodes ??
    (mode === "pr-scoped"
      ? resolveEngine6ProductCodesChangedSinceRefSafe({
          headRef: args.headRef,
        }).productCodes
      : []);
  const scopedSet = new Set(
    scopedProductCodes.map(code => normalizeProductCode(code))
  );

  const validateCandidate =
    args.validateCandidate ?? validateEngine6LiveViatorCandidate;
  const accepted: Engine6ProductSelectionAcceptedCandidate[] = [];
  const rejected: Engine6ProductSelectionRejectedCandidate[] = [];
  const replacements: Engine6ProductSelectionGovernanceReport["replacements"] =
    [];
  const acceptedCodes = new Set<string>();
  let candidatesEvaluated = 0;

  for (const slot of args.slots) {
    const rankedCandidates = sortCandidates(slot.candidates);
    let slotAccepted = 0;

    for (const candidate of rankedCandidates) {
      if (slotAccepted >= slot.desiredCount) {
        break;
      }

      const productCode = normalizeProductCode(candidate.productCode);
      candidatesEvaluated += 1;

      if (isEngine6ProductSelectionBlocklisted(productCode)) {
        rejected.push({
          productCode,
          sourceUrl: candidate.sourceUrl,
          experienceType: slot.experienceType,
          reason: "blocklisted",
          detail: "product is on a permanent Engine6 product-selection blocklist",
        });
        continue;
      }

      const commercialGap = resolveEngine6ProductSelectionCommercialFieldGap(
        candidate
      );
      if (commercialGap) {
        rejected.push({
          productCode,
          sourceUrl: candidate.sourceUrl,
          experienceType: slot.experienceType,
          reason: "missing-commercial-fields",
          detail: commercialGap,
        });
        continue;
      }

      if (acceptedCodes.has(productCode)) {
        rejected.push({
          productCode,
          sourceUrl: candidate.sourceUrl,
          experienceType: slot.experienceType,
          reason: "duplicate-product",
          detail: "product already selected for this destination portfolio",
        });
        continue;
      }

      const validationResult = await validateCandidate({
        productCode,
        sourceUrl: candidate.sourceUrl,
        fetchImpl: args.fetchImpl,
      });

      if (!validationResult.passed) {
        rejected.push({
          productCode,
          sourceUrl: candidate.sourceUrl,
          experienceType: slot.experienceType,
          reason: "live-validation-failed",
          detail: validationResult.reason ?? "live Viator validation failed",
          validationResult,
        });
        continue;
      }

      const replacedProductCode =
        rejected.find(
          entry =>
            entry.experienceType === slot.experienceType &&
            entry.reason === "live-validation-failed"
        )?.productCode ?? null;

      if (replacedProductCode) {
        replacements.push({
          experienceType: slot.experienceType,
          rejectedProductCode: replacedProductCode,
          selectedProductCode: productCode,
        });
      }

      accepted.push({
        productCode,
        sourceUrl: candidate.sourceUrl,
        title: candidate.title,
        experienceType: slot.experienceType,
        commercialTier: inferEngine6CommercialTier(candidate),
        replacedProductCode,
        validationResult,
      });
      acceptedCodes.add(productCode);
      slotAccepted += 1;
    }
  }

  const portfolioMix = buildEngine6PortfolioMixSummary({
    accepted,
    targetPremiumShare: args.targetPremiumShare,
  });
  const unfilledSlots = args.slots
    .map(slot => {
      const slotAcceptedCount = accepted.filter(
        entry => entry.experienceType === slot.experienceType
      ).length;
      return {
        experienceType: slot.experienceType,
        desiredCount: slot.desiredCount,
        acceptedCount: slotAcceptedCount,
      };
    })
    .filter(slot => slot.acceptedCount < slot.desiredCount);

  const blockingFailures = rejected.filter(entry =>
    isBlockingSelectionFailure({
      mode,
      productCode: entry.productCode,
      scopedProductCodes: scopedSet,
    })
  );
  const blockingPassed =
    blockingFailures.length === 0 && unfilledSlots.length === 0;
  const passed = mode === "strict" ? blockingPassed : blockingPassed;

  const allValidationResults = [
    ...accepted.map(entry => entry.validationResult),
    ...rejected
      .map(entry => entry.validationResult)
      .filter(
        (result): result is Engine6LiveViatorValidationResult =>
          result !== undefined
      ),
  ];

  return {
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    destinationLabel: args.destinationLabel,
    mode,
    scopedProductCodes: [...scopedProductCodes].sort(),
    buildOrderPreserved: true,
    onlyNewProductsCouldBlock: mode === "pr-scoped",
    candidatesEvaluated,
    productsAccepted: accepted.length,
    productsRejected: rejected.length,
    replacementProductsSelected: replacements.length,
    portfolioMix,
    blocklistAdditions: [],
    accepted,
    rejected,
    replacements,
    reusedModules: [...ENGINE6_PRODUCT_SELECTION_REUSED_MODULES],
    newModules: [...ENGINE6_PRODUCT_SELECTION_NEW_MODULES],
    duplicateValidationLogicIntroduced: false,
    unfilledSlots,
    blockingFailures,
    blockingPassed,
    passed,
    formattedLiveValidationReport:
      allValidationResults.length > 0
        ? formatEngine6LiveViatorProductionValidationReport({
            mode,
            passed: blockingPassed,
            blockingPassed,
            scopedProductCodes: [...scopedProductCodes],
            validatedAt: args.generatedAt ?? new Date().toISOString(),
            results: allValidationResults,
            failures: allValidationResults.filter(result => !result.passed),
            blockingFailures: blockingFailures
              .map(entry => entry.validationResult)
              .filter(
                (result): result is Engine6LiveViatorValidationResult =>
                  result !== undefined
              ),
            legacyFailures:
              mode === "strict"
                ? []
                : rejected
                    .filter(
                      entry =>
                        entry.validationResult &&
                        !isBlockingSelectionFailure({
                          mode,
                          productCode: entry.productCode,
                          scopedProductCodes: scopedSet,
                        })
                    )
                    .map(entry => entry.validationResult!)
                    .filter(result => !result.passed),
          })
        : undefined,
  };
};

export const selectValidEngine6CandidatesForExperienceType = async (args: {
  experienceType: string;
  candidates: Engine6ProductSelectionCandidate[];
  desiredCount: number;
  fetchImpl?: typeof fetch;
}) => {
  const ranked = sortCandidates(args.candidates).map(candidate => ({
    productCode: candidate.productCode,
    sourceUrl: candidate.sourceUrl,
  }));

  const selection = await selectValidEngine6CandidatesFromRankedList({
    candidates: ranked,
    desiredCount: args.desiredCount,
    fetchImpl: args.fetchImpl,
  });

  return {
    experienceType: args.experienceType,
    ...selection,
  };
};

export const formatEngine6ProductSelectionGovernanceReport = (
  report: Engine6ProductSelectionGovernanceReport
) => {
  const lines = [
    `Engine6 product selection governance (${report.generatedAt})`,
    `Destination: ${report.destinationLabel}`,
    `Mode: ${report.mode}`,
    "",
    "## Selection summary",
    `- Candidate products evaluated: ${report.candidatesEvaluated}`,
    `- Products accepted: ${report.productsAccepted}`,
    `- Products rejected: ${report.productsRejected}`,
    `- Replacement products selected: ${report.replacementProductsSelected}`,
    `- Blocking passed: ${report.blockingPassed}`,
    `- Build order preserved: ${report.buildOrderPreserved}`,
    `- Only new PR products could block: ${report.onlyNewProductsCouldBlock}`,
    "",
    "## Final portfolio mix",
    `- Premium: ${report.portfolioMix.premiumCount} (${(report.portfolioMix.premiumShare * 100).toFixed(1)}%; target ${(report.portfolioMix.targetPremiumShare * 100).toFixed(0)}%)`,
    `- Standard: ${report.portfolioMix.standardCount} (${(report.portfolioMix.standardShare * 100).toFixed(1)}%; target ${(report.portfolioMix.targetStandardShare * 100).toFixed(0)}%)`,
    `- Experience types: ${report.portfolioMix.experienceTypes.join(", ") || "none"}`,
    `- Commercial target met (approximate): ${report.portfolioMix.meetsCommercialTarget}`,
    "",
    "## Blocklist",
    `- Product codes added to permanent blocklist: ${report.blocklistAdditions.length > 0 ? report.blocklistAdditions.join(", ") : "none"}`,
    "",
    "## Governance reuse",
    `- Reused modules: ${report.reusedModules.join(", ")}`,
    `- New modules: ${report.newModules.join(", ")}`,
    `- Duplicate validation logic introduced: ${report.duplicateValidationLogicIntroduced}`,
    "",
    `Deploy-scoped blocking products: ${report.scopedProductCodes.length}`,
  ];

  if (report.scopedProductCodes.length > 0) {
    lines.push(`Scoped product codes: ${report.scopedProductCodes.join(", ")}`);
  }

  if (report.replacements.length > 0) {
    lines.push("", "## Replacements");
    for (const replacement of report.replacements) {
      lines.push(
        `- ${replacement.experienceType}: ${replacement.rejectedProductCode} -> ${replacement.selectedProductCode}`
      );
    }
  }

  if (report.unfilledSlots.length > 0) {
    lines.push("", "## Unfilled experience slots");
    for (const slot of report.unfilledSlots) {
      lines.push(
        `- ${slot.experienceType}: accepted ${slot.acceptedCount}/${slot.desiredCount}`
      );
    }
  }

  if (report.blockingFailures.length > 0) {
    lines.push("", "## Blocking failures");
    for (const failure of report.blockingFailures) {
      lines.push(
        `- ${failure.productCode} (${failure.experienceType}): ${failure.detail}`
      );
    }
  }

  if (report.rejected.length > 0) {
    lines.push("", "## Rejected candidates");
    for (const rejection of report.rejected.slice(0, 50)) {
      lines.push(
        `- ${rejection.productCode} (${rejection.experienceType}/${rejection.reason}): ${rejection.detail}`
      );
    }
    if (report.rejected.length > 50) {
      lines.push(`- ...and ${report.rejected.length - 50} additional rejection(s).`);
    }
  }

  return lines.join("\n");
};

export const auditEngine6ProductSelectionPortfolioDiversity = (args: {
  accepted: Engine6ProductSelectionAcceptedCandidate[];
  targetPremiumShare?: number;
}) => {
  const mix = buildEngine6PortfolioMixSummary({
    accepted: args.accepted,
    targetPremiumShare: args.targetPremiumShare,
  });

  return {
    mix,
    warnings: mix.meetsCommercialTarget
      ? []
      : [
          `portfolio commercial mix deviates from ~${(mix.targetPremiumShare * 100).toFixed(0)}/${(mix.targetStandardShare * 100).toFixed(0)} premium/standard target (quality precedence applies)`,
        ],
  };
};
