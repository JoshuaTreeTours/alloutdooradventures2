import { describe, expect, it } from "vitest";
import { isEngine6PilotRoute } from "./routes";

describe("isEngine6PilotRoute", () => {
  it("matches only the canonical santa barbara pilot route", () => {
    expect(
      isEngine6PilotRoute(
        "california",
        "santa-barbara",
        "epic-zipline-tour-over-the-santa-ynez-valley-421920p2"
      )
    ).toBe(true);

    expect(
      isEngine6PilotRoute(
        "california",
        "santa-barbara",
        "some-other-tour-123"
      )
    ).toBe(false);
  });
});
