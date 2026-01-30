import { describe, expect, it } from "vitest";
import { haversineMiles } from "./geo";

describe("haversineMiles", () => {
  it("returns zero for identical coordinates", () => {
    const distance = haversineMiles({ lat: 0, lng: 0 }, { lat: 0, lng: 0 });
    expect(distance).toBeCloseTo(0, 5);
  });

  it("returns a reasonable distance for one degree of longitude at the equator", () => {
    const distance = haversineMiles({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(distance).toBeGreaterThan(68);
    expect(distance).toBeLessThan(71);
  });
});
