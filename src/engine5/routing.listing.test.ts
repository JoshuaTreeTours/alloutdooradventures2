import { describe, expect, it } from "vitest";

import { getEngine5ListingEntries } from "./listing/getEngine5ListingEntries";
import { getEngine5TourBySlugs } from "./routing";

describe("Engine5 promoted routing/listing", () => {
  it("resolves 132218P209 from the normal destination tour route", () => {
    const routed = getEngine5TourBySlugs(
      "california",
      "los-angeles",
      "best-yosemite-national-park-and-kings-canyon-national-park-2-day-tour-from-la"
    );

    expect(routed?.id).toBe("132218P209");
    expect(routed?.seo.canonicalPath).toBe(
      "/destinations/california/los-angeles/tours/best-yosemite-national-park-and-kings-canyon-national-park-2-day-tour-from-la"
    );
  });

  it("surfaces engine5 cards in normal city listings", () => {
    const entries = getEngine5ListingEntries("california", "los-angeles");
    const target = entries.find(entry => entry.tour.productCode === "132218P209");

    expect(target?.href).toBe(
      "/destinations/california/los-angeles/tours/best-yosemite-national-park-and-kings-canyon-national-park-2-day-tour-from-la"
    );
    expect(target?.tour.heroImage).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg"
    );
  });
});
