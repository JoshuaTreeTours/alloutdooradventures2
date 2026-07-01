import { describe, expect, it } from "vitest";

import {
  assessEngine6DestinationProductBinding,
  destinationIdentitiesMatch,
  extractViatorTourDestinationSlug,
  normalizeEngine6DestinationIdentity,
  resolveEngine6ConfiguredProductCitySlug,
} from "./engine6DestinationProductBinding";

describe("engine6DestinationProductBinding", () => {
  it("extracts Viator destination slugs from tour URLs", () => {
    expect(
      extractViatorTourDestinationSlug(
        "https://www.viator.com/tours/Zion-National-Park/Day-Trip/d5610-199627P1"
      )
    ).toBe("Zion-National-Park");
  });

  it("matches destination identities across slug formats", () => {
    expect(
      destinationIdentitiesMatch(
        "Zion-National-Park",
        "zion-national-park"
      )
    ).toBe(true);
    expect(
      normalizeEngine6DestinationIdentity("Glacier National Park")
    ).toBe("glacier national park");
  });

  it("detects cross-destination Viator URL mismatches", () => {
    const assessment = assessEngine6DestinationProductBinding({
      productCode: "TESTP1",
      sourceUrl:
        "https://www.viator.com/tours/Yosemite-National-Park/Some-Tour/d5265-TESTP1",
      destinationCitySlug: "zion-national-park",
      viatorDestinationSlug: "Zion-National-Park",
    });

    expect(assessment.violation).toBe("cross-destination");
  });

  it("detects duplicate Engine6 destination assignments", () => {
    const boundCitySlug = resolveEngine6ConfiguredProductCitySlug("199627P12");
    expect(boundCitySlug).toBe("zion-national-park");

    const assessment = assessEngine6DestinationProductBinding({
      productCode: "199627P12",
      sourceUrl:
        "https://www.viator.com/tours/Zion-National-Park/Zion-Guided-Hike/d5610-199627P12",
      destinationCitySlug: "yellowstone-national-park",
    });

    expect(assessment.violation).toBe("duplicate-engine6-assignment");
  });
});
