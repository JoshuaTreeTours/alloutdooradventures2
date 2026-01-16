import { describe, expect, it } from "vitest";

import { normalizeBookingUrl } from "./import-tours-from-csv";

describe("normalizeBookingUrl", () => {
  it("adds branding=no when missing and preserves existing params", () => {
    const input =
      "https://fareharbor.com/embeds/book/red-jeep/items/34849/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes";
    const normalized = normalizeBookingUrl(input);
    const url = new URL(normalized);

    expect(url.hostname).toBe("fareharbor.com");
    expect(url.searchParams.get("branding")).toBe("no");
    expect(url.searchParams.get("asn-ref")).toBe("alloutdooradventures");
    expect(url.searchParams.get("ref")).toBe("alloutdooradventures");
    expect(url.searchParams.get("bookable-only")).toBe("yes");
  });

  it("keeps existing branding params intact", () => {
    const input =
      "https://fareharbor.com/embeds/book/red-jeep/items/34849/?branding=yes&asn=fhdn";
    const normalized = normalizeBookingUrl(input);
    const url = new URL(normalized);

    expect(url.searchParams.get("branding")).toBe("yes");
    expect(url.searchParams.get("asn")).toBe("fhdn");
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
