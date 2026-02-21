import { describe, expect, it } from "vitest";
import { assertNoBoilerplate, hasBoilerplate } from "./wikiNoBoilerplate";

describe("wikiNoBoilerplate", () => {
  it("detects banned boilerplate phrases", () => {
    expect(hasBoilerplate("One of the most valuable things to do in town")).toBe(
      true
    );
    expect(hasBoilerplate("This museum is in downtown Bozeman.")).toBe(false);
  });

  it("throws when boilerplate is present", () => {
    expect(() =>
      assertNoBoilerplate("Travelers comparing attractions often rank this stop.")
    ).toThrow();
  });
});
