import { describe, expect, it } from "vitest";

import {
  ENGINE6_SOURCE_OF_TRUTH_API_DRIVEN,
  ENGINE6_SOURCE_OF_TRUTH_FIXTURE_AUTHORED,
  assertEngine6FixtureSourceOfTruth,
  getEngine6SourceOfTruthMode,
  validateEngine6FixtureSourceOfTruth,
} from "./sourceOfTruthPolicy";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

describe("engine6 source-of-truth policy", () => {
  it("uses explicit shared API-driven designation for validation fixtures", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES[0]!;

    expect(getEngine6SourceOfTruthMode(fixture)).toBe(
      ENGINE6_SOURCE_OF_TRUTH_API_DRIVEN
    );
  });

  it("fails loudly when API-driven fixtures include forbidden authored non-hero fields", () => {
    const base = ENGINE6_VALIDATION_FIXTURES[0]!;
    const violatingFixture = {
      ...base,
      sourceOfTruth: {
        ...base.sourceOfTruth,
        mode: ENGINE6_SOURCE_OF_TRUTH_API_DRIVEN,
        authoredNonHeroContent: {
          title: "manual title override",
          itinerary: [{ title: "manual stop" }],
          meetingPoint: "manual meeting point",
        },
      },
    };

    const violations = validateEngine6FixtureSourceOfTruth(violatingFixture);

    expect(violations[0]).toContain("source-of-truth violation");
    expect(violations[0]).toContain("title");
    expect(violations[0]).toContain("itinerary");
    expect(violations[0]).toContain("meetingPoint");
    expect(() => assertEngine6FixtureSourceOfTruth(violatingFixture)).toThrow(
      /source-of-truth violation/
    );
  });

  it("does not break legacy fixture-authored specimens", () => {
    const base = ENGINE6_VALIDATION_FIXTURES[0]!;
    const legacyFixture = {
      ...base,
      sourceOfTruth: {
        mode: ENGINE6_SOURCE_OF_TRUTH_FIXTURE_AUTHORED,
        authoredNonHeroContent: {
          title: "legacy title",
          itinerary: [{ title: "legacy stop" }],
        },
      },
    };

    expect(validateEngine6FixtureSourceOfTruth(legacyFixture)).toEqual([]);
    expect(() => assertEngine6FixtureSourceOfTruth(legacyFixture)).not.toThrow();
  });
});
