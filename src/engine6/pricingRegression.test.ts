import { describe, expect, it } from "vitest";

import { engine6ResolvedTours } from "./registry";

describe("engine6 pricing regression coverage", () => {
  it("keeps Mount Titlis priced in the bundled engine6 registry", () => {
    const mountTitlis = engine6ResolvedTours.find(
      tour => tour.productCode === "3885SW303BS"
    );

    expect(mountTitlis).toBeDefined();
    expect(mountTitlis?.priceAmount).toBe(241.82);
    expect(mountTitlis?.priceFormatted).toBe("From $241.82");
  });
});
