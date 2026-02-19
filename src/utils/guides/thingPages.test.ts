import { describe, expect, it } from "vitest";

import { buildThingToDoPath, resolveThingPage } from "./thingPages";

describe("thingPages", () => {
  it("builds stable thing-to-do paths from titles", () => {
    expect(
      buildThingToDoPath({
        countrySlug: "us",
        regionSlug: "new-york",
        citySlug: "new-york",
        thingTitle: "Explore Central Park",
      })
    ).toBe("/guides/us/new-york/new-york/explore-central-park");
  });

  it("resolves New York attractions by slug", () => {
    const resolved = resolveThingPage({
      countrySlug: "us",
      regionSlug: "new-york",
      citySlug: "new-york",
      thingSlug: "explore-central-park",
    });

    expect(resolved?.thing.title).toBe("Explore Central Park");
    expect(resolved?.sourceUrl).toContain("Central_Park");
  });

  it("resolves Portland attractions by slug", () => {
    const resolved = resolveThingPage({
      countrySlug: "us",
      regionSlug: "oregon",
      citySlug: "portland",
      thingSlug: "explore-washington-park",
    });

    expect(resolved?.thing.title).toBe("Explore Washington Park");
  });
});
