import { describe, expect, it } from "vitest";

import {
  classifyFareHarborBookingPageResponse,
  isStageBBookingPageNotFound,
} from "./stageBTerminalBookingPages";

describe("Stage B FareHarbor terminal booking-page rule", () => {
  it("classifies permanent not-found responses as terminal", () => {
    expect(classifyFareHarborBookingPageResponse({ status: 404 })).toBe(
      "BOOKING_PAGE_NOT_FOUND"
    );
    expect(classifyFareHarborBookingPageResponse({ status: 410 })).toBe(
      "BOOKING_PAGE_NOT_FOUND"
    );
    expect(
      classifyFareHarborBookingPageResponse({
        status: 200,
        visibleText: "Page not found",
      })
    ).toBe("BOOKING_PAGE_NOT_FOUND");
  });

  it("does not classify transient or ambiguous failures as terminal", () => {
    for (const status of [408, 425, 429, 500, 502, 503, 504]) {
      expect(classifyFareHarborBookingPageResponse({ status })).toBe(
        "TRANSIENT_FAILURE"
      );
    }
    expect(
      classifyFareHarborBookingPageResponse({
        status: null,
        networkError: true,
      })
    ).toBe("TRANSIENT_FAILURE");
    expect(classifyFareHarborBookingPageResponse({ status: 403 })).toBe(
      "INDETERMINATE"
    );
  });

  it("limits terminal removals to the two affected proof products", () => {
    expect(isStageBBookingPageNotFound("595701")).toBe(true);
    expect(isStageBBookingPageNotFound("engine2-612500")).toBe(true);
    expect(isStageBBookingPageNotFound("145208")).toBe(false);
  });
});
