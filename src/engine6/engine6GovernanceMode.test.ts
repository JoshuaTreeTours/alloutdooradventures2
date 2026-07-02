import { describe, expect, it } from "vitest";

import {
  mapEngine6GovernanceModeToScopeMode,
  resolveEngine6GovernanceCredentialPolicy,
  resolveEngine6GovernanceExitPolicy,
  resolveEngine6GovernanceMode,
  shouldEngine6GovernanceAlwaysBlock,
} from "./engine6GovernanceMode";

describe("engine6GovernanceMode", () => {
  it("maps governance modes to deploy scope modes", () => {
    expect(mapEngine6GovernanceModeToScopeMode("audit")).toBe("pr-scoped");
    expect(mapEngine6GovernanceModeToScopeMode("warn")).toBe("pr-scoped");
    expect(mapEngine6GovernanceModeToScopeMode("strict")).toBe("strict");
  });

  it("respects ENGINE6_GOVERNANCE_MODE when set", () => {
    const previous = process.env.ENGINE6_GOVERNANCE_MODE;
    process.env.ENGINE6_GOVERNANCE_MODE = "audit";
    expect(resolveEngine6GovernanceMode()).toBe("audit");
    process.env.ENGINE6_GOVERNANCE_MODE = previous ?? "";
  });

  it("keeps unavailable-product blocklist enforcement blocking in warn mode", () => {
    expect(
      shouldEngine6GovernanceAlwaysBlock({
        mode: "warn",
        area: "product-code-blocklist",
      })
    ).toBe(true);
    expect(
      shouldEngine6GovernanceAlwaysBlock({
        mode: "audit",
        area: "product-code-blocklist",
      })
    ).toBe(false);
  });

  it("skips live validation locally when credentials are unavailable", () => {
    const previousKey = process.env.VIATOR_API_KEY;
    const previousCi = process.env.CI;
    delete process.env.VIATOR_API_KEY;
    delete process.env.CI;

    const policy = resolveEngine6GovernanceCredentialPolicy("audit");
    expect(policy.shouldSkipLiveValidation).toBe(true);
    expect(policy.shouldFailWhenCredentialsMissing).toBe(false);

    process.env.CI = "true";
    const ciPolicy = resolveEngine6GovernanceCredentialPolicy("warn");
    expect(ciPolicy.shouldFailWhenCredentialsMissing).toBe(true);

    if (previousKey === undefined) {
      delete process.env.VIATOR_API_KEY;
    } else {
      process.env.VIATOR_API_KEY = previousKey;
    }
    process.env.CI = previousCi ?? "";
  });

  it("defines exit policy by governance mode", () => {
    expect(resolveEngine6GovernanceExitPolicy("audit")).toMatchObject({
      shouldExitOnBlockingFindings: false,
      shouldExitOnWarnings: false,
    });
    expect(resolveEngine6GovernanceExitPolicy("warn")).toMatchObject({
      shouldExitOnBlockingFindings: true,
      shouldExitOnWarnings: false,
    });
    expect(resolveEngine6GovernanceExitPolicy("strict")).toMatchObject({
      shouldExitOnBlockingFindings: true,
      shouldExitOnWarnings: true,
    });
  });
});
