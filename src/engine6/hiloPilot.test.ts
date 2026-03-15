import { describe, expect, it } from "vitest";

import { isEngine6HiloPilotRoute } from "./hiloPilot";

describe("isEngine6HiloPilotRoute", () => {
  it("matches only the configured Hilo pilot route", () => {
    expect(
      isEngine6HiloPilotRoute(
        "hawaii",
        "hilo",
        "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
      )
    ).toBe(true);

    expect(
      isEngine6HiloPilotRoute("hawaii", "hilo", "volcanoes-national-park-tour")
    ).toBe(false);
    expect(
      isEngine6HiloPilotRoute(
        "california",
        "santa-barbara",
        "epic-zipline-tour-over-the-santa-ynez-valley-421920p2"
      )
    ).toBe(false);
  });
});
