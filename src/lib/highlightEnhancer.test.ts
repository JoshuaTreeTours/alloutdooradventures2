import { describe, expect, it } from "vitest";

import { enhanceHighlights } from "./highlightEnhancer";

describe("enhanceHighlights", () => {
  it("cleans, dedupes, and limits highlights", () => {
    expect(
      enhanceHighlights([
        "experience open-air Jeep ride through the fault zone.",
        "Explore open-air jeep ride through the fault zone!",
        " discover guide-led geology interpretation ",
        "Stops near desert washes",
      ])
    ).toEqual([
      "Open-air Jeep ride through the fault zone",
      "Guide-led geology interpretation",
      "Stops near desert washes",
    ]);
  });
});
