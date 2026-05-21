import { describe, expect, it } from "vitest";
import { buildLegacyTourPathsFromTours } from "./legacyRoutePaths";

describe("buildLegacyTourPathsFromTours", () => {
  it("includes exact legacy /tours path for product 456492", () => {
    const paths = buildLegacyTourPathsFromTours([
      {
        slug: "the-lewis-and-clark-explorer-pack-trip-5-days-4-nights-456492",
        destination: { stateSlug: "wyoming", citySlug: "jackson" },
      },
    ]);

    expect(paths).toContain(
      "/tours/wyoming/jackson/the-lewis-and-clark-explorer-pack-trip-5-days-4-nights-456492"
    );
    expect(paths).toContain(
      "/destinations/wyoming/jackson/tours/the-lewis-and-clark-explorer-pack-trip-5-days-4-nights-456492"
    );
  });
});
