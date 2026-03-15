import { describe, expect, it } from "vitest";

import { isEngine6PilotTourRoute } from "./routes";

describe("isEngine6PilotTourRoute", () => {
  it("matches only canonical pilot route", () => {
    expect(
      isEngine6PilotTourRoute(
        "hawaii",
        "hilo",
        "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
      )
    ).toBe(true);

    expect(
      isEngine6PilotTourRoute("hawaii", "hilo", "discover-scuba-diving-17418")
    ).toBe(false);
    expect(
      isEngine6PilotTourRoute(
        "hawaii",
        "kona",
        "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
      )
    ).toBe(false);
  });
});
