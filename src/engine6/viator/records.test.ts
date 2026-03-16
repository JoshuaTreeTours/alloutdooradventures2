import { describe, expect, it } from "vitest";

import {
  engine6HiloVolcanoRecord,
  getEngine6PilotFallbackListingItem,
  getEngine6RecordBySlug,
} from "./records";

describe("engine6 records", () => {
  it("matches the exact pilot slug", () => {
    expect(
      getEngine6RecordBySlug(engine6HiloVolcanoRecord.slug)?.productCode
    ).toBe("11069P1");
  });

  it("builds a canonical fallback listing card", () => {
    const item = getEngine6PilotFallbackListingItem();
    expect(item.href).toBe(engine6HiloVolcanoRecord.canonicalPath);
    expect(item.title).toContain("Hawaii Volcanoes National Park");
  });
});
