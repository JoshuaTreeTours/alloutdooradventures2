import { describe, expect, it } from "vitest";
import { cleanLandmarkText } from "./cleanLandmarkText";

describe("cleanLandmarkText", () => {
  it("removes canned dataset and article boilerplate", () => {
    const cleaned = cleanLandmarkText(
      "The city has a major waterfront park. Coverage for this landmark includes key facts. The same article set references linked sources. Distinct article language appears in this paragraph."
    );

    expect(cleaned).toBe("The city has a major waterfront park.");
  });
});
