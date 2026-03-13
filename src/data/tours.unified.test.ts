import { describe, expect, it } from "vitest";

import { getToursByCityUnified } from "./tours";

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

  it("includes promoted Engine5 tours in Los Angeles listings", () => {
    const tours = getToursByCityUnified("california", "los-angeles");
    const engine5Entry = tours.find(
      entry => entry.tour.productCode === "132218P209"
    );

    expect(engine5Entry?.href).toBe(
      "/destinations/california/los-angeles/tours/best-yosemite-national-park-and-kings-canyon-national-park-2-day-tour-from-la"
    );
    expect(engine5Entry?.tour.heroImage).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg"
    );
  });
});
