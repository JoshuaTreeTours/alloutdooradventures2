import { describe, expect, it } from "vitest";

import {
  extractEngine6OverviewNamedLocations,
  isEngine6OperationalOverviewOpener,
  isEngine6SupplierMirroredOverviewText,
  rewriteEngine6Overview,
  validateEngine6GovernedOverview,
} from "./overviewGovernance";

describe("Engine6 overview governance", () => {
  it("rewrites supplier overview into destination-first travel-guide prose", () => {
    const sourceOverview =
      "Meet at Pike Place Market before the tour begins. You'll sample local vendors, explore specialty foods, and learn about Seattle's most famous public market on this guided walking route.";

    const overview = rewriteEngine6Overview({
      title: "Pike Place Market Tasting Tour",
      city: "Seattle",
      state: "Washington",
      categoryLabel: "Food & Wine",
      durationText: "2 hours (approx.)",
      highlights: [
        "Guided Pike Place Market tasting tour",
        "Multiple food samples from market vendors",
      ],
      itinerary: [
        {
          title: "Pike Place Market",
          description: "Enter the main hall for the tasting route.",
        },
      ],
      sourceOverview,
    });

    expect(isEngine6OperationalOverviewOpener(overview)).toBe(false);
    expect(overview).toContain("Pike Place Market");
    expect(isEngine6SupplierMirroredOverviewText({
      source: sourceOverview,
      target: overview,
    })).toBe(false);
    expect(overview.split(/\s+/).length).toBeGreaterThanOrEqual(40);
  });

  it("preserves named locations extracted from source material", () => {
    const locations = extractEngine6OverviewNamedLocations({
      sourceOverview:
        "Travel from Seattle to Mount Rainier National Park with stops at Narada Falls, Paradise, and Longmire.",
      highlights: ["Narada Falls", "Paradise"],
      itinerary: [{ title: "Mount Rainier National Park" }],
    });

    expect(locations).toEqual(
      expect.arrayContaining([
        "Mount Rainier National Park",
        "Narada Falls",
      ])
    );
  });

  it("flags supplier-mirrored and operational overview prose", () => {
    const sourceOverview =
      "Meet at the harbor for pickup. Cruise Elliott Bay and Seattle Harbor on a narrated boat tour from Pier 55.";

    const violations = validateEngine6GovernedOverview({
      overviewText: sourceOverview,
      sourceOverview,
      highlights: ["Seattle Harbor"],
      itinerary: [{ title: "Pier 55" }],
    });

    expect(violations.join(" ")).toContain("mirrors supplier wording");
    expect(violations.join(" ")).toContain(
      "operational or logistical instructions"
    );
  });
});
