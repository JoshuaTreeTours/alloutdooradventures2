import type { Engine6ProductSelectionAcceptedCandidate } from "./engine6ProductSelectionGovernance.js";
import type { Engine6HeroIntegrityResolution } from "./engine6HeroIntegrityGovernance.js";
import {
  inferEngine6PrincipalExperienceTypeFromProduct,
  type Engine6PrincipalExperienceType,
} from "./engine6PrincipalExperienceType.js";
import type { Engine6ParagonProductSelectionConfig } from "./normalizeEngine6ParagonProductSelectionConfig.js";

export type Engine6DestinationProductBindingInput = {
  config: Engine6ParagonProductSelectionConfig;
  accepted: Engine6ProductSelectionAcceptedCandidate[];
  heroResolutions: Engine6HeroIntegrityResolution[];
  /** Optional live product hero URLs keyed by product code. */
  liveProductHeroUrls?: Record<
    string,
    {
      primaryHeroUrl?: string | null;
      alternateHeroUrls?: string[];
    }
  >;
};

export type Engine6BoundDestinationProduct = {
  productCode: string;
  sourceUrl: string;
  title: string;
  experienceType: string;
  principalExperienceType: Engine6PrincipalExperienceType;
  commercialTier: Engine6ProductSelectionAcceptedCandidate["commercialTier"];
  heroUrl: string;
  heroSourceTier: Engine6HeroIntegrityResolution["sourceTier"];
  stateSlug: string;
  citySlug: string;
  destinationLabel: string;
  validationResult: Engine6ProductSelectionAcceptedCandidate["validationResult"];
};

export type Engine6DestinationProductBindingReport = {
  generatedAt: string;
  destinationLabel: string;
  stateSlug: string;
  citySlug: string;
  boundProducts: Engine6BoundDestinationProduct[];
  missingHeroResolutions: string[];
  passed: boolean;
};

export const bindEngine6DestinationProducts = (args: {
  input: Engine6DestinationProductBindingInput;
  generatedAt?: string;
}): Engine6DestinationProductBindingReport => {
  const heroResolutionByCode = new Map(
    args.input.heroResolutions.map(entry => [entry.productCode, entry])
  );
  const missingHeroResolutions: string[] = [];
  const boundProducts: Engine6BoundDestinationProduct[] = [];

  for (const accepted of args.input.accepted) {
    const heroResolution = heroResolutionByCode.get(accepted.productCode);
    if (!heroResolution) {
      missingHeroResolutions.push(accepted.productCode);
      continue;
    }

    boundProducts.push({
      productCode: accepted.productCode,
      sourceUrl: accepted.sourceUrl,
      title: accepted.title,
      experienceType: accepted.experienceType,
      principalExperienceType: heroResolution.productExperienceType,
      commercialTier: accepted.commercialTier,
      heroUrl: heroResolution.resolvedHeroUrl,
      heroSourceTier: heroResolution.sourceTier,
      stateSlug: args.input.config.stateSlug,
      citySlug: args.input.config.citySlug,
      destinationLabel: args.input.config.destinationLabel,
      validationResult: accepted.validationResult,
    });
  }

  return {
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    destinationLabel: args.input.config.destinationLabel,
    stateSlug: args.input.config.stateSlug,
    citySlug: args.input.config.citySlug,
    boundProducts,
    missingHeroResolutions,
    passed: missingHeroResolutions.length === 0 && boundProducts.length > 0,
  };
};

export const buildEngine6HeroIntegrityInputsFromBinding = (args: {
  config: Engine6ParagonProductSelectionConfig;
  accepted: Engine6ProductSelectionAcceptedCandidate[];
  liveProductHeroUrls?: Engine6DestinationProductBindingInput["liveProductHeroUrls"];
}) =>
  args.accepted.map(accepted => {
    const liveHero = args.liveProductHeroUrls?.[accepted.productCode];
    return {
      productCode: accepted.productCode,
      title: accepted.title,
      experienceType: accepted.experienceType,
      productPrimaryHeroUrl: liveHero?.primaryHeroUrl ?? null,
      productAlternateHeroUrls: liveHero?.alternateHeroUrls ?? [],
      stateSlug: args.config.stateSlug,
      citySlug: args.config.citySlug,
    };
  });

export const buildPrincipalExperienceTypeMap = (
  boundProducts: Engine6BoundDestinationProduct[]
) =>
  new Map(
    boundProducts.map(product => [
      product.productCode,
      product.principalExperienceType,
    ])
  );

export const summarizeEngine6DestinationProductBinding = (
  report: Engine6DestinationProductBindingReport
) =>
  [
    `Engine6 destination product binding (${report.generatedAt})`,
    `Destination: ${report.destinationLabel} (${report.stateSlug}/${report.citySlug})`,
    `- Bound products: ${report.boundProducts.length}`,
    `- Missing hero resolutions: ${report.missingHeroResolutions.length}`,
    `- Passed: ${report.passed}`,
  ].join("\n");

export const inferPrincipalExperienceTypeForAcceptedProduct = (
  accepted: Engine6ProductSelectionAcceptedCandidate
): Engine6PrincipalExperienceType =>
  inferEngine6PrincipalExperienceTypeFromProduct({
    experienceType: accepted.experienceType,
    title: accepted.title,
  });
