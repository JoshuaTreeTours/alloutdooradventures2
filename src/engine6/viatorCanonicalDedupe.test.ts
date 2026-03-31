import { describe, expect, it } from "vitest";

import {
  resolveViatorCanonicalDedupe,
  viatorCanonicalDedupeEntries,
} from "./viatorCanonicalDedupe";

describe("Viator canonical dedupe registry", () => {
  it("maps 5356P12 to the existing FareHarbor-owned Balboa Park canonical route", () => {
    const mapping = resolveViatorCanonicalDedupe("5356P12");

    expect(mapping).not.toBeNull();
    expect(mapping?.canonicalPath).toBe(
      "/destinations/california/san-diego/tours/art-of-balboa-park-walking-tour-651385"
    );
    expect(mapping?.ctaOwner).toBe("fareharbor");
  });

  it("normalizes productCode case", () => {
    const uppercase = resolveViatorCanonicalDedupe("5356P12");
    const lowercase = resolveViatorCanonicalDedupe("5356p12");

    expect(lowercase).toEqual(uppercase);
  });

  it("keeps registry product codes unique", () => {
    const keys = viatorCanonicalDedupeEntries.map(entry => entry.productCode);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
