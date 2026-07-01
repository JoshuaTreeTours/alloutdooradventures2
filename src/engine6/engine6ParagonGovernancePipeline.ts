import { extractViatorTourDestinationSlug } from "./engine6DestinationProductBinding.js";
import {
  assertEngine6ArtifactGenerationAllowed,
  assertEngine6CommitPullRequestGate,
  runEngine6DestinationBuildGovernance,
  type Engine6DestinationBuildConfig,
  type Engine6DeterministicBuildStage,
  type Engine6ProductSelectionGovernanceReport,
  type Engine6ProductSelectionSlot,
} from "./engine6ProductSelectionGovernance.js";

export const ENGINE6_PARAGON_GOVERNANCE_PIPELINE_ID =
  "engine6-paragon-governance-pipeline" as const;

export const ENGINE6_PARAGON_GOVERNANCE_DOWNSTREAM_ARTIFACT_STAGES = [
  "fixtures",
  "merchant-feed",
  "routes",
  "sitemap",
  "destination-pages",
  "previews",
] as const;

export type Engine6ParagonGovernanceDownstreamArtifactStage =
  (typeof ENGINE6_PARAGON_GOVERNANCE_DOWNSTREAM_ARTIFACT_STAGES)[number];

const PARAGON_ARTIFACT_TO_BUILD_STAGE: Partial<
  Record<
    Engine6ParagonGovernanceDownstreamArtifactStage,
    Exclude<Engine6DeterministicBuildStage, "live-validation">
  >
> = {
  fixtures: "fixtures",
  "merchant-feed": "merchant-feed",
  routes: "routes",
  sitemap: "sitemap",
};

export type Engine6ParagonDestinationCatalogTour = {
  productCode: string;
  productUrl: string;
  title: string;
  priceFrom: number;
  categories?: string[];
  experienceType?: string;
};

export type Engine6ParagonGovernancePipelineContext = {
  pipelineId: typeof ENGINE6_PARAGON_GOVERNANCE_PIPELINE_ID;
  report: Engine6ProductSelectionGovernanceReport;
  validatedProductCodes: string[];
  completedBuildStages: readonly Engine6DeterministicBuildStage[];
};

export class Engine6ParagonGovernancePipelineError extends Error {
  readonly report: Engine6ProductSelectionGovernanceReport;

  constructor(report: Engine6ProductSelectionGovernanceReport) {
    super(
      report.buildTerminationReason ??
        "Engine6 Paragon governance pipeline blocked downstream artifact generation."
    );
    this.name = "Engine6ParagonGovernancePipelineError";
    this.report = report;
  }
}

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

export const buildEngine6ParagonProductSelectionConfig = (args: {
  destinationLabel: string;
  destinationCitySlug: string;
  viatorDestinationSlug?: string;
  targetPremiumShare?: number;
  tours: Engine6ParagonDestinationCatalogTour[];
  slots?: Engine6ProductSelectionSlot[];
}): Engine6DestinationBuildConfig => {
  const viatorDestinationSlug =
    args.viatorDestinationSlug?.trim() ||
    extractViatorTourDestinationSlug(args.tours[0]?.productUrl ?? "") ||
    args.destinationCitySlug;

  const slots =
    args.slots ??
    ([
      {
        experienceType: "destination-portfolio",
        desiredCount: args.tours.length,
        candidates: args.tours.map((tour, index) => ({
          productCode: tour.productCode,
          sourceUrl: tour.productUrl,
          title: tour.title,
          experienceType: tour.experienceType ?? "destination-portfolio",
          priceFrom: tour.priceFrom,
          categories: tour.categories,
          priority: index + 1,
        })),
      },
    ] satisfies Engine6ProductSelectionSlot[]);

  return {
    destinationLabel: args.destinationLabel,
    destinationCitySlug: args.destinationCitySlug,
    viatorDestinationSlug,
    targetPremiumShare: args.targetPremiumShare,
    slots,
  };
};

export const runEngine6ParagonProductSelectionPipeline = async (args: {
  config: Engine6DestinationBuildConfig;
  fetchImpl?: typeof fetch;
  destinationBuild?: boolean;
  mode?: "strict" | "pr-scoped";
  scopedProductCodes?: string[];
  headRef?: string;
  validateCandidate?: Parameters<
    typeof runEngine6DestinationBuildGovernance
  >[0]["validateCandidate"];
}): Promise<Engine6ParagonGovernancePipelineContext> => {
  const build = await runEngine6DestinationBuildGovernance({
    destinationLabel: args.config.destinationLabel,
    destinationCitySlug: args.config.destinationCitySlug,
    viatorDestinationSlug: args.config.viatorDestinationSlug,
    targetPremiumShare: args.config.targetPremiumShare,
    slots: args.config.slots,
    fetchImpl: args.fetchImpl,
    validateCandidate: args.validateCandidate,
    mode: args.mode,
    scopedProductCodes: args.scopedProductCodes,
    headRef: args.headRef,
    destinationBuild: args.destinationBuild ?? true,
  });

  if (build.report.buildTerminated || !build.report.passed) {
    throw new Engine6ParagonGovernancePipelineError(build.report);
  }

  assertEngine6CommitPullRequestGate(build.report);

  return {
    pipelineId: ENGINE6_PARAGON_GOVERNANCE_PIPELINE_ID,
    report: build.report,
    validatedProductCodes: build.validatedProductCodes,
    completedBuildStages: ["live-validation"],
  };
};

export const assertEngine6ParagonArtifactStageAllowed = (args: {
  context: Engine6ParagonGovernancePipelineContext;
  stage: Engine6ParagonGovernanceDownstreamArtifactStage;
}) => {
  const mappedStage = PARAGON_ARTIFACT_TO_BUILD_STAGE[args.stage];

  if (!mappedStage) {
    if (args.context.report.buildTerminated || !args.context.report.passed) {
      throw new Engine6ParagonGovernancePipelineError(args.context.report);
    }

    assertEngine6CommitPullRequestGate(args.context.report);
    return;
  }

  assertEngine6ArtifactGenerationAllowed({
    report: args.context.report,
    nextStage: mappedStage,
  });
};

export const filterEngine6ParagonCatalogByValidatedProductCodes = <
  T extends { productCode: string },
>(
  catalog: T[],
  validatedProductCodes: readonly string[]
) => {
  const catalogByCode = new Map(
    catalog.map(entry => [normalizeProductCode(entry.productCode), entry])
  );

  const filtered: T[] = [];
  const missingCatalogEntries: string[] = [];

  for (const productCode of validatedProductCodes) {
    const normalized = normalizeProductCode(productCode);
    const entry = catalogByCode.get(normalized);
    if (!entry) {
      missingCatalogEntries.push(normalized);
      continue;
    }
    filtered.push(entry);
  }

  if (missingCatalogEntries.length > 0) {
    throw new Error(
      `Engine6 Paragon governance selected validated product(s) missing from destination catalog: ${missingCatalogEntries.join(", ")}`
    );
  }

  return filtered;
};

export const buildEngine6ParagonProductSelectionConfigFromResolvedTours = (args: {
  destinationLabel: string;
  destinationCitySlug: string;
  viatorDestinationSlug?: string;
  targetPremiumShare?: number;
  tours: Array<{
    productCode: string;
    bookingUrl: string;
    title: string;
    priceAmount: number | null;
    categories?: string[];
  }>;
}) =>
  buildEngine6ParagonProductSelectionConfig({
    destinationLabel: args.destinationLabel,
    destinationCitySlug: args.destinationCitySlug,
    viatorDestinationSlug: args.viatorDestinationSlug,
    targetPremiumShare: args.targetPremiumShare,
    tours: args.tours.map(tour => ({
      productCode: tour.productCode,
      productUrl: tour.bookingUrl,
      title: tour.title,
      priceFrom: tour.priceAmount ?? 0,
      categories: tour.categories?.map(category =>
        typeof category === "string" ? category : String(category)
      ),
    })),
  });
