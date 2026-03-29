import { describe, expect, it } from "vitest";

import { detectEngine6LegacyCollisions, assertEngine6CollisionPolicy } from "./collisionGuard";
import { engine6ResolvedTours } from "./registry";

describe("engine6 collision guard", () => {
  it("flags Yosemite as an explicit replacement for a legacy collision", () => {
    const yosemite = engine6ResolvedTours.find(
      tour => tour.productCode === "36001P1"
    );

    expect(yosemite).toBeDefined();

    const collisions = detectEngine6LegacyCollisions([yosemite!]);
    expect(collisions).toHaveLength(1);
    expect(collisions[0]?.collidesWithEngine4).toBe(true);
    expect(collisions[0]?.explicitlyReplaced).toBe(true);
  });

  it("throws when a collision is not explicitly replaced", () => {
    const yosemite = engine6ResolvedTours.find(
      tour => tour.productCode === "36001P1"
    );

    expect(() =>
      assertEngine6CollisionPolicy([
        {
          ...yosemite!,
          canonicalPath:
            "/destinations/california/san-francisco/tours/small-group-yosemite-tour-from-san-francisco-3454_b0016",
        },
      ])
    ).toThrow(/collision detected/i);
  });
});
