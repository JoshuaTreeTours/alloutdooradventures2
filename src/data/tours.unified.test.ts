import { describe, expect, it } from "vitest";

import { getToursByCity, getToursByCityUnified } from "./tours";

describe("getToursByCityUnified Palm Springs dedupe", () => {
  it("dedupes viator tours by productCode and keeps Engine3 versions", () => {
    const tours = getToursByCityUnified("california", "palm-springs");

    const viator = tours.filter(
      entry => entry.tour.bookingProvider === "viator"
    );
    const byCode = new Map<string, (typeof viator)[number]>();

    for (const entry of viator) {
      const code = entry.tour.productCode;
      if (code) {
        expect(byCode.has(code)).toBe(false);
        byCode.set(code, entry);
      }
    }

    expect(byCode.get("2335P1")?.tour.engine).toBe("engine3");
    expect(byCode.get("3351P15")?.tour.engine).toBe("engine3");
    expect(byCode.get("6740JTREE")?.tour.engine).toBe("engine3");
  });

  it("does not return blank listing images for Palm Springs viator cards", () => {
    const tours = getToursByCityUnified("california", "palm-springs");
    const viator = tours.filter(
      entry => entry.tour.bookingProvider === "viator"
    );

    for (const entry of viator) {
      expect(
        (entry.tour.primaryImageUrl ?? entry.tour.heroImage).trim().length
      ).toBeGreaterThan(0);
    }
  });
});

describe("engine6 canonical slug winner dedupe", () => {
  it("keeps only one Brooklyn Bridge and Waterfront Bike Tour listing in New York and prefers Engine6", () => {
    const unified = getToursByCityUnified("new-york", "new-york").filter(
      entry =>
        entry.href ===
        "/destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853"
    );

    expect(unified).toHaveLength(1);
    expect(unified[0]?.tour.engine).toBe("engine6");
    expect(unified[0]?.tour.productCode).toBe("233384P2");
  });

  it("removes legacy versions with the same canonical slug from base city tour collections", () => {
    const cityTours = getToursByCity("new-york", "new-york").filter(
      tour => tour.slug === "brooklyn-bridge-and-waterfront-bike-tour-264853"
    );

    expect(cityTours).toHaveLength(1);
    expect(cityTours[0]?.engine).toBe("engine6");
    expect(cityTours[0]?.productCode).toBe("233384P2");
  });

  it("keeps only one 1 Hour Central Park Pedicab Tour listing in New York and prefers Engine6", () => {
    const unified = getToursByCityUnified("new-york", "new-york").filter(
      entry =>
        entry.href ===
        "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491"
    );

    expect(unified).toHaveLength(1);
    expect(unified[0]?.tour.engine).toBe("engine6");
    expect(unified[0]?.tour.productCode).toBe("414460P1");
  });

  it("removes legacy 1 Hour Central Park Pedicab Tour entries from base city collections", () => {
    const cityTours = getToursByCity("new-york", "new-york").filter(
      tour => tour.slug === "1-hour-central-park-pedicab-tour-27491"
    );

    expect(cityTours).toHaveLength(1);
    expect(cityTours[0]?.engine).toBe("engine6");
    expect(cityTours[0]?.productCode).toBe("414460P1");
  });
});
