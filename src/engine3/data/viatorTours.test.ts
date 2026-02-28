import { describe, expect, it } from "vitest";

import { viatorTours } from "./viatorTours";

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
});
