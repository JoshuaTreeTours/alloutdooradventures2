import { describe, expect, it } from "vitest";
import fixture from "../../../data/engine6/viator/421920P2.product";
import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";

describe("mapViatorToEngine6PageData", () => {
  it("maps pilot payload and preserves non-zero price", () => {
    const page = mapViatorToEngine6PageData({
      product: fixture as Record<string, unknown>,
    });
    expect(page.productCode).toBe("421920P2");
    expect(page.fromPrice).toBe("$139.00");
    expect(page.itinerary.length).toBeGreaterThan(0);
  });

  it("throws when price is zero", () => {
    const broken = {
      ...(fixture as Record<string, unknown>),
      priceFrom: "0.00",
    };

    expect(() => mapViatorToEngine6PageData({ product: broken })).toThrow(
      /non-zero price/i
    );
  });
});
