import { describe, expect, it } from "vitest";

import { getCityBySlugs, getStateBySlug } from "./destinations";

describe("Mississippi destination wiring", () => {
  it("registers Mississippi and Natchez as first-class destination metadata", () => {
    const state = getStateBySlug("mississippi");
    const city = getCityBySlugs("mississippi", "natchez");

    expect(state?.isFallback).not.toBe(true);
    expect(state?.name).toBe("Mississippi");
    expect(city?.name).toBe("Natchez");
  });
});
