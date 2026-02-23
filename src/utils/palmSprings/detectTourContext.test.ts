import { describe, expect, it } from "vitest";

import { detectTourContext } from "./detectTourContext";

describe("detectTourContext", () => {
  it("detects San Andreas fault + jeep context", () => {
    const context = detectTourContext({
      title: "San Andreas Fault Jeep Tour",
      slug: "san-andreas-fault-jeep-tour",
    });

    expect(context.isFaultTour).toBe(true);
    expect(context.isJeepTour).toBe(true);
  });

  it("detects hiking/oasis/canyon context", () => {
    const context = detectTourContext({
      title: "Indian Canyons Oasis Hike",
      slug: "indian-canyon-oasis-hike",
    });

    expect(context.isHikingTour).toBe(true);
    expect(context.isOasisTour).toBe(true);
    expect(context.isCanyonTour).toBe(true);
  });
});
