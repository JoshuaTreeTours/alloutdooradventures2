import { describe, expect, it } from "vitest";

import {
  ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS,
  hasEngine6SupplierNarrativeMarketingBoilerplate,
  normalizeEngine6SupplierNarrativeDescription,
  normalizeEngine6SupplierNarrativeText,
} from "./normalizeEngine6SupplierNarrative";

describe("normalizeEngine6SupplierNarrative", () => {
  it("strips promotional boilerplate while preserving factual itinerary content", () => {
    const normalized = normalizeEngine6SupplierNarrativeText(
      "Join one of the best Napa Valley tours for joy and happiness. Visit Domaine Chandon, St. Supéry, and Oakville Grocery during a 6-hour route. Don't miss this unforgettable experience—book now!"
    );

    expect(normalized).toContain("Domaine Chandon");
    expect(normalized).toContain("St. Supéry");
    expect(normalized).toContain("Oakville Grocery");
    expect(normalized).toContain("6-hour route");
    expect(hasEngine6SupplierNarrativeMarketingBoilerplate(normalized)).toBe(
      false
    );
  });

  it("removes duplicated itinerary introductions", () => {
    const normalized = normalizeEngine6SupplierNarrativeText(
      "Explore Monterey's coastline with stops at Cannery Row and 17-Mile Drive. Explore Monterey's coastline with stops at Cannery Row and Carmel-by-the-Sea."
    );

    expect(normalized.match(/Explore Monterey's coastline/gi)?.length).toBe(1);
    expect(normalized).toContain("Cannery Row");
    expect(normalized).toContain("17-Mile Drive");
  });

  it("drops standalone calls to action and operator hype sentences", () => {
    const normalized = normalizeEngine6SupplierNarrativeText(
      "Book now for an unforgettable experience. The route includes Vizcaya Museum, Wynwood Walls, and Little Havana over 4 hours. We encourage you to arrive 15 minutes early."
    );

    expect(normalized).toContain("Vizcaya Museum");
    expect(normalized).toContain("Wynwood Walls");
    expect(normalized).toContain("Little Havana");
    expect(normalized).toContain("4 hours");
    expect(normalized).toContain("15 minutes early");
    for (const pattern of ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS) {
      expect(normalized).not.toMatch(pattern);
    }
  });

  it("keeps attraction names unchanged", () => {
    const normalized = normalizeEngine6SupplierNarrativeDescription(
      "Must-see views of the Brooklyn Bridge, Brooklyn Heights Promenade, and DUMBO. Perfect for everyone."
    );

    expect(normalized).toContain("Brooklyn Bridge");
    expect(normalized).toContain("Brooklyn Heights Promenade");
    expect(normalized).toContain("DUMBO");
  });

  it("returns an empty string for empty input", () => {
    expect(normalizeEngine6SupplierNarrativeText("")).toBe("");
    expect(normalizeEngine6SupplierNarrativeDescription(null)).toBe("");
  });
});
