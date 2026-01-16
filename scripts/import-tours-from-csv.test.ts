import { describe, expect, it } from "vitest";

import { normalizeBookingUrl } from "./import-tours-from-csv";

describe("normalizeBookingUrl", () => {
  it("forces branding=no and affiliate params for FareHarbor URLs", () => {
    const input =
      "https://fareharbor.com/embeds/book/red-jeep/items/34849/?asn=fhdn&asn-ref=old&ref=old&branding=yes&bookable-only=yes";
    const normalized = normalizeBookingUrl(input);
    const url = new URL(normalized);

    expect(url.hostname).toBe("fareharbor.com");
    expect(url.searchParams.get("branding")).toBe("no");
    expect(url.searchParams.get("asn-ref")).toBe("alloutdooradventures");
    expect(url.searchParams.get("ref")).toBe("alloutdooradventures");
    expect(url.searchParams.get("bookable-only")).toBe("yes");
  });

  it("preserves non-FareHarbor URLs", () => {
    const input = "https://example.com/path?foo=bar&baz=qux";
    expect(normalizeBookingUrl(input)).toBe(input);
  });

  it("throws when FareHarbor URL lacks item id", () => {
    const input = "https://fareharbor.com/embeds/book/red-jeep/?asn=fhdn";
    expect(() => normalizeBookingUrl(input)).toThrow(
      /FareHarbor URL missing item id/,
    );
  });
});
