import { describe, expect, it } from "vitest";

import {
  ENGINE6_DESTINATION_SLUG_COHORT_LABELS,
  extractEngine6DestinationLabelsFromChangedFiles,
  extractEngine6DestinationSlugFromChangedPath,
  resolveEngine6DestinationValidationCohortsForScope,
} from "./resolveEngine6GovernanceScope";
import { ENGINE6_DESTINATION_VALIDATION_COHORTS } from "./engine6DestinationValidationCohorts";

describe("resolveEngine6GovernanceScope", () => {
  it("extracts destination slugs from Engine6 artifact paths", () => {
    expect(
      extractEngine6DestinationSlugFromChangedPath(
        "scripts/generate-monterey-engine6-fixtures.ts"
      )
    ).toBe("monterey");
    expect(
      extractEngine6DestinationSlugFromChangedPath(
        "scripts/glacier-product-selection.json"
      )
    ).toBe("glacier");
  });

  it("maps changed destination files to cohort labels only", () => {
    const labels = extractEngine6DestinationLabelsFromChangedFiles([
      { status: "M", path: "scripts/generate-monterey-engine6-fixtures.ts" },
    ]);

    expect(labels).toEqual(
      expect.arrayContaining([
        ...ENGINE6_DESTINATION_SLUG_COHORT_LABELS.monterey,
      ])
    );
    expect(labels.some(label => label.startsWith("Napa"))).toBe(false);
  });

  it("limits destination cohort validation to scoped labels unless full-site audit", () => {
    const scoped = resolveEngine6DestinationValidationCohortsForScope({
      scopedDestinationLabels: ["Monterey"],
    });
    expect(scoped.map(cohort => cohort.label)).toEqual(["Monterey"]);

    const fullSite = resolveEngine6DestinationValidationCohortsForScope({
      fullSiteValidation: true,
    });
    expect(fullSite.length).toBe(ENGINE6_DESTINATION_VALIDATION_COHORTS.length);
  });

  it("skips destination cohort validation when no destination scope is present", () => {
    expect(
      resolveEngine6DestinationValidationCohortsForScope({
        scopedDestinationLabels: [],
      })
    ).toEqual([]);
  });
});
