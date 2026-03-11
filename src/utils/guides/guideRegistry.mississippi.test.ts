import { describe, expect, it } from "vitest";

import { getGuideRecord } from "./guideRegistry";

describe("guide registry Mississippi coverage", () => {
  it("resolves Natchez guide for state/city tour pages", () => {
    const guide = getGuideRecord("mississippi", "natchez");

    expect(guide).toBeDefined();
    expect(guide?.dataImport.city).toBe("Natchez");
  });
});
