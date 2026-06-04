import { describe, expect, it } from "vitest";

import { buildFullInventoryCategoryAudit } from "./audit-tour-categories";

describe("full inventory tour category audit", () => {
  it("covers more than the Engine6-only inventory and reports source totals", () => {
    const audit = buildFullInventoryCategoryAudit();

    expect(audit.totalRouteBackedTours).toBeGreaterThan(
      audit.countsBySource.Engine6
    );
    expect(audit.countsBySource.Engine6).toBeGreaterThan(100);
    expect(audit.countsBySource["FareHarbor/legacy"]).toBeGreaterThan(1000);
    expect(audit.countsBySource.Engine2).toBeGreaterThan(0);
    expect(audit.countsBySource.Engine3).toBeGreaterThan(0);
    expect(audit.countsBySource.Engine4).toBeGreaterThan(0);
    expect(audit.totalCategoryAssignments).toBeGreaterThan(
      audit.totalClassifiedTours
    );
  });

  it("includes California cycling examples from the broader inventory", () => {
    const audit = buildFullInventoryCategoryAudit();

    expect(audit.californiaCyclingExamples.length).toBeGreaterThanOrEqual(10);
    expect(audit.categoryCounts.Cycling).toBeGreaterThan(17);
  });
});
