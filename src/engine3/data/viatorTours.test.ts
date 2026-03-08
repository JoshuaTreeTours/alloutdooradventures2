import { describe, expect, it } from "vitest";

import { viatorTours } from "./viatorTours";

describe("viatorTours", () => {
  it("maps 6740P7 to the Engine3 canonical Palm Springs route", () => {
    const tour = viatorTours.find(item => item.viator.productCode === "6740P7");

    expect(tour?.engine).toBe("engine3");
    expect(tour?.bookingProvider).toBe("viator");
    expect(tour?.slug).toBe("joshua-tree-backroads-hummer-h2-tour");
    expect(tour?.destination.state).toBe("california");
    expect(tour?.destination.city).toBe("palm-springs");
    expect(tour?.viator.url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7"
    );
  });

  it("keeps product code additions scoped to the known Engine3 set", () => {
    const productCodes = viatorTours
      .map(tour => tour.viator.productCode)
      .sort();

    expect(productCodes).toEqual(["2335P1", "3351P15", "6740P7"]);
  });

  it("sets 2335P1 as the first Engine3 paragon entry", () => {
    expect(viatorTours[0]?.viator.productCode).toBe("2335P1");
  });

  it("maps 3351P15 to the Palm Springs Indian Canyons Bike and Hike route", () => {
    const tour = viatorTours.find(
      item => item.viator.productCode === "3351P15"
    );

    expect(tour?.slug).toBe("palm-springs-indian-canyons-bike-and-hike");
    expect(tour?.destination.state).toBe("california");
    expect(tour?.destination.city).toBe("palm-springs");
    expect(tour?.viator.url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Palm-Springs-Indian-Canyons-Bike-and-Hike/d648-3351P15"
    );
  });
});
