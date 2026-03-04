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
  });

  it("includes Palm Springs paragon entries and Santa Barbara discovery entries", () => {
    const productCodes = viatorTours
      .map(tour => tour.viator.productCode)
      .sort();

    expect(productCodes).toEqual([
      "117795P1",
      "13055P2",
      "17960P4",
      "21431P12",
      "2335P1",
      "3351P15",
      "347292P8",
      "56236P7",
      "6740JTREE",
    ]);
  });

  it("keeps 2335P1 as the first Engine3 paragon entry", () => {
    expect(viatorTours[0]?.viator.productCode).toBe("2335P1");
  });

  it("includes Santa Barbara wine and sailing routes with canonical d4372 URLs", () => {
    const sunsetSail = viatorTours.find(
      item => item.viator.productCode === "17960P4"
    );
    const wineTour = viatorTours.find(
      item => item.viator.productCode === "347292P8"
    );

    expect(sunsetSail?.destination.city).toBe("santa-barbara");
    expect(sunsetSail?.viator.url).toContain("/d4372-17960P4");
    expect(wineTour?.destination.city).toBe("santa-barbara");
    expect(wineTour?.viator.url).toContain("/d4372-347292P8");
  });
});
