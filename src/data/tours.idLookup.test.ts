import { describe, expect, it } from "vitest";

import { extractTourIdFromSlug, getTourById } from "./tours";

describe("tour id lookup", () => {
  it("extracts id from destination slug segments", () => {
    expect(
      extractTourIdFromSlug("boulder-e-bike-art-and-nature-tour-628917")
    ).toBe("628917");
  });

  it("resolves tours by numeric id suffix", () => {
    const tour = getTourById("628917");
    expect(tour).not.toBeNull();
    expect(tour?.slug.endsWith("-628917")).toBe(true);
  });

  it("returns null for unknown id", () => {
    expect(getTourById("this-does-not-exist")).toBeNull();
  });
});
