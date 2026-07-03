import {
  assessEngine6DestinationProductBinding,
} from "./engine6DestinationProductBinding.js";
import {
  collectEngine6ProductSelectionBlocklistAdditions,
  isEngine6ProductSelectionBlocklistedProduct,
} from "./engine6ProductSelectionBlocklist.js";
import {
  buildEngine6PortfolioMixSummary,
  classifyLiveValidationRejectionReason,
  inferEngine6CommercialTier,
  isEngine6ProductSelectionBlocklisted,
  resolveEngine6ProductSelectionCommercialFieldGap,
  type Engine6DestinationBuildConfig,
  type Engine6ProductSelectionAcceptedCandidate,
  type Engine6ProductSelectionCandidate,
  type Engine6ProductSelectionRejectedCandidate,
  type Engine6ProductSelectionSlot,
} from "./engine6ProductSelectionGovernance.js";
import {
  validateEngine6LiveViatorCandidate,
  type Engine6LiveViatorValidationMode,
  type Engine6LiveViatorValidationResult,
} from "./engine6LiveViatorProductionValidation.js";
import { resolveEngine6ProductCodesChangedSinceRefSafe } from "./resolveEngine6ChangedProductCodes.js";

export type Engine6ProductSelectionSelfReplacementPair = {
  experienceType: string;
  removedProductCode: string;
  replacementProductCode: string;
  replacementValidationResult: Engine6LiveViatorValidationResult;
};

export type Engine6ProductSelectionSelfReplacementReport = {
  generatedAt: string;
  destinationLabel: string;
  mode: Engine6LiveViatorValidationMode;
  scopedProductCodes: string[];
  deployScopedAddedOrModified: string[];
  legacyUntouchedProductCodes: string[];
  removedProductCodes: string[];
  replacementProductCodes: string[];
  replacements: Engine6ProductSelectionSelfReplacementPair[];
  replacementValidations: Engine6LiveViatorValidationResult[];
  validatedProductCodes: string[];
  accepted: Engine6ProductSelectionAcceptedCandidate[];
  rejected: Engine6ProductSelectionRejectedCandidate[];
  blocklistAdditions: string[];
  portfolioMix: ReturnType<typeof buildEngine6PortfolioMixSummary>;
  blockingFailures: Engine6ProductSelectionRejectedCandidate[];
  blockingPassed: boolean;
  passed: boolean;
  buildTerminated: boolean;
  buildTerminationReason: string | null;
  reusedModules: string[];
};

export const ENGINE6_PRODUCT_SELECTION_SELF_REPLACEMENT_REUSED_MODULES = [
  "engine6LiveViatorProductionValidation.validateEngine6LiveViatorCandidate",
  "engine6ProductSelectionGovernance.classifyLiveValidationRejectionReason",
  "engine6ProductSelectionBlocklist.collectEngine6ProductSelectionBlocklistAdditions",
  "resolveEngine6ChangedProductCodes.resolveEngine6ProductCodesChangedSinceRefSafe",
] as const;

const normalizeProductCode = (value: string) => value.trim().toUpperCase();

const INFRASTRUCTURE_FAILURE_PATTERN =
  /api key not configured|credentials (are )?missing|could not resolve a git base ref/i;

const SELF_REPLACEMENT_ELIGIBLE_FAILURE_PATTERN =
  /inactive|discontinued|not_available|http 404|missing product body|unavailable|removed|blocked|not currently bookable|known-unavailable|missing.*commercial|unusable hero|hero.*unresolved|does not match configured source url|product code mismatch/i;

export const isEngine6LiveValidationInfrastructureFailure = (args: {
  reason: string | null;
  validationResult?: Engine6LiveViatorValidationResult;
}) => {
  const reason = (args.reason ?? "").toLowerCase();
  if (INFRASTRUCTURE_FAILURE_PATTERN.test(reason)) {
    return true;
  }

  if (
    args.validationResult &&
    !args.validationResult.apiConfirmedActive &&
    !args.validationResult.knownUnavailableBlocklistHit &&
    /bot protection/i.test(reason) &&
    /api key not configured/i.test(reason)
  ) {
    return true;
  }

  return false;
};

export const isEngine6LiveValidationFailureEligibleForSelfReplacement = (args: {
  validationResult: Engine6LiveViatorValidationResult;
}) => {
  if (args.validationResult.passed) {
    return false;
  }

  if (args.validationResult.knownUnavailableBlocklistHit) {
    return true;
  }

  if (
    isEngine6LiveValidationInfrastructureFailure({
      reason: args.validationResult.reason,
      validationResult: args.validationResult,
    })
  ) {
    return false;
  }

  const reason = (args.validationResult.reason ?? "").toLowerCase();
  return SELF_REPLACEMENT_ELIGIBLE_FAILURE_PATTERN.test(reason);
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

const buildCandidateIndex = (slots: Engine6ProductSelectionSlot[]) => {
  const byCode = new Map<string, Engine6ProductSelectionCandidate>();
  const rankedByExperienceType = new Map<string, Engine6ProductSelectionCandidate[]>();
  const allRanked: Engine6ProductSelectionCandidate[] = [];

  for (const slot of slots) {
    const ranked = sortCandidates(slot.candidates);
    rankedByExperienceType.set(slot.experienceType, ranked);
    for (const candidate of ranked) {
      const productCode = normalizeProductCode(candidate.productCode);
      byCode.set(productCode, candidate);
      allRanked.push(candidate);
    }
  }

  return { byCode, rankedByExperienceType, allRanked: sortCandidates(allRanked) };
};

const resolveCandidateExperienceType = (
  candidate: Engine6ProductSelectionCandidate,
  slots: Engine6ProductSelectionSlot[]
) => {
  for (const slot of slots) {
    if (
      slot.candidates.some(
        entry =>
          normalizeProductCode(entry.productCode) ===
          normalizeProductCode(candidate.productCode)
      )
    ) {
      return slot.experienceType;
    }
  }

  return candidate.experienceType;
};

const isDeployScopedAddedOrModified = (args: {
  productCode: string;
  mode: Engine6LiveViatorValidationMode;
  scopedAddedOrModified: ReadonlySet<string>;
}) => {
  if (args.mode === "strict") {
    return true;
  }

  return args.scopedAddedOrModified.has(normalizeProductCode(args.productCode));
};

const isBlockingSelfReplacementFailure = (args: {
  mode: Engine6LiveViatorValidationMode;
  productCode: string;
  scopedAddedOrModified: ReadonlySet<string>;
}) => {
  if (args.mode === "strict") {
    return true;
  }

  return args.scopedAddedOrModified.has(normalizeProductCode(args.productCode));
};

export const deriveEngine6SelectedProductCodesFromConfig = (
  config: Pick<Engine6DestinationBuildConfig, "slots">
) => {
  const selected: string[] = [];

  for (const slot of config.slots) {
    const ranked = sortCandidates(slot.candidates);
    for (let index = 0; index < slot.desiredCount && index < ranked.length; index += 1) {
      selected.push(normalizeProductCode(ranked[index]!.productCode));
    }
  }

  return selected;
};

export type RunEngine6ProductSelectionSelfReplacementGovernanceArgs = {
  config: Engine6DestinationBuildConfig;
  selectedProductCodes: string[];
  mode?: Engine6LiveViatorValidationMode;
  scopedProductCodes?: string[];
  scopedAddedOrModified?: string[];
  headRef?: string;
  fetchImpl?: typeof fetch;
  validateCandidate?: typeof validateEngine6LiveViatorCandidate;
  generatedAt?: string;
};

export const runEngine6ProductSelectionSelfReplacementGovernance = async (
  args: RunEngine6ProductSelectionSelfReplacementGovernanceArgs
): Promise<Engine6ProductSelectionSelfReplacementReport> => {
  const mode = args.mode ?? "pr-scoped";
  const scopedResolution = resolveEngine6ProductCodesChangedSinceRefSafe({
    headRef: args.headRef,
  });
  const scopedProductCodes =
    args.scopedProductCodes ??
    (mode === "pr-scoped" ? scopedResolution.productCodes : []);
  const scopedAddedOrModified = new Set(
    (args.scopedAddedOrModified ?? scopedProductCodes).map(code =>
      normalizeProductCode(code)
    )
  );
  const scopedSet = new Set(
    scopedProductCodes.map(code => normalizeProductCode(code))
  );

  const validateCandidate =
    args.validateCandidate ?? validateEngine6LiveViatorCandidate;
  const candidateIndex = buildCandidateIndex(args.config.slots);
  const accepted: Engine6ProductSelectionAcceptedCandidate[] = [];
  const rejected: Engine6ProductSelectionRejectedCandidate[] = [];
  const replacements: Engine6ProductSelectionSelfReplacementPair[] = [];
  const removedProductCodes: string[] = [];
  const replacementProductCodes: string[] = [];
  const acceptedCodes = new Set<string>();
  const rejectedCodes = new Set<string>();
  const generatedAt = args.generatedAt ?? new Date().toISOString();

  const tryAcceptCandidate = async (candidate: Engine6ProductSelectionCandidate) => {
    const productCode = normalizeProductCode(candidate.productCode);
    const experienceType = resolveCandidateExperienceType(
      candidate,
      args.config.slots
    );

    if (isEngine6ProductSelectionBlocklisted(productCode)) {
      rejected.push({
        productCode,
        sourceUrl: candidate.sourceUrl,
        experienceType,
        reason: "blocklisted",
        detail: "product is on a permanent Engine6 product-selection blocklist",
      });
      rejectedCodes.add(productCode);
      return false;
    }

    const commercialGap = resolveEngine6ProductSelectionCommercialFieldGap(
      candidate
    );
    if (commercialGap) {
      rejected.push({
        productCode,
        sourceUrl: candidate.sourceUrl,
        experienceType,
        reason: "missing-commercial-fields",
        detail: commercialGap,
      });
      rejectedCodes.add(productCode);
      return false;
    }

    const destinationBinding = assessEngine6DestinationProductBinding({
      productCode,
      sourceUrl: candidate.sourceUrl,
      destinationCitySlug: args.config.destinationCitySlug,
      viatorDestinationSlug: args.config.viatorDestinationSlug,
      configPathSlug: args.config.configPathSlug,
      destinationLabel: args.config.destinationLabel,
    });

    if (destinationBinding.violation) {
      rejected.push({
        productCode,
        sourceUrl: candidate.sourceUrl,
        experienceType,
        reason: destinationBinding.violation,
        detail: destinationBinding.detail ?? destinationBinding.violation,
      });
      rejectedCodes.add(productCode);
      return false;
    }

    if (acceptedCodes.has(productCode)) {
      return false;
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
        experienceType,
        reason: classifyLiveValidationRejectionReason(validationResult),
        detail: validationResult.reason ?? "live Viator validation failed",
        validationResult,
      });
      rejectedCodes.add(productCode);
      return false;
    }

    accepted.push({
      productCode,
      sourceUrl: candidate.sourceUrl,
      title: candidate.title,
      experienceType,
      commercialTier: inferEngine6CommercialTier(candidate),
      replacedProductCode: null,
      validationResult,
    });
    acceptedCodes.add(productCode);
    return true;
  };

  const findBackupCandidates = (argsForBackup: {
    failedProductCode: string;
    failedExperienceType: string;
  }) => {
    const slotRanked =
      candidateIndex.rankedByExperienceType.get(argsForBackup.failedExperienceType) ??
      [];
    const slotCandidates = slotRanked.filter(
      candidate =>
        normalizeProductCode(candidate.productCode) !==
        normalizeProductCode(argsForBackup.failedProductCode)
    );

    if (slotCandidates.length > 0) {
      return slotCandidates;
    }

    return candidateIndex.allRanked.filter(
      candidate =>
        normalizeProductCode(candidate.productCode) !==
          normalizeProductCode(argsForBackup.failedProductCode) &&
        !acceptedCodes.has(normalizeProductCode(candidate.productCode)) &&
        !rejectedCodes.has(normalizeProductCode(candidate.productCode))
    );
  };

  for (const selectedProductCode of args.selectedProductCodes) {
    const productCode = normalizeProductCode(selectedProductCode);
    const candidate = candidateIndex.byCode.get(productCode);
    if (!candidate) {
      rejected.push({
        productCode,
        sourceUrl: "",
        experienceType: "unknown",
        reason: "live-validation-failed",
        detail: `selected product ${productCode} is missing from destination catalog`,
      });
      continue;
    }

    const experienceType = resolveCandidateExperienceType(
      candidate,
      args.config.slots
    );
    const validationResult = await validateCandidate({
      productCode,
      sourceUrl: candidate.sourceUrl,
      fetchImpl: args.fetchImpl,
    });

    if (validationResult.passed) {
      if (!acceptedCodes.has(productCode)) {
        accepted.push({
          productCode,
          sourceUrl: candidate.sourceUrl,
          title: candidate.title,
          experienceType,
          commercialTier: inferEngine6CommercialTier(candidate),
          replacedProductCode: null,
          validationResult,
        });
        acceptedCodes.add(productCode);
      }
      continue;
    }

    const rejectionReason = classifyLiveValidationRejectionReason(validationResult);
    rejected.push({
      productCode,
      sourceUrl: candidate.sourceUrl,
      experienceType,
      reason: rejectionReason,
      detail: validationResult.reason ?? "live Viator validation failed",
      validationResult,
    });
    rejectedCodes.add(productCode);

    const eligibleForReplacement =
      isDeployScopedAddedOrModified({
        productCode,
        mode,
        scopedAddedOrModified,
      }) &&
      isEngine6LiveValidationFailureEligibleForSelfReplacement({
        validationResult,
      });

    if (!eligibleForReplacement) {
      continue;
    }

    removedProductCodes.push(productCode);
    let replaced = false;

    for (const backupCandidate of findBackupCandidates({
      failedProductCode: productCode,
      failedExperienceType: experienceType,
    })) {
      const backupCode = normalizeProductCode(backupCandidate.productCode);
      if (
        acceptedCodes.has(backupCode) ||
        rejectedCodes.has(backupCode) ||
        isEngine6ProductSelectionBlocklistedProduct(backupCode)
      ) {
        continue;
      }

      const backupAccepted = await tryAcceptCandidate(backupCandidate);
      if (!backupAccepted) {
        continue;
      }

      const acceptedEntry = accepted.find(entry => entry.productCode === backupCode);
      if (!acceptedEntry) {
        continue;
      }

      acceptedEntry.replacedProductCode = productCode;
      replacements.push({
        experienceType,
        removedProductCode: productCode,
        replacementProductCode: backupCode,
        replacementValidationResult: acceptedEntry.validationResult,
      });
      replacementProductCodes.push(backupCode);
      replaced = true;
      break;
    }

    if (!replaced) {
      rejected.push({
        productCode,
        sourceUrl: candidate.sourceUrl,
        experienceType,
        reason: rejectionReason,
        detail: `no validated backup candidate remained after ${productCode} failed live validation`,
        validationResult,
      });
    }
  }

  const portfolioMix = buildEngine6PortfolioMixSummary({
    accepted,
    targetPremiumShare: args.config.targetPremiumShare,
  });

  const successfullyReplaced = new Set(
    replacements.map(replacement => replacement.removedProductCode)
  );

  const blockingFailures = rejected.filter(
    entry =>
      !successfullyReplaced.has(entry.productCode) &&
      isBlockingSelfReplacementFailure({
        mode,
        productCode: entry.productCode,
        scopedAddedOrModified,
      })
  );

  const candidateTitlesByCode = Object.fromEntries(
    args.config.slots.flatMap(slot =>
      slot.candidates.map(candidate => [
        normalizeProductCode(candidate.productCode),
        candidate.title,
      ])
    )
  );

  const blocklistAdditions = collectEngine6ProductSelectionBlocklistAdditions({
    rejected: rejected.filter(entry =>
      removedProductCodes.includes(entry.productCode)
    ),
    destinationLabel: args.config.destinationLabel,
    generatedAt,
    candidateTitlesByCode,
  }).map(entry => entry.productCode);

  const legacyUntouchedProductCodes = args.selectedProductCodes
    .map(code => normalizeProductCode(code))
    .filter(
      code =>
        !scopedAddedOrModified.has(code) &&
        !removedProductCodes.includes(code) &&
        !replacementProductCodes.includes(code)
    );

  const passed =
    blockingFailures.length === 0 &&
    accepted.length === args.selectedProductCodes.length;
  const buildTerminated = !passed;

  return {
    generatedAt,
    destinationLabel: args.config.destinationLabel,
    mode,
    scopedProductCodes: [...scopedProductCodes].sort(),
    deployScopedAddedOrModified: [...scopedAddedOrModified].sort(),
    legacyUntouchedProductCodes,
    removedProductCodes,
    replacementProductCodes,
    replacements,
    replacementValidations: replacements.map(
      replacement => replacement.replacementValidationResult
    ),
    validatedProductCodes: accepted.map(entry => entry.productCode),
    accepted,
    rejected,
    blocklistAdditions,
    portfolioMix,
    blockingFailures,
    blockingPassed: blockingFailures.length === 0,
    passed,
    buildTerminated,
    buildTerminationReason: buildTerminated
      ? blockingFailures.length > 0
        ? "blocking validation failures remain after automatic self-replacement"
        : "destination portfolio incomplete after automatic self-replacement"
      : null,
    reusedModules: [...ENGINE6_PRODUCT_SELECTION_SELF_REPLACEMENT_REUSED_MODULES],
  };
};

export const formatEngine6ProductSelectionSelfReplacementReport = (
  report: Engine6ProductSelectionSelfReplacementReport
) => {
  const lines = [
    `Engine6 product-selection self-replacement governance (${report.generatedAt})`,
    `Destination: ${report.destinationLabel}`,
    `Mode: ${report.mode}`,
    "",
    "## Replacement summary",
    `- Removed product IDs: ${report.removedProductCodes.length > 0 ? report.removedProductCodes.join(", ") : "none"}`,
    `- Replacement product IDs: ${report.replacementProductCodes.length > 0 ? report.replacementProductCodes.join(", ") : "none"}`,
    `- Final selected product count: ${report.validatedProductCodes.length}`,
    `- Premium/high-value count: ${report.portfolioMix.premiumCount}`,
    `- Blocking passed: ${report.blockingPassed}`,
    "",
    "## Portfolio metrics",
    `- Premium share: ${(report.portfolioMix.premiumShare * 100).toFixed(1)}%`,
    `- Experience types: ${report.portfolioMix.experienceTypes.join(", ") || "none"}`,
    "",
    "## Scope",
    `- Deploy-scoped added/modified: ${report.deployScopedAddedOrModified.join(", ") || "none"}`,
    `- Legacy untouched products: ${report.legacyUntouchedProductCodes.join(", ") || "none"}`,
    "",
    "## Blocklist additions",
    report.blocklistAdditions.length > 0
      ? report.blocklistAdditions.join(", ")
      : "none",
    "",
    "## Governance reuse",
    report.reusedModules.join(", "),
  ];

  if (report.replacements.length > 0) {
    lines.push("", "## Replacements");
    for (const replacement of report.replacements) {
      lines.push(
        `- ${replacement.experienceType}: ${replacement.removedProductCode} -> ${replacement.replacementProductCode} (live validation passed)`
      );
    }
  }

  if (report.replacementValidations.length > 0) {
    lines.push("", "## Replacement live API validation");
    for (const validation of report.replacementValidations) {
      lines.push(
        `- ${validation.productCode}: passed=${validation.passed}, apiConfirmedActive=${validation.apiConfirmedActive}, reason=${validation.reason ?? "ok"}`
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

  return lines.join("\n");
};
