import { describe, expect, it } from "vitest";

import { extractMeetingPointText } from "./extractMeetingPointText";

describe("extractMeetingPointText", () => {
  it("prefers structured formattedAddress", () => {
    expect(
      extractMeetingPointText({
        structuredLocation: {
          formattedAddress:
            "1590 S Palm Canyon Dr, Palm Springs, CA 92264, USA",
          description: "Fallback",
        },
        fallbackText: "fallback text",
      })
    ).toBe("1590 S Palm Canyon Dr, Palm Springs, CA 92264, USA");
  });

  it("falls back to plain text when structured data is missing", () => {
    expect(
      extractMeetingPointText({
        structuredLocation: null,
        fallbackText: "1590 S Palm Canyon Dr, Palm Springs, CA 92264, USA",
      })
    ).toBe("1590 S Palm Canyon Dr, Palm Springs, CA 92264, USA");
  });
});
