import { describe, expect, it } from "vitest";

import {
  resolveDestinationCountrySlug,
  resolveDestinationGuideHref,
} from "./guideResolver";

describe("international destination guide routing", () => {
  it("uses Canada instead of a province slug as the international country", () => {
    expect(
      resolveDestinationCountrySlug({
        stateSlug: "alberta",
        countrySlug: "alberta",
        countryName: "Canada",
      })
    ).toBe("canada");
  });

  it("routes Calgary inventory to the canonical Canada city guide", () => {
    expect(
      resolveDestinationGuideHref({
        stateSlug: "alberta",
        citySlug: "calgary",
        countrySlug: "alberta",
        countryName: "Canada",
        cityName: "Calgary",
      })
    ).toEqual({
      href: "/guides/world/canada/calgary",
      isInternational: true,
    });
  });
});
