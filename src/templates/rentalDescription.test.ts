import { describe, expect, it } from "vitest";

import { buildRentalDescription } from "./rentalDescription";

describe("buildRentalDescription", () => {
  it("uses rental-specific language and required terms", () => {
    const description = buildRentalDescription({
      equipment: "E-Bike Rentals",
      city: "San Diego",
      location: "California",
    });

    expect(description.toLowerCase()).toContain("self-guided");
    expect(description.toLowerCase()).toContain("equipment rental");
    expect(description.toLowerCase()).toContain("flexible duration");
    expect(description.toLowerCase()).toContain("pickup location");
  });

  it("never uses guided outdoor experience wording", () => {
    const description = buildRentalDescription({
      equipment: "Kayak Rental",
      city: "Austin",
      location: "Texas",
    });

    expect(description.toLowerCase()).not.toContain(
      "guided outdoor experience"
    );
  });
});
