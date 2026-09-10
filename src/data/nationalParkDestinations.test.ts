import { describe, expect, it } from "vitest";

import {
  NATIONAL_PARK_DESTINATIONS,
  getNationalParkDestination,
  getNationalParkDestinationsByState,
} from "./nationalParkDestinations";
import { getNationalParkGuideClassification } from "./nationalParkGuideClassifications";
import { resolveGuidePlaceClassification } from "./resolveGuidePlaceClassification";
import { getStateCityOptions } from "./stateCityOptions";

describe("national park destination registry", () => {
  it("keeps every national park route unique", () => {
    const keys = NATIONAL_PARK_DESTINATIONS.map(
      park => `${park.stateSlug}/${park.citySlug}`
    );

    expect(NATIONAL_PARK_DESTINATIONS).toHaveLength(14);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("preserves canonical route decisions", () => {
    expect(getNationalParkDestination("california", "yosemite")?.name).toBe(
      "Yosemite National Park"
    );
    expect(
      getNationalParkDestination("montana", "glacier-national-park")?.name
    ).toBe("Glacier National Park");
    expect(
      getNationalParkDestinationsByState("utah").map(park => park.citySlug)
    ).toEqual([
      "arches-national-park",
      "bryce-canyon-national-park",
      "canyonlands-national-park",
      "zion-national-park",
    ]);
  });

  it("classifies every registered park as a verified national park", () => {
    for (const park of NATIONAL_PARK_DESTINATIONS) {
      const direct = getNationalParkGuideClassification(
        park.stateSlug,
        park.citySlug
      );
      const resolved = resolveGuidePlaceClassification(
        park.stateSlug,
        park.citySlug,
        park.name
      );

      expect(direct).toMatchObject({
        placeType: "national-park",
        verified: true,
        associatedProtectedArea: {
          name: park.name,
          type: "national-park",
          managingAuthority: "National Park Service",
        },
      });
      expect(resolved).toEqual(direct);
      expect(direct?.verificationSources).toContain(park.npsUrl);
    }
  });

  it("adds parks to each state's city/destination options under canonical names", () => {
    for (const park of NATIONAL_PARK_DESTINATIONS) {
      const options = getStateCityOptions(park.stateSlug);
      expect(options).toContainEqual({
        name: park.name,
        slug: park.citySlug,
      });
      expect(options.filter(option => option.slug === park.citySlug)).toHaveLength(
        1
      );
    }
  });

  it("does not reclassify the Joshua Tree gateway community as the park", () => {
    expect(resolveGuidePlaceClassification("california", "joshua-tree")).toMatchObject({
      placeType: "gateway-community",
      verified: true,
      associatedProtectedArea: {
        name: "Joshua Tree National Park",
        type: "national-park",
      },
    });
  });
});
