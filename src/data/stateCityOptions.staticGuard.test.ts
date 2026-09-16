import { describe, expect, it } from "vitest";
import { getStateCityOptions } from "./stateCityOptions";

describe("state city selector static geography guard", () => {
  it("returns only California-owned static cities for California", () => {
    const california = getStateCityOptions("california");
    expect(california.some(city => city.slug === "puerto-vallarta")).toBe(false);
    expect(california.some(city => city.slug === "phoenix")).toBe(false);
    expect(california.some(city => city.slug === "portsmouth")).toBe(false);
  });
});
