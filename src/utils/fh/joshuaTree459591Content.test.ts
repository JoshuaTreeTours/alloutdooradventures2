import { describe, expect, it } from "vitest";
import { getJoshuaTree459591Override } from "./joshuaTree459591Content";

describe("Joshua Tree 459591 override content", () => {
  it("builds override content from FareHarbor fixture", () => {
    const override = getJoshuaTree459591Override(
      "/destinations/california/joshua-tree/tours/hike-and-climb-459591"
    );

    expect(override).not.toBeNull();
    expect(override?.heroPriceText).toContain("$229");
    expect(override?.durationISO).toBe("PT4H");
    expect(override?.whatYoullExperience).toHaveLength(4);
    expect(override?.highlights.length).toBeGreaterThanOrEqual(8);
    expect(override?.faqs).toHaveLength(5);
    expect(override?.meetingPoint?.city).toBe("Joshua Tree");
  });
});
