import { describe, expect, it } from "vitest";

import {
  detectEngine6LegacyCollisions,
  assertEngine6CollisionPolicy,
  assertEngine6ReplacementModePolicy,
} from "./collisionGuard";
import { engine6ResolvedTours } from "./registry";
import type { Engine6OverlapReplacementConfig } from "./routes";

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

  it("enforces overlap replacement canonical slug and Viator CTA ownership", () => {
    expect(() => assertEngine6ReplacementModePolicy(engine6ResolvedTours)).not.toThrow();

    const tour = engine6ResolvedTours.find(entry => entry.productCode === "414460P1");
    expect(tour).toBeDefined();

    expect(() =>
      assertEngine6ReplacementModePolicy(
        [{ ...tour!, canonicalPath: "/destinations/new-york/new-york/tours/new-slug" }],
        [
          {
            productCode: "414460P1",
            canonicalPath: "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491",
          },
        ]
      )
    ).toThrow(/changed public slug/i);
  });

  it("accepts replacement mode mapping for 3156P13 on the existing Best of NYC slug", () => {
    const tour = engine6ResolvedTours.find(entry => entry.productCode === "3156P13");
    expect(tour).toBeDefined();
    expect(tour?.canonicalPath).toBe(
      "/destinations/new-york/new-york/tours/best-of-nyc-electric-bike-tour-202168"
    );
    expect(tour?.bookingUrl).toContain("viator.com");
    expect(tour?.bookingUrl.endsWith("/book")).toBe(false);
  });

  it("fails clearly if overlap replacement is configured without a legacy page", () => {
    const config: Engine6OverlapReplacementConfig = {
      productCode: "414460P1",
      canonicalPath: "/destinations/new-york/new-york/tours/not-a-real-legacy-page",
    };

    expect(() =>
      assertEngine6ReplacementModePolicy(engine6ResolvedTours, [config])
    ).toThrow(/requires a known legacy page/i);
  });
});
