import { describe, expect, it } from "vitest";

import {
  buildEngine6DestinationRoutePrefix,
  validateEngine6DestinationInfrastructure,
} from "./engine6DestinationInfrastructureValidation";

describe("engine6DestinationInfrastructureValidation", () => {
  it("passes for an established Engine6 destination", () => {
    const report = validateEngine6DestinationInfrastructure({
      spec: {
        destinationLabel: "Monterey",
        destinationCitySlug: "monterey",
        stateSlug: "california",
        citySlug: "monterey",
      },
    });

    expect(report.pass).toBe(true);
    expect(report.routePrefix).toBe(
      buildEngine6DestinationRoutePrefix({
        stateSlug: "california",
        citySlug: "monterey",
      })
    );
  });

  it("fails early when required Chicago infrastructure is missing", () => {
    const report = validateEngine6DestinationInfrastructure({
      spec: {
        destinationLabel: "Chicago",
        destinationCitySlug: "chicago",
        stateSlug: "illinois",
        citySlug: "chicago",
      },
      deployScopedProductCodes: ["3332DAY"],
    });

    expect(report.pass).toBe(false);
    expect(report.blockingFailures.map(failure => failure.id)).toEqual(
      expect.arrayContaining([
        "state-registry",
        "route-prefix",
        "governance-scope",
        "canonical-hero-fallback",
        "validation-cohort",
        "fixture-target-path",
      ])
    );
  });
});
