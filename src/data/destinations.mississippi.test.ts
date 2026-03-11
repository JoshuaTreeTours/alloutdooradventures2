import { describe, expect, it } from "vitest";

import { getCityBySlugs, getStateBySlug } from "./destinations";

describe("Mississippi destination wiring", () => {
  it("registers Mississippi with Natchez and Bay Saint Louis destination metadata", () => {
    const state = getStateBySlug("mississippi");
    const natchez = getCityBySlugs("mississippi", "natchez");
    const baySaintLouis = getCityBySlugs("mississippi", "bay-saint-louis");

    expect(state?.isFallback).not.toBe(true);
    expect(state?.name).toBe("Mississippi");
    expect(natchez?.name).toBe("Natchez");
    expect(baySaintLouis?.name).toBe("Bay Saint Louis");
  });
});
