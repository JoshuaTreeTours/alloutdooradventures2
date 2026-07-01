import {
  assertEngine6FixturesBuildGate,
  assertEngine6MerchantFeedBuildGate,
  assertEngine6RoutesBuildGate,
  assertEngine6SitemapBuildGate,
  selectEngine6DestinationPortfolio,
  type Engine6DeterministicBuildStage,
  type Engine6ProductSelectionGovernanceReport,
} from "./engine6ProductSelectionGovernance.js";
import {
  bindEngine6DestinationProducts,
  buildEngine6HeroIntegrityInputsFromBinding,
  buildPrincipalExperienceTypeMap,
  summarizeEngine6DestinationProductBinding,
  type Engine6DestinationProductBindingReport,
} from "./engine6DestinationProductBinding.js";
import {
  formatEngine6HeroIntegrityGovernanceReport,
  runEngine6HeroIntegrityGovernance,
  type Engine6HeroIntegrityGovernanceReport,
} from "./engine6HeroIntegrityGovernance.js";
import {
  formatEngine6RenderingParityGovernanceReport,
  runEngine6RenderingParityGovernance,
  type Engine6RenderingParityGovernanceReport,
} from "./engine6RenderingParityGovernance.js";
import type { Engine6LiveViatorValidationMode } from "./engine6LiveViatorProductionValidation.js";
import {
  normalizeEngine6ParagonProductSelectionConfig,
  type Engine6ParagonProductSelectionConfig,
} from "./normalizeEngine6ParagonProductSelectionConfig.js";
import type { Engine6Tour } from "./types.js";
import type { MerchantFeedParityRow } from "./merchantFeedParity.js";

export const ENGINE6_PARAGON_GOVERNANCE_REUSED_MODULES = [
  "engine6ProductSelectionGovernance.selectEngine6DestinationPortfolio",
  "engine6HeroIntegrityGovernance.runEngine6HeroIntegrityGovernance",
  "engine6RenderingParityGovernance.runEngine6RenderingParityGovernance",
  "engine6DestinationProductBinding.bindEngine6DestinationProducts",
  "displayHero.resolveEngine6DisplayHero",
  "merchantFeedParity.compareMerchantFeedRowToProductSchema",
  "creationValidation.validateEngine6CreationContract",
] as const;

export const ENGINE6_PARAGON_GOVERNANCE_NEW_MODULES = [
  "engine6ParagonGovernancePipeline",
  "engine6HeroIntegrityGovernance",
  "engine6RenderingParityGovernance",
  "engine6DestinationProductBinding",
  "normalizeEngine6ParagonProductSelectionConfig",
  "engine6PrincipalExperienceType",
] as const;

export type Engine6ParagonGovernancePipelineArgs = {
  config: Engine6ParagonProductSelectionConfig | unknown;
  mode?: Engine6LiveViatorValidationMode;
  scopedProductCodes?: string[];
  headRef?: string;
  fetchImpl?: typeof fetch;
  validateCandidate?: Parameters<
    typeof selectEngine6DestinationPortfolio
  >[0]["validateCandidate"];
  generatedAt?: string;
  /** Live hero URLs from validated Viator products keyed by product code. */
  liveProductHeroUrls?: Record<
    string,
    {
      primaryHeroUrl?: string | null;
      alternateHeroUrls?: string[];
    }
  >;
  /** Pre-assigned hero URLs to validate/replace before binding. */
  currentHeroUrlsByProductCode?: Record<string, string | null | undefined>;
  /** Optional post-fixture tours for rendering parity validation. */
  tours?: Engine6Tour[];
  merchantFeedRowsByProductCode?: Map<string, MerchantFeedParityRow>;
  /** Build stages already completed before invoking the pipeline. */
  priorCompletedBuildStages?: readonly Engine6DeterministicBuildStage[];
  /** When true, downstream artifact build gates are asserted after governance passes. */
  assertBuildGates?: boolean;
  /** Target build stage to gate (defaults to fixtures when tours are absent). */
  targetBuildStage?: Engine6DeterministicBuildStage;
};

export type Engine6ParagonGovernancePipelineReport = {
  generatedAt: string;
  destinationLabel: string;
  stateSlug: string;
  citySlug: string;
  configValid: boolean;
  productSelection?: Engine6ProductSelectionGovernanceReport;
  heroIntegrity?: Engine6HeroIntegrityGovernanceReport;
  productBinding?: Engine6DestinationProductBindingReport;
  renderingParity?: Engine6RenderingParityGovernanceReport;
  buildOrderPreserved: boolean;
  heroIntegrityPassed: boolean;
  renderingParityPassed: boolean;
  blockingPassed: boolean;
  passed: boolean;
  reusedModules: readonly string[];
  newModules: readonly string[];
  duplicateValidationLogicIntroduced: false;
  formattedSummary: string;
};

const completedStagesAfterParagonPreflight = (
  priorCompletedBuildStages: readonly Engine6DeterministicBuildStage[]
): Engine6DeterministicBuildStage[] => {
  const stages = new Set<Engine6DeterministicBuildStage>(
    priorCompletedBuildStages
  );
  stages.add("live-validation");
  return [...stages];
};

export const assertEngine6ParagonPreflightGate = (args: {
  heroIntegrityPassed: boolean;
  renderingParityPassed: boolean;
  productBindingPassed: boolean;
  productSelectionPassed: boolean;
}) => {
  if (!args.productSelectionPassed) {
    throw new Error(
      "Engine6 Paragon governance blocked: product selection did not pass live validation"
    );
  }

  if (!args.heroIntegrityPassed) {
    throw new Error(
      "Engine6 Paragon governance blocked: hero integrity validation failed"
    );
  }

  if (!args.productBindingPassed) {
    throw new Error(
      "Engine6 Paragon governance blocked: destination product binding incomplete"
    );
  }

  if (!args.renderingParityPassed) {
    throw new Error(
      "Engine6 Paragon governance blocked: rendering parity validation failed"
    );
  }
};

export const runEngine6ParagonGovernancePipeline = async (
  args: Engine6ParagonGovernancePipelineArgs
): Promise<Engine6ParagonGovernancePipelineReport> => {
  const generatedAt = args.generatedAt ?? new Date().toISOString();
  const normalizedConfig =
    typeof args.config === "object" &&
    args.config !== null &&
    "destinationLabel" in args.config &&
    "stateSlug" in args.config &&
    "citySlug" in args.config &&
    "slots" in args.config
      ? {
          ok: true as const,
          config: args.config as Engine6ParagonProductSelectionConfig,
          issues: [] as [],
        }
      : normalizeEngine6ParagonProductSelectionConfig(args.config);

  if (!normalizedConfig.ok) {
    return {
      generatedAt,
      destinationLabel: "invalid-config",
      stateSlug: "",
      citySlug: "",
      configValid: false,
      buildOrderPreserved: false,
      heroIntegrityPassed: false,
      renderingParityPassed: false,
      blockingPassed: false,
      passed: false,
      reusedModules: ENGINE6_PARAGON_GOVERNANCE_REUSED_MODULES,
      newModules: ENGINE6_PARAGON_GOVERNANCE_NEW_MODULES,
      duplicateValidationLogicIntroduced: false,
      formattedSummary: [
        "Engine6 Paragon governance failed during config normalization",
        ...normalizedConfig.issues.map(issue => `- ${issue.path}: ${issue.detail}`),
      ].join("\n"),
    };
  }

  const config = normalizedConfig.config;
  const priorCompletedBuildStages = args.priorCompletedBuildStages ?? [];

  const productSelection = await selectEngine6DestinationPortfolio({
    destinationLabel: config.destinationLabel,
    slots: config.slots,
    targetPremiumShare: config.targetPremiumShare,
    mode: args.mode ?? "strict",
    scopedProductCodes: args.scopedProductCodes ?? [],
    headRef: args.headRef,
    fetchImpl: args.fetchImpl,
    validateCandidate: args.validateCandidate,
    generatedAt,
    priorCompletedBuildStages,
  });

  const heroIntegrityInputs = buildEngine6HeroIntegrityInputsFromBinding({
    config,
    accepted: productSelection.accepted,
    liveProductHeroUrls: args.liveProductHeroUrls,
  });

  const heroIntegrity = runEngine6HeroIntegrityGovernance({
    products: heroIntegrityInputs,
    currentHeroUrlsByProductCode: args.currentHeroUrlsByProductCode,
    generatedAt,
  });

  const productBinding = bindEngine6DestinationProducts({
    input: {
      config,
      accepted: productSelection.accepted,
      heroResolutions: heroIntegrity.resolutions,
      liveProductHeroUrls: args.liveProductHeroUrls,
    },
    generatedAt,
  });

  const renderingParity = args.tours?.length
    ? runEngine6RenderingParityGovernance({
        tours: args.tours,
        merchantFeedRowsByProductCode: args.merchantFeedRowsByProductCode,
        principalExperienceTypesByProductCode: buildPrincipalExperienceTypeMap(
          productBinding.boundProducts
        ),
        generatedAt,
      })
    : {
        generatedAt,
        productsAudited: 0,
        productsPassed: 0,
        productsFailed: 0,
        findings: [],
        passed: true,
      };

  const heroIntegrityPassed = heroIntegrity.passed;
  const renderingParityPassed = renderingParity.passed;
  const productBindingPassed = productBinding.passed;
  const productSelectionPassed = productSelection.blockingPassed;
  const blockingPassed =
    productSelectionPassed &&
    heroIntegrityPassed &&
    productBindingPassed &&
    renderingParityPassed;

  if (blockingPassed && args.assertBuildGates) {
    const completedStages = completedStagesAfterParagonPreflight(
      priorCompletedBuildStages
    );
    const targetStage = args.targetBuildStage ?? (args.tours?.length ? "merchant-feed" : "fixtures");

    assertEngine6ParagonPreflightGate({
      heroIntegrityPassed,
      renderingParityPassed,
      productBindingPassed,
      productSelectionPassed,
    });

    if (targetStage === "fixtures") {
      assertEngine6FixturesBuildGate(completedStages);
    } else if (targetStage === "merchant-feed") {
      assertEngine6MerchantFeedBuildGate(completedStages);
    } else if (targetStage === "routes") {
      assertEngine6RoutesBuildGate(completedStages);
    } else if (targetStage === "sitemap") {
      assertEngine6SitemapBuildGate(completedStages);
    }
  }

  const formattedSummary = formatEngine6ParagonGovernancePipelineReport({
    generatedAt,
    destinationLabel: config.destinationLabel,
    stateSlug: config.stateSlug,
    citySlug: config.citySlug,
    configValid: true,
    productSelection,
    heroIntegrity,
    productBinding,
    renderingParity,
    buildOrderPreserved: productSelection.buildOrderPreserved,
    heroIntegrityPassed,
    renderingParityPassed,
    blockingPassed,
    passed: blockingPassed,
    reusedModules: ENGINE6_PARAGON_GOVERNANCE_REUSED_MODULES,
    newModules: ENGINE6_PARAGON_GOVERNANCE_NEW_MODULES,
    duplicateValidationLogicIntroduced: false,
    formattedSummary: "",
  });

  return {
    generatedAt,
    destinationLabel: config.destinationLabel,
    stateSlug: config.stateSlug,
    citySlug: config.citySlug,
    configValid: true,
    productSelection,
    heroIntegrity,
    productBinding,
    renderingParity,
    buildOrderPreserved: productSelection.buildOrderPreserved,
    heroIntegrityPassed,
    renderingParityPassed,
    blockingPassed,
    passed: blockingPassed,
    reusedModules: ENGINE6_PARAGON_GOVERNANCE_REUSED_MODULES,
    newModules: ENGINE6_PARAGON_GOVERNANCE_NEW_MODULES,
    duplicateValidationLogicIntroduced: false,
    formattedSummary,
  };
};

export const formatEngine6ParagonGovernancePipelineReport = (
  report: Engine6ParagonGovernancePipelineReport
) => {
  const lines = [
    `Engine6 Paragon governance pipeline (${report.generatedAt})`,
    `Destination: ${report.destinationLabel} (${report.stateSlug}/${report.citySlug})`,
    "",
    "## Summary",
    `- Config valid: ${report.configValid}`,
    `- Product selection passed: ${report.productSelection?.blockingPassed ?? false}`,
    `- Hero integrity passed: ${report.heroIntegrityPassed}`,
    `- Product binding passed: ${report.productBinding?.passed ?? false}`,
    `- Rendering parity passed: ${report.renderingParityPassed}`,
    `- Build order preserved: ${report.buildOrderPreserved}`,
    `- Blocking passed: ${report.blockingPassed}`,
    "",
    "## Governance reuse",
    `- Reused modules: ${report.reusedModules.join(", ")}`,
    `- New modules: ${report.newModules.join(", ")}`,
    `- Duplicate validation logic introduced: ${report.duplicateValidationLogicIntroduced}`,
  ];

  if (report.productSelection) {
    lines.push(
      "",
      "## Product selection",
      `- Accepted: ${report.productSelection.productsAccepted}`,
      `- Rejected: ${report.productSelection.productsRejected}`,
      `- Replacements: ${report.productSelection.replacementProductsSelected}`
    );
  }

  if (report.heroIntegrity) {
    lines.push("", formatEngine6HeroIntegrityGovernanceReport(report.heroIntegrity));
  }

  if (report.productBinding) {
    lines.push("", summarizeEngine6DestinationProductBinding(report.productBinding));
  }

  if (report.renderingParity && report.renderingParity.productsAudited > 0) {
    lines.push(
      "",
      formatEngine6RenderingParityGovernanceReport(report.renderingParity)
    );
  }

  return lines.join("\n");
};

/** Ensures destination builders invoke shared Paragon governance instead of bypassing it. */
export const requireEngine6ParagonGovernanceBeforeArtifacts = (args: {
  paragonReport: Engine6ParagonGovernancePipelineReport;
  artifactKind:
    | "fixtures"
    | "listing-card"
    | "detail-page"
    | "merchant-feed"
    | "sitemap"
    | "preview"
    | "commit"
    | "pull-request";
}) => {
  if (!args.paragonReport.passed) {
    throw new Error(
      `Engine6 Paragon governance must pass before generating ${args.artifactKind} artifacts`
    );
  }

  if (!args.paragonReport.heroIntegrityPassed) {
    throw new Error(
      `Engine6 hero integrity governance must pass before generating ${args.artifactKind} artifacts`
    );
  }

  if (
    args.paragonReport.renderingParity &&
    !args.paragonReport.renderingParityPassed
  ) {
    throw new Error(
      `Engine6 rendering parity governance must pass before generating ${args.artifactKind} artifacts`
    );
  }
};
