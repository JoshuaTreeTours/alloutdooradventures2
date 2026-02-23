import { describe, expect, it } from "vitest";

import { buildBookingMeta, buildTourMeta } from "./tourMeta";

const sampleTour = {
  title: "Sunrise Jeep Tour",
  id: "1234",
  destination: {
    city: "Sedona",
    state: "Arizona",
  },
};

describe("tour meta robots directives", () => {
  it("uses noindex,follow directives for booking pages", () => {
    const meta = buildBookingMeta(sampleTour, "/destinations/arizona/sedona/tours/sunrise-jeep-tour");

    expect(meta.robots).toBe("noindex,follow,max-image-preview:large");
    expect(meta.googlebot).toBe("noindex,follow,max-image-preview:large");
  });

  it("keeps index,follow directives for tour detail pages", () => {
    const meta = buildTourMeta(sampleTour, "/destinations/arizona/sedona/tours/sunrise-jeep-tour");

    expect(meta.robots).toBe("index,follow,max-image-preview:large");
    expect(meta.googlebot).toBe("index,follow,max-image-preview:large");
  });
});
