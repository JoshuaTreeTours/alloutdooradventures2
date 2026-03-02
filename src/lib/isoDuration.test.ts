import { describe, expect, it } from "vitest";

import { toIsoDuration } from "./isoDuration";

describe("toIsoDuration", () => {
  it("converts supported duration strings", () => {
    expect(toIsoDuration("15 minutes")).toBe("PT15M");
    expect(toIsoDuration("3 hours")).toBe("PT3H");
    expect(toIsoDuration("1 hour 30 minutes")).toBe("PT1H30M");
  });

  it("returns undefined for unsupported formats", () => {
    expect(toIsoDuration("about half a day")).toBeUndefined();
  });
});
