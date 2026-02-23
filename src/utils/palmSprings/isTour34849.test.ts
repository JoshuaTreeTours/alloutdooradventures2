import { describe, expect, it } from "vitest";

import { isTour34849 } from "./isTour34849";

describe("isTour34849", () => {
  it("matches by slug and path", () => {
    expect(
      isTour34849({
        pathname:
          "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849",
      })
    ).toBe(true);

    expect(
      isTour34849({
        tour: {
          id: "tour-abc",
          slug: "shared-san-andreas-fault-jeep-tour-34849",
          seo: { canonicalPath: "" },
          booking: { bookingUrl: "" },
        },
      })
    ).toBe(true);
  });

  it("matches by numeric id and not other tours", () => {
    expect(
      isTour34849({
        tour: {
          id: "34849",
          slug: "another-tour",
          seo: { canonicalPath: "/destinations/california/palm-springs/tours/another-tour" },
          booking: { bookingUrl: "" },
        },
      })
    ).toBe(true);

    expect(
      isTour34849({
        pathname:
          "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-12345",
        tour: {
          id: "12345",
          slug: "shared-san-andreas-fault-jeep-tour-12345",
          seo: {
            canonicalPath:
              "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-12345",
          },
          booking: { bookingUrl: "" },
        },
      })
    ).toBe(false);
  });
});
