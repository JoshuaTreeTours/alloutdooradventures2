import { describe, expect, it } from "vitest";

import { viatorTours } from "./viatorTours";

describe("viatorTours", () => {
  it("maps 6740JTREE to the Engine3 canonical Palm Springs route", () => {
    const tour = viatorTours.find(
      item => item.viator.productCode === "6740JTREE"
    );

    expect(tour?.engine).toBe("engine3");
    expect(tour?.bookingProvider).toBe("viator");
    expect(tour?.slug).toBe("joshua-tree-hummer-adventure-from-palm-desert");
    expect(tour?.destination.state).toBe("california");
    expect(tour?.destination.city).toBe("palm-springs");
    expect(tour?.viator.url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE"
    );
    expect(tour?.viator.heroImageOverrideUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1"
    );
  });

  it("keeps product code additions scoped to the known Engine3 set", () => {
    const productCodes = viatorTours
      .map(tour => tour.viator.productCode)
      .sort();

    expect(productCodes).toEqual(["2335P1", "6740JTREE"]);
  });
});
