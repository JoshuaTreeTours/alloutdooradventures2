import { describe, expect, it } from "vitest";

import { getEngine4ListingEntries } from "./listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "./routing";

describe("Engine4 Aspen routing/listing", () => {
  it("builds the 74828P4 route and exposes it in Aspen listing", () => {
    const entries = getEngine4ListingEntries("colorado", "aspen");
    const target = entries.find(entry => entry.tour.productCode === "74828P4");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/colorado/aspen/tours/aspens-off-the-beaten-path-tour-74828p4"
    );

    const routed = getEngine4TourBySlugs(
      "colorado",
      "aspen",
      "aspens-off-the-beaten-path-tour-74828p4"
    );

    expect(routed?.id).toBe("74828P4");
  });
});
