import { describe, expect, it } from "vitest";

import { detectRental } from "./detectRental";

describe("detectRental", () => {
  it("returns rental when rental keywords are present", () => {
    expect(detectRental("Half Day Kayak Rental")).toBe("rental");
    expect(detectRental("City E-Bike Rental")).toBe("rental");
  });

  it("returns tour when no rental keywords are present", () => {
    expect(detectRental("Guided Desert Jeep Tour")).toBe("tour");
    expect(detectRental("City E-Bike Adventure")).toBe("tour");
  });

  it("keeps guided rental-titled tours classified as tours", () => {
    expect(detectRental("Guided E-Bike Rental Tour")).toBe("tour");
  });
});
