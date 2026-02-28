import { describe, expect, it } from "vitest";

import { viatorTourPaths, viatorTours } from "./viatorTours";

describe("viatorTours", () => {
  it("keeps San Andreas Fault 2335P1 mapped to Engine3", () => {
    const posterChild = viatorTours.find(
      tour =>
        tour.viator.productCode === "2335P1" &&
        tour.slug.includes("san-andreas-fault-jeep-tour-from-palm-springs")
    );

    expect(posterChild?.engine).toBe("engine3");
    expect(posterChild?.bookingProvider).toBe("viator");
  });

  it("maps 6740JTREE to the Palm Springs Engine3 route", () => {
    const jTree = viatorTours.find(
      tour =>
        tour.viator.productCode === "6740JTREE" &&
        tour.destination.city === "palm-springs" &&
        tour.slug === "joshua-tree-hummer-adventure-from-palm-desert"
    );

    expect(jTree?.engine).toBe("engine3");
    expect(jTree?.bookingProvider).toBe("viator");

    expect(viatorTourPaths).toContain(
      "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree"
    );
  });
});
