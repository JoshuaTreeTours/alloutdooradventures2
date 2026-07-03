import { resolveViatorApiConfig } from "../../api/engine6/resolveEngine6ViatorProductCommercialExtract.js";

/** Top-level governance posture controlled by ENGINE6_GOVERNANCE_MODE. */
export type Engine6GovernanceMode = "audit" | "warn" | "strict";

/**
 * Legacy deploy-scoping mode retained for live Viator and stage-2 audit internals.
 * Maps to governance mode: audit/warn → pr-scoped, strict → strict.
 */
export type Engine6GovernanceScopeMode = "pr-scoped" | "strict";

export type Engine6GovernanceCredentialPolicy = {
  hasApiKey: boolean;
  credentialsRequired: boolean;
  shouldSkipLiveValidation: boolean;
  shouldFailWhenCredentialsMissing: boolean;
  skipReason: string | null;
};

export type Engine6GovernanceExitPolicy = {
  mode: Engine6GovernanceMode;
  shouldExitOnBlockingFindings: boolean;
  shouldExitOnWarnings: boolean;
  shouldReportLegacyFindings: boolean;
};

const normalizeMode = (value: string | undefined): Engine6GovernanceMode | null => {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "audit" || normalized === "warn" || normalized === "strict") {
    return normalized;
  }

  return null;
};

export const resolveEngine6GovernanceMode = (): Engine6GovernanceMode => {
  const explicit = normalizeMode(process.env.ENGINE6_GOVERNANCE_MODE);
  if (explicit) {
    return explicit;
  }

  const legacyLiveMode = process.env.ENGINE6_LIVE_VIATOR_VALIDATION_MODE?.trim();
  if (legacyLiveMode === "strict") {
    return "strict";
  }

  if (legacyLiveMode === "pr-scoped") {
    return "warn";
  }

  if (process.env.ENGINE6_GOVERNANCE_FULL_AUDIT === "1") {
    return "strict";
  }

  if (process.env.CI) {
    return "warn";
  }

  if ((process.env.VERCEL_ENV ?? "").toLowerCase() === "production") {
    return "warn";
  }

  return "audit";
};

export const mapEngine6GovernanceModeToScopeMode = (
  mode: Engine6GovernanceMode
): Engine6GovernanceScopeMode => (mode === "strict" ? "strict" : "pr-scoped");

export const resolveEngine6GovernanceScopeMode = (): Engine6GovernanceScopeMode =>
  mapEngine6GovernanceModeToScopeMode(resolveEngine6GovernanceMode());

export const resolveEngine6GovernanceRequiresFullSiteValidation = (
  mode: Engine6GovernanceMode = resolveEngine6GovernanceMode()
) =>
  mode === "strict" &&
  (process.env.ENGINE6_GOVERNANCE_FULL_AUDIT === "1" ||
    process.env.ENGINE6_STAGE2_GOVERNANCE_FULL_AUDIT === "1");

export const isEngine6GovernanceProductionStrictContext = () =>
  Boolean(process.env.CI) ||
  (process.env.VERCEL_ENV ?? "").toLowerCase() === "production";

export const resolveEngine6GovernanceCredentialPolicy = (
  mode: Engine6GovernanceMode = resolveEngine6GovernanceMode()
): Engine6GovernanceCredentialPolicy => {
  const hasApiKey = Boolean(resolveViatorApiConfig().apiKey);
  const credentialsRequired =
    isEngine6GovernanceProductionStrictContext() || mode === "strict";
  const shouldSkipLiveValidation = !hasApiKey && !credentialsRequired;
  const shouldFailWhenCredentialsMissing = !hasApiKey && credentialsRequired;

  return {
    hasApiKey,
    credentialsRequired,
    shouldSkipLiveValidation,
    shouldFailWhenCredentialsMissing,
    skipReason: shouldSkipLiveValidation
      ? "live Viator validation skipped locally: Viator API credentials unavailable (set VIATOR_API_KEY for local strict checks)"
      : null,
  };
};

export const resolveEngine6GovernanceExitPolicy = (
  mode: Engine6GovernanceMode = resolveEngine6GovernanceMode()
): Engine6GovernanceExitPolicy => ({
  mode,
  shouldExitOnBlockingFindings: mode === "strict",
  shouldExitOnWarnings: mode === "strict",
  shouldReportLegacyFindings: mode !== "strict",
});

/** Mirrors Stage 2 / live Viator CLI exit behavior from governance exit policy. */
export const resolveEngine6GovernanceProcessExitCode = (args: {
  mode: Engine6GovernanceMode;
  blockingPassed: boolean;
  warningFindings?: number;
}): 0 | 1 => {
  const exitPolicy = resolveEngine6GovernanceExitPolicy(args.mode);

  if (!args.blockingPassed && exitPolicy.shouldExitOnBlockingFindings) {
    return 1;
  }

  if ((args.warningFindings ?? 0) > 0 && exitPolicy.shouldExitOnWarnings) {
    return 1;
  }

  return 0;
};

export const shouldEngine6GovernanceAlwaysBlock = (args: {
  mode: Engine6GovernanceMode;
  area:
    | "product-code-blocklist"
    | "live-viator-known-unavailable"
    | "product-selection-blocklist";
}) => {
  if (args.mode === "audit") {
    return false;
  }

  return (
    args.area === "product-code-blocklist" ||
    args.area === "live-viator-known-unavailable" ||
    args.area === "product-selection-blocklist"
  );
};
